import json
import logging
from collections import OrderedDict
from typing import Any

import httpx

from app.config import Settings
from app.models import TriageResult, TwilioInboundMessage

logger = logging.getLogger(__name__)

DENTIST_VOLUNTEER_URL = "https://turmadobem.org.br/como-ser-dentista-voluntario/"
DENTIST_VOLUNTEER_REPLY = (
    "Obrigada pelo interesse em ser Dentista do Bem. "
    "Para se cadastrar como dentista voluntario, acesse o formulario oficial da Turma do Bem: "
    f"{DENTIST_VOLUNTEER_URL}"
)
DONATION_REPLY = (
    "Que bom saber que voce quer apoiar a Turma do Bem. "
    "Posso te orientar por aqui sobre formas de doacao e direcionar para os canais oficiais da organizacao."
)
PARTNERSHIP_REPLY = (
    "Obrigada pelo interesse em parceria. "
    "Me conte por aqui o nome da instituicao, a cidade e o tipo de parceria para eu organizar as informacoes."
)
HUMAN_HANDOFF_REPLY = (
    "Recebemos sua mensagem e abrimos uma triagem no LinkAid. "
    "Nossa equipe vai analisar e continuar o atendimento."
)
AI_CONTINUATION_REPLY = (
    "Ainda nao consegui identificar totalmente sua solicitacao. "
    "Me conte um pouco mais para eu te orientar pelo canal correto."
)


class ConversationMemory:
    def __init__(self, max_size: int = 500):
        self._items: OrderedDict[str, dict[str, Any]] = OrderedDict()
        self._max_size = max_size

    def get(self, key: str) -> dict[str, Any] | None:
        value = self._items.get(key)
        if value is not None:
            self._items.move_to_end(key)
        return value

    def set(self, key: str, value: dict[str, Any] | None) -> None:
        if value is None:
            return
        self._items[key] = value
        self._items.move_to_end(key)
        while len(self._items) > self._max_size:
            self._items.popitem(last=False)


class LocalTriageService:
    def triage(self, message: str) -> TriageResult:
        text = message.lower()
        priority = "MEDIA"
        classification = "SAUDE"
        intent = "saude"

        if _is_explicit_human_request(text):
            intent = "falar_atendente"
        elif any(word in text for word in ["dor", "urgente", "sangramento", "inchado", "emergencia"]):
            priority = "CRITICA"
            classification = "SAUDE"
            intent = "emergencia"
        elif any(word in text for word in ["agendar", "consulta", "retorno", "horario"]):
            priority = "ALTA"
            classification = "AGENDAMENTO"
            intent = "agendamento"
        elif any(word in text for word in ["doar", "doacao", "patrocinio"]):
            priority = "MEDIA"
            classification = "DOACAO"
            intent = "doacao"
        elif any(word in text for word in ["parceria", "empresa", "instituto"]):
            priority = "MEDIA"
            classification = "PARCERIA"
            intent = "parceria"
        elif any(
            word in text
            for word in [
                "voluntario",
                "voluntaria",
                "sou dentista",
                "odontologia",
                "consultorio",
                "cro",
                "atender pacientes",
                "ajudar",
            ]
        ):
            priority = "BAIXA"
            classification = "VOLUNTARIADO"
            intent = "voluntariado_dentista"

        human_handoff_required = _requires_human_handoff(intent, classification, message)
        reply_text = _reply_for_automated_audience(intent, classification) or _default_reply(human_handoff_required)
        return TriageResult(
            reply_text=reply_text,
            intent=intent,
            confidence=85.0,
            priority_code=priority,
            classification_code=classification,
            summary=_triage_summary("Triagem automatica", classification, priority),
            source="LOCAL_FALLBACK",
            human_handoff_required=human_handoff_required,
        )


