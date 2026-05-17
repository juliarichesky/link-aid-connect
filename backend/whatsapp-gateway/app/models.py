from pydantic import BaseModel, Field


class TwilioInboundMessage(BaseModel):
    message_sid: str = Field(default="")
    account_sid: str = Field(default="")
    from_address: str = Field(default="")
    to_address: str = Field(default="")
    body: str = Field(default="")
    profile_name: str | None = None
    wa_id: str | None = None
    num_media: int = 0
    raw: dict[str, str] = Field(default_factory=dict)

    @classmethod
    def from_form(cls, data: dict[str, str]) -> "TwilioInboundMessage":
        return cls(
            message_sid=data.get("MessageSid", ""),
            account_sid=data.get("AccountSid", ""),
            from_address=data.get("From", ""),
            to_address=data.get("To", ""),
            body=data.get("Body", "").strip(),
            profile_name=data.get("ProfileName") or None,
            wa_id=data.get("WaId") or None,
            num_media=_safe_int(data.get("NumMedia")),
            raw=data,
        )

    @property
    def clean_from(self) -> str:
        return self.from_address.replace("whatsapp:", "", 1).strip()

    @property
    def display_name(self) -> str:
        return self.profile_name or self.wa_id or self.clean_from or "Contato WhatsApp"


class TriageResult(BaseModel):
    reply_text: str
    intent: str | None = None
    confidence: float | None = None
    priority_code: str
    classification_code: str
    summary: str
    source: str


def _safe_int(value: str | None) -> int:
    try:
        return int(value or "0")
    except ValueError:
        return 0
