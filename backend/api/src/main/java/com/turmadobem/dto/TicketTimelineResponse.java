package com.turmadobem.dto;

import java.time.LocalDateTime;
import java.util.List;

public record TicketTimelineResponse(
        int idTicket,
        String protocolo,
        String assunto,
        String descricao,
        String status,
        String prioridade,
        String canalOrigem,
        LocalDateTime dataAbertura,
        LocalDateTime dataAtualizacao,
        TicketTimelineContatoResponse contato,
        TicketTimelineDentistaResponse dentistaResponsavel,
        List<TicketTimelineMensagemResponse> mensagens
) {
    public TicketTimelineResponse {
        mensagens = mensagens == null ? List.of() : List.copyOf(mensagens);
    }
}
