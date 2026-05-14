package com.turmadobem.dto;

import java.time.LocalDateTime;

public record TicketTimelineMensagemResponse(
        int idMensagem,
        String remetente,
        String conteudo,
        LocalDateTime dataHora
) {
}
