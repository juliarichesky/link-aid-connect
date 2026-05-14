package com.turmadobem.dto;

public record TicketTimelineDentistaResponse(
        Integer idDentista,
        String nome,
        String cro,
        String especialidade,
        String estado
) {
}
