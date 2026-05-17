# LinkAid WhatsApp Gateway

Servico Python/FastAPI que recebe mensagens do Twilio Sandbox para WhatsApp, consulta o Watson Assistant e encaminha a triagem para a API Quarkus do LinkAid.

## Fluxo

```text
WhatsApp -> Twilio Sandbox -> FastAPI -> Watson Assistant -> Quarkus -> Oracle -> Frontend
```

O Quarkus continua sendo o dono das regras de negocio e do banco. Este servico existe apenas como adaptador de integracao.

## Endpoints

- `GET /health`
- `POST /webhooks/twilio/whatsapp`

## Variaveis de ambiente

Copie `.env.example` para `.env` e preencha:

```text
QUARKUS_API_URL=http://localhost:8080
PUBLIC_BASE_URL=https://sua-url-publica.ngrok-free.app
TWILIO_VALIDATE_SIGNATURE=false
TWILIO_AUTH_TOKEN=
WATSON_ENABLED=true
WATSON_API_KEY=
WATSON_URL=
WATSON_ASSISTANT_ID=
WATSON_ENVIRONMENT_ID=
```

Para teste local rapido, `TWILIO_VALIDATE_SIGNATURE=false` evita bloqueio por assinatura enquanto a URL publica ainda muda a cada sessao.

## Rodando localmente

Instale Python 3.11 ou superior e execute:

```powershell
cd backend\whatsapp-gateway
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Em outro terminal, exponha a porta para o Twilio:

```powershell
ngrok http 8000
```

No Twilio Sandbox para WhatsApp, configure o webhook de mensagens recebidas:

```text
https://sua-url-publica.ngrok-free.app/webhooks/twilio/whatsapp
```

Metodo: `POST`.

## Teste sem Twilio

Com o Quarkus rodando em `http://localhost:8080`, voce pode simular o POST do Twilio:

```powershell
curl.exe -X POST http://localhost:8000/webhooks/twilio/whatsapp `
  -H "Content-Type: application/x-www-form-urlencoded" `
  --data-urlencode "MessageSid=SMTESTE001" `
  --data-urlencode "From=whatsapp:+5511999990000" `
  --data-urlencode "To=whatsapp:+14155238886" `
  --data-urlencode "ProfileName=Paciente Demo" `
  --data-urlencode "WaId=5511999990000" `
  --data-urlencode "Body=Estou com muita dor de dente e preciso de ajuda"
```

O retorno sera TwiML para o Twilio responder no WhatsApp, e o ticket deve aparecer no front apos atualizar a lista.

## Modo fallback

Se `WATSON_ENABLED=false` ou se as credenciais do Watson nao estiverem configuradas, o servico usa uma triagem local simples por palavras-chave. Isso serve apenas para contingencia de demo; o fluxo principal continua sendo Watson Assistant.
