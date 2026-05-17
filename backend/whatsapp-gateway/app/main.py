import logging

import httpx
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import Response
from twilio.request_validator import RequestValidator
from twilio.twiml.messaging_response import MessagingResponse

from app.config import get_settings
from app.models import TwilioInboundMessage
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
    }


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

    protocol = ticket.get("protocolo") or f"#{ticket.get('idTicket', '')}".strip("#")
    reply = _build_twilio_reply(triage.reply_text, protocol)
    twiml = MessagingResponse()
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
