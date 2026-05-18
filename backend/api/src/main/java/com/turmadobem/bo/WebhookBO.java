package com.turmadobem.bo;

import com.turmadobem.dao.TicketDAO;
import com.turmadobem.dao.TicketMensagemDAO;
import com.turmadobem.dao.WebhookEventoDAO;
import com.turmadobem.dto.LinkAidDtos;
import com.turmadobem.exception.BusinessException;
import com.turmadobem.model.Ticket;
import com.turmadobem.model.WebhookEvento;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@ApplicationScoped
public class WebhookBO {
    @Inject
    TicketBO ticketBO;

    @Inject
    TicketDAO ticketDAO;

    @Inject
    TicketMensagemDAO ticketMensagemDAO;

    @Inject
    WebhookEventoDAO webhookEventoDAO;

    @Transactional
    public LinkAidDtos.WebhookTicketResponse criarTicketViaWatson(LinkAidDtos.WebhookTicketRequest request) {
        if (request.body() == null || request.body().isBlank()) {
            throw new BusinessException("Corpo da mensagem do webhook e obrigatorio.");
        }

        String prioridade = primeiroValor(request.prioridadeCodigo(), inferirPrioridade(request.body()));
        String classificacao = primeiroValor(request.classificacaoCodigo(), inferirClassificacao(request.body(), request.intent()));
        String origem = primeiroValor(request.origem(), "WATSON_SANDBOX").toUpperCase();
        String nome = primeiroValor(request.nome(), request.from(), "Contato WhatsApp");
        boolean encaminharHumano = deveEncaminharHumano(request, classificacao);
        Ticket ticketAberto = ticketDAO.buscarAbertoPorTelefone(request.from());
        if (ticketAberto != null) {
            boolean atendimentoHumanoIniciado = ticketMensagemDAO.existeAtendentePorTicket(ticketAberto.getIdTicket());
            ticketBO.registrarMensagem(ticketAberto, "CONTATO", request.body(), null);
            if (!atendimentoHumanoIniciado) {
                ticketBO.registrarMensagem(ticketAberto, "IA", respostaIa(request.respostaIa(), ticketAberto.getProtocolo(), encaminharHumano), null);
            }
            registrarEvento(ticketAberto, request, origem, "PROCESSADO");
            return respostaWebhook(ticketBO.buscar(ticketAberto.getIdTicket()), !atendimentoHumanoIniciado);
        }

        LinkAidDtos.TicketRequest ticketRequest = new LinkAidDtos.TicketRequest(
                null,
                nome,
                null,
                null,
                request.from(),
                primeiroValor(request.tipoContatoCodigo(), "SOLICITANTE"),
                null,
                null,
                canalPorOrigem(origem),
                prioridade,
                classificacao,
                null,
                null,
                tituloPorClassificacao(classificacao),
                request.body(),
                "Triagem Watson: " + tituloPorClassificacao(classificacao) + ". Prioridade " + prioridade + ".",
                request.confiancaIa() == null ? BigDecimal.valueOf(90) : request.confiancaIa()
        );

        Ticket ticket = ticketBO.criarEntidade(ticketRequest);
        ticketBO.registrarMensagem(ticket, "CONTATO", request.body(), null);
        ticketBO.registrarMensagem(ticket, "IA", respostaIa(request.respostaIa(), ticket.getProtocolo(), encaminharHumano), null);
        registrarEvento(ticket, request, origem, "PROCESSADO");

        return respostaWebhook(ticketBO.buscar(ticket.getIdTicket()), true);
    }

    private LinkAidDtos.WebhookTicketResponse respostaWebhook(LinkAidDtos.TicketResponse ticket, boolean responderIa) {
        return new LinkAidDtos.WebhookTicketResponse(
                ticket.idTicket(),
                ticket.protocolo(),
                responderIa,
                ticket
        );
    }

