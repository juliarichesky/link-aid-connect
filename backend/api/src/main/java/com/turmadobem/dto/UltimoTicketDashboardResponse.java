package com.turmadobem.dto;

import java.time.LocalDateTime;

public record UltimoTicketDashboardResponse(
        int idTicket,
        String protocolo,
        String assunto,
        String status,
        String prioridade,
        String canalOrigem,
        LocalDateTime dataAbertura,
        String nomeContato
) {
}
