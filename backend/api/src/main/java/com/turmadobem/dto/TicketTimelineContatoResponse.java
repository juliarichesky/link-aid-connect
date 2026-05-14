package com.turmadobem.dto;

public record TicketTimelineContatoResponse(
        int idContato,
        String nome,
        String documento,
        String email,
        String telefone
) {
}
