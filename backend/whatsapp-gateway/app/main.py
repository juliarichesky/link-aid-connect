import logging
import json
from typing import Any

import httpx
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import Response
from twilio.request_validator import RequestValidator
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException
from twilio.twiml.messaging_response import MessagingResponse

from app.config import get_settings
from app.models import TwilioInboundMessage, WhatsAppOutboundResponse
from app.services import ConversationMemory, QuarkusTicketClient, WatsonAssistantService

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

settings = get_settings()
memory = ConversationMemory()
watson_service = WatsonAssistantService(settings, memory)
quarkus_client = QuarkusTicketClient(settings)

app = FastAPI(
    title="LinkAid WhatsApp Gateway",
    version="1.0.0",
)


@app.get("/health")
async def health() -> dict[str, object]:
    return {
        "status": "ok",
        "env": settings.app_env,
        "quarkusApiUrl": settings.quarkus_api_url,
        "watsonConfigured": settings.watson_configured,
        "twilioSignatureValidation": settings.twilio_validate_signature,
        "twilioOutboundConfigured": _twilio_outbound_configured(),
    }


@app.post("/messages/whatsapp", response_model=WhatsAppOutboundResponse)
async def send_whatsapp_message(request: Request) -> WhatsAppOutboundResponse:
    if not _twilio_outbound_configured():
        raise HTTPException(
            status_code=500,
            detail="TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and TWILIO_WHATSAPP_FROM are required.",
        )

    payload = await _outbound_payload(request)
    to = _first_payload_value(payload, "to", "telefone", "phone", "from")
    body = _first_payload_value(payload, "body", "mensagem", "message", "text")
    if not to or not body:
        logger.warning("Invalid outbound WhatsApp payload: %s", payload)
        raise HTTPException(status_code=422, detail="Payload must include to and body.")

    to_number = _whatsapp_address(to)
    try:
        client = Client(settings.twilio_account_sid, settings.twilio_auth_token)
        sent = client.messages.create(
            from_=settings.twilio_whatsapp_from,
            to=to_number,
            body=body,
        )
    except TwilioRestException as error:
        logger.exception("Twilio rejected the outbound WhatsApp message.")
        raise HTTPException(status_code=502, detail=error.msg) from error
    except Exception as error:
        logger.exception("Could not send outbound WhatsApp message.")
        raise HTTPException(status_code=502, detail="Could not send WhatsApp message.") from error

    return WhatsAppOutboundResponse(
        sid=sent.sid,
        status=sent.status,
        to=to_number,
    )


@app.post("/webhooks/twilio/whatsapp")
async def receive_whatsapp_message(request: Request) -> Response:
    form = await request.form()
    form_data = {key: str(value) for key, value in form.items()}
    _validate_twilio_signature(request, form_data)

    inbound = TwilioInboundMessage.from_form(form_data)
    if not inbound.body and inbound.num_media == 0:
        raise HTTPException(status_code=400, detail="Twilio message has no Body or media.")

    triage = await watson_service.triage(inbound)

    try:
        ticket = await quarkus_client.create_ticket(inbound, triage)
    except httpx.HTTPStatusError as error:
        logger.exception("Quarkus rejected the ticket webhook.")
        raise HTTPException(
            status_code=502,
            detail=f"Quarkus API returned {error.response.status_code}.",
        ) from error
    except httpx.HTTPError as error:
        logger.exception("Could not reach Quarkus API.")
        raise HTTPException(status_code=502, detail="Could not reach Quarkus API.") from error

    twiml = MessagingResponse()
    if not _should_send_auto_reply(ticket):
        logger.info("Automatic WhatsApp reply skipped because human handoff is active.")
        return Response(content=str(twiml), media_type="application/xml")

    protocol = _ticket_protocol(ticket)
    reply = _build_twilio_reply(triage.reply_text, protocol)
    twiml.message(reply)

    return Response(content=str(twiml), media_type="application/xml")


def _validate_twilio_signature(request: Request, form_data: dict[str, str]) -> None:
    if not settings.twilio_validate_signature:
        return
    if not settings.twilio_auth_token:
        raise HTTPException(
            status_code=500,
            detail="TWILIO_AUTH_TOKEN is required when signature validation is enabled.",
        )

    signature = request.headers.get("X-Twilio-Signature", "")
    url = _public_request_url(request)
    validator = RequestValidator(settings.twilio_auth_token)
    if not validator.validate(url, form_data, signature):
        raise HTTPException(status_code=403, detail="Invalid Twilio signature.")


def _twilio_outbound_configured() -> bool:
    return bool(settings.twilio_account_sid and settings.twilio_auth_token and settings.twilio_whatsapp_from)


async def _outbound_payload(request: Request) -> dict[str, Any]:
    raw_body = await request.body()
    if not raw_body:
        logger.warning("Empty outbound WhatsApp payload.")
        raise HTTPException(status_code=400, detail="Empty JSON payload.")

    try:
        payload = json.loads(raw_body.decode("utf-8-sig"))
    except Exception as error:
        logger.warning("Invalid outbound WhatsApp raw payload: %r", raw_body[:500])
        raise HTTPException(status_code=400, detail="Invalid JSON payload.") from error

    if not isinstance(payload, dict):
        raise HTTPException(status_code=422, detail="Payload must be a JSON object.")
    return payload


def _first_payload_value(payload: dict[str, Any], *keys: str) -> str | None:
    for key in keys:
        value = payload.get(key)
        if value is not None and str(value).strip():
            return str(value).strip()
    return None


def _whatsapp_address(value: str) -> str:
    cleaned = value.strip()
    if cleaned.startswith("whatsapp:"):
        return cleaned
    return f"whatsapp:{cleaned}"


def _should_send_auto_reply(ticket: dict[str, Any]) -> bool:
    if "responderIa" in ticket:
        return bool(ticket.get("responderIa"))
    return True


def _ticket_protocol(ticket: dict[str, Any]) -> str | None:
    ticket_data = ticket.get("ticket") if isinstance(ticket.get("ticket"), dict) else ticket
    protocol = ticket.get("protocolo") or ticket_data.get("protocolo")
    if protocol:
        return str(protocol)

    ticket_id = ticket.get("idTicket") or ticket_data.get("idTicket")
    return f"#{ticket_id}".strip("#") if ticket_id else None


def _public_request_url(request: Request) -> str:
    if not settings.public_base_url:
        return str(request.url)

    url = f"{settings.public_base_url.rstrip('/')}{request.url.path}"
    if request.url.query:
        url = f"{url}?{request.url.query}"
    return url


def _build_twilio_reply(reply_text: str, protocol: str | None) -> str:
    if protocol:
        return f"{reply_text}\n\nProtocolo LinkAid: {protocol}"
    return reply_text