class WatsonAssistantService:
    def __init__(self, settings: Settings, memory: ConversationMemory):
        self.settings = settings
        self.memory = memory
        self.local = LocalTriageService()
        self._assistant = None

    async def triage(self, inbound: TwilioInboundMessage) -> TriageResult:
        if not self.settings.watson_configured:
            return self.local.triage(inbound.body)

        try:
            return await self._triage_with_watson(inbound)
        except Exception:
            logger.exception("Watson Assistant failed. Falling back to local triage.")
            fallback = self.local.triage(inbound.body)
            return fallback.model_copy(update={"source": "WATSON_ERROR_FALLBACK"})

    async def _triage_with_watson(self, inbound: TwilioInboundMessage) -> TriageResult:
        assistant = self._get_assistant()
        user_id = inbound.clean_from or inbound.message_sid
        context = self.memory.get(user_id)

        payload: dict[str, Any] = {
            "assistant_id": self.settings.watson_assistant_id,
            "input": {
                "message_type": "text",
                "text": inbound.body,
            },
            "user_id": user_id,
        }
        if context:
            payload["context"] = context
        if self.settings.watson_environment_id:
            payload["environment_id"] = self.settings.watson_environment_id

        result = await _run_sync_watson_call(assistant, payload)
        self.memory.set(user_id, result.get("context"))

        output = result.get("output", {})
        generic = output.get("generic", [])
        intents = output.get("intents", [])

        reply_text = _extract_watson_text(generic)
        top_intent = intents[0] if intents else {}
        intent = top_intent.get("intent")
        confidence = _confidence_to_percent(top_intent.get("confidence"))
        classification = _classification_from_intent_or_text(intent, inbound.body)
        priority = _priority_from_intent_or_text(intent, inbound.body)

        human_handoff_required = _requires_human_handoff(intent, classification, inbound.body)
        fallback_reply = _default_reply(human_handoff_required)
        policy_reply = _reply_for_automated_audience(intent, classification)

        return TriageResult(
            reply_text=policy_reply or reply_text or fallback_reply,
            intent=intent,
            confidence=confidence,
            priority_code=priority,
            classification_code=classification,
            summary=_triage_summary("Triagem Watson", classification, priority),
            source="WATSON",
            human_handoff_required=human_handoff_required,
        )

    def _get_assistant(self):
        if self._assistant is not None:
            return self._assistant

        from ibm_cloud_sdk_core.authenticators import IAMAuthenticator
        from ibm_watson import AssistantV2

        authenticator = IAMAuthenticator(self.settings.watson_api_key)
        assistant = AssistantV2(
            version=self.settings.watson_version,
            authenticator=authenticator,
        )
        assistant.set_service_url(self.settings.watson_url)
        assistant.set_http_config({"timeout": self.settings.request_timeout_seconds})
        self._assistant = assistant
        return assistant


class QuarkusTicketClient:
    def __init__(self, settings: Settings):
        self.settings = settings

    async def create_ticket(self, inbound: TwilioInboundMessage, triage: TriageResult) -> dict[str, Any]:
        payload = {
            "externalId": inbound.message_sid,
            "origem": "TWILIO_WATSON",
            "from": inbound.clean_from,
            "nome": inbound.display_name,
            "body": inbound.body or _media_placeholder(inbound),
            "tipoContatoCodigo": _contact_type_from_triage(triage),
            "prioridadeCodigo": triage.priority_code,
            "classificacaoCodigo": triage.classification_code,
            "intent": triage.intent,
            "respostaIa": triage.reply_text,
            "confiancaIa": triage.confidence,
            "encaminharHumano": triage.human_handoff_required,
            "payload": json.dumps(
                {
                    "twilio": inbound.raw,
                    "triage": triage.model_dump(),
                },
                ensure_ascii=True,
            ),
        }

        async with httpx.AsyncClient(timeout=self.settings.request_timeout_seconds) as client:
            response = await client.post(self.settings.quarkus_webhook_url, json=payload)
            response.raise_for_status()
            return response.json()


async def _run_sync_watson_call(assistant: Any, payload: dict[str, Any]) -> dict[str, Any]:
    import anyio

    def call() -> dict[str, Any]:
        try:
            return assistant.message_stateless(**payload).get_result()
        except TypeError:
            legacy_payload = dict(payload)
            legacy_payload.pop("environment_id", None)
            return assistant.message_stateless(**legacy_payload).get_result()

    return await anyio.to_thread.run_sync(call)


def _extract_watson_text(generic: list[dict[str, Any]]) -> str:
    texts = [
        item.get("text", "").strip()
        for item in generic
        if item.get("response_type") == "text" and item.get("text")
    ]
    return "\n".join(text for text in texts if text)