    private void registrarEvento(Ticket ticket, LinkAidDtos.WebhookTicketRequest request, String origem, String status) {
        WebhookEvento evento = new WebhookEvento();
        evento.setTicket(ticket);
        evento.setOrigem(origem);
        evento.setExternalId(request.externalId());
        evento.setPayload(primeiroValor(request.payload(), payloadBasico(request)));
        evento.setStatusProcessamento(status);
        evento.setDataRecebimento(LocalDateTime.now());
        webhookEventoDAO.persist(evento);
    }

    private String inferirPrioridade(String texto) {
        String valor = texto.toLowerCase();
        if (valor.contains("dor") || valor.contains("urgente") || valor.contains("sangramento")) {
            return "CRITICA";
        }
        if (valor.contains("agendar") || valor.contains("consulta") || valor.contains("tratamento")) {
            return "ALTA";
        }
        return "MEDIA";
    }

    private String inferirClassificacao(String texto, String intent) {
        String base = ((intent == null ? "" : intent) + " " + texto).toLowerCase();
        if (base.contains("emerg") || base.contains("dor") || base.contains("sangramento")) {
            return "SAUDE";
        }
        if (base.contains("doa")) {
            return "DOACAO";
        }
        if (base.contains("parceria")) {
            return "PARCERIA";
        }
        if (base.contains("volunt")) {
            return "VOLUNTARIADO";
        }
        if (base.contains("agend")) {
            return "AGENDAMENTO";
        }
        return "SAUDE";
    }

    private String tituloPorClassificacao(String classificacao) {
        return switch (classificacao) {
            case "EMERGENCIA" -> "Urgencia odontologica";
            case "AGENDAMENTO" -> "Solicitacao de agendamento";
            case "DOACAO" -> "Contato sobre doacao";
            case "PARCERIA" -> "Contato sobre parceria";
            case "VOLUNTARIADO" -> "Contato de dentista voluntario";
            default -> "Solicitacao de atendimento";
        };
    }

    private String canalPorOrigem(String origem) {
        if (origem != null && (origem.contains("TWILIO") || origem.contains("WHATSAPP"))) {
            return "WHATSAPP";
        }
        return "WATSON_SANDBOX";
    }

    private String payloadBasico(LinkAidDtos.WebhookTicketRequest request) {
        return "from=" + primeiroValor(request.from(), "") + "; body=" + request.body();
    }

    private boolean deveEncaminharHumano(LinkAidDtos.WebhookTicketRequest request, String classificacao) {
        if (request.encaminharHumano() != null) {
            return request.encaminharHumano();
        }

        String intent = request.intent() == null ? "" : request.intent().toLowerCase();
        String codigoClassificacao = classificacao == null ? "" : classificacao.toUpperCase();
        if ("falar_atendente".equals(intent)) {
            return true;
        }
        if (codigoClassificacao.equals("DOACAO")
                || codigoClassificacao.equals("PARCERIA")
                || codigoClassificacao.equals("VOLUNTARIADO")
                || codigoClassificacao.equals("FEEDBACK")) {
            return false;
        }
        String texto = request.body() == null ? "" : request.body().toLowerCase();
        return codigoClassificacao.equals("EMERGENCIA")
                || codigoClassificacao.equals("AGENDAMENTO")
                || intent.startsWith("ajuda_")
                || intent.contains("emergencia")
                || texto.contains("dor")
                || texto.contains("urgente")
                || texto.contains("sangramento")
                || texto.contains("inchado");
    }

    private String respostaIa(String respostaIa, String protocolo, boolean incluirProtocolo) {
        String resposta = primeiroValor(
                respostaIa,
                "Recebemos sua mensagem e abrimos uma triagem no LinkAid. Nossa equipe vai analisar e continuar o atendimento."
        );
        if (!incluirProtocolo || protocolo == null || protocolo.isBlank() || resposta.contains("Protocolo LinkAid:")) {
            return resposta;
        }
        return resposta + "\n\nProtocolo LinkAid: " + protocolo;
    }

    private String primeiroValor(String... valores) {
        for (String valor : valores) {
            if (valor != null && !valor.isBlank()) {
                return valor.trim();
            }
        }
        return null;
    }
}
