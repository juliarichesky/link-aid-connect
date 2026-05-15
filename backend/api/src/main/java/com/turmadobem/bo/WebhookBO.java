package com.turmadobem.bo;

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
    WebhookEventoDAO webhookEventoDAO;

    @Transactional
    public LinkAidDtos.TicketResponse criarTicketViaWatson(LinkAidDtos.WebhookTicketRequest request) {
        if (request.body() == null || request.body().isBlank()) {
            throw new BusinessException("Corpo da mensagem do webhook e obrigatorio.");
        }

        String prioridade = primeiroValor(request.prioridadeCodigo(), inferirPrioridade(request.body()));
        String classificacao = primeiroValor(request.classificacaoCodigo(), inferirClassificacao(request.body(), request.intent()));
        String origem = primeiroValor(request.origem(), "WATSON_SANDBOX").toUpperCase();
        String nome = primeiroValor(request.nome(), request.from(), "Contato WhatsApp");

        LinkAidDtos.TicketRequest ticketRequest = new LinkAidDtos.TicketRequest(
                null,
                nome,
                null,
                null,
                request.from(),
                primeiroValor(request.tipoContatoCodigo(), "BENEFICIARIO"),
                null,
                null,
                "WATSON_SANDBOX",
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
        ticketBO.registrarMensagem(ticket, "IA", ticket.getResumoIa(), null);

        WebhookEvento evento = new WebhookEvento();
        evento.setTicket(ticket);
        evento.setOrigem(origem);
        evento.setExternalId(request.externalId());
        evento.setPayload(primeiroValor(request.payload(), payloadBasico(request)));
        evento.setStatusProcessamento("PROCESSADO");
        evento.setDataRecebimento(LocalDateTime.now());
        webhookEventoDAO.persist(evento);

        return ticketBO.buscar(ticket.getIdTicket());
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
            return "EMERGENCIA";
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
            case "VOLUNTARIADO" -> "Contato sobre voluntariado";
            default -> "Solicitacao de atendimento";
        };
    }

    private String payloadBasico(LinkAidDtos.WebhookTicketRequest request) {
        return "from=" + primeiroValor(request.from(), "") + "; body=" + request.body();
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
