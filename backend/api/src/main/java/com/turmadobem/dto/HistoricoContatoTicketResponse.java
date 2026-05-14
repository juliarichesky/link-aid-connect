package com.turmadobem.dto;

import java.time.LocalDateTime;

public record HistoricoContatoTicketResponse(
        int idTicket,
        String protocolo,
        String assunto,
        String descricao,
        String status,
        String prioridade,
        String canalOrigem,
        LocalDateTime dataAbertura,
        LocalDateTime dataAtualizacao
) {
}