def _confidence_to_percent(value: Any) -> float | None:
    if value is None:
        return None
    try:
        number = float(value)
    except (TypeError, ValueError):
        return None
    if 0 <= number <= 1:
        number *= 100
    return round(number, 2)


def _priority_from_intent_or_text(intent: str | None, message: str) -> str:
    base = f"{intent or ''} {message}".lower()
    if any(word in base for word in ["emerg", "dor", "urgente", "sangramento"]):
        return "CRITICA"
    if any(word in base for word in ["agend", "consulta", "tratamento"]):
        return "ALTA"
    if any(word in base for word in ["volunt", "feedback"]):
        return "BAIXA"
    return "MEDIA"


def _classification_from_intent_or_text(intent: str | None, message: str) -> str:
    base = f"{intent or ''} {message}".lower()
    if any(word in base for word in ["emerg", "dor", "sangramento"]):
        return "SAUDE"
    if "agend" in base or "consulta" in base:
        return "AGENDAMENTO"
    if "doa" in base or "patrocin" in base:
        return "DOACAO"
    if "parceria" in base or "empresa" in base or "instituto" in base:
        return "PARCERIA"
    if "volunt" in base:
        return "VOLUNTARIADO"
    if "feedback" in base:
        return "FEEDBACK"
    return "SAUDE"


def _reply_for_automated_audience(intent: str | None, classification: str) -> str | None:
    intent_value = (intent or "").lower()
    classification_value = (classification or "").upper()
    base = f"{intent_value} {classification_value}".upper()
    if intent_value == "voluntariado_dentista" or "VOLUNTARIADO" in base or "VOLUNTARIO" in base:
        return DENTIST_VOLUNTEER_REPLY
    if "DOACAO" in base or "DOADOR" in base:
        return DONATION_REPLY
    if "PARCERIA" in base or "PARCEIRO" in base:
        return PARTNERSHIP_REPLY
    return None


def _default_reply(human_handoff_required: bool) -> str:
    return HUMAN_HANDOFF_REPLY if human_handoff_required else AI_CONTINUATION_REPLY


def _is_explicit_human_request(text: str) -> bool:
    return any(
        term in text
        for term in [
            "atendente",
            "humano",
            "falar com uma pessoa",
            "conversar com uma pessoa",
            "colaborador",
            "equipe",
        ]
    )


def _requires_human_handoff(intent: str | None, classification: str, message: str) -> bool:
    intent_value = (intent or "").lower()
    classification_value = (classification or "").upper()
    if intent_value == "falar_atendente" or _is_explicit_human_request(message.lower()):
        return True

    if classification_value in {"DOACAO", "PARCERIA", "VOLUNTARIADO", "FEEDBACK"}:
        return False

    if intent_value in {"ajuda_apolonias", "ajuda_dentistas_do_bem", "emergencia_odontologica", "emergencia", "agendamento"}:
        return True

    if classification_value in {"EMERGENCIA", "AGENDAMENTO"}:
        return True

    text = message.lower()
    if any(term in text for term in ["triagem", "pedido de ajuda", "preciso de atendimento", "preciso de ajuda"]):
        return True

    return False


def _contact_type_from_triage(triage: TriageResult) -> str:
    base = f"{triage.classification_code} {triage.intent or ''} {triage.summary}".upper()
    if any(token in base for token in ["DOACAO", "DOADOR", "PATROCIN"]):
        return "DOADOR"
    if any(token in base for token in ["PARCERIA", "PARCEIRO", "EMPRESA", "INSTITUTO"]):
        return "PARCEIRO"
    if any(token in base for token in ["VOLUNTARIADO", "VOLUNTARIO", "VOLUNTARIA", "DENTISTA_VOLUNTARIO"]):
        return "VOLUNTARIO"
    return "SOLICITANTE"


def _triage_summary(prefix: str, classification: str, priority: str) -> str:
    label = "dentista voluntario" if classification == "VOLUNTARIADO" else classification
    return f"{prefix}: {label}. Prioridade {priority}."


def _media_placeholder(inbound: TwilioInboundMessage) -> str:
    if inbound.num_media > 0:
        return f"Mensagem com {inbound.num_media} anexo(s) recebida pelo WhatsApp."
    return "Mensagem sem texto recebida pelo WhatsApp."
