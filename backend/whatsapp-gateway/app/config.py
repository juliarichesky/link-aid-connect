from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: str = "local"

    quarkus_api_url: str = "http://localhost:8080"
    public_base_url: str | None = None
    request_timeout_seconds: float = 10.0

    twilio_account_sid: str | None = None
    twilio_auth_token: str | None = None
    twilio_whatsapp_from: str = "whatsapp:+14155238886"
    twilio_validate_signature: bool = False

    watson_enabled: bool = True
    watson_api_key: str | None = None
    watson_url: str | None = None
    watson_assistant_id: str | None = None
    watson_environment_id: str | None = None
    watson_version: str = "2024-08-25"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def quarkus_webhook_url(self) -> str:
        return f"{self.quarkus_api_url.rstrip('/')}/integracoes/watson/tickets"

    @property
    def watson_configured(self) -> bool:
        return all(
            [
                self.watson_enabled,
                self.watson_api_key,
                self.watson_url,
                self.watson_assistant_id,
                self.watson_environment_id,
            ]
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()
