package com.turmadobem.dto;

import java.time.LocalDateTime;
import java.util.List;

public record HistoricoContatoResponse(
        int idContato,
        String nome,
        String documento,
        String email,
        String telefone,
        String canalOrigem,
        int totalTickets,
        LocalDateTime ultimoAtendimento,
        List<HistoricoContatoTicketResponse> tickets
) {
    public HistoricoContatoResponse {
        tickets = tickets == null ? List.of() : List.copyOf(tickets);
    }
}
