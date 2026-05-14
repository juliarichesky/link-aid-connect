package com.turmadobem.dto;

import java.util.List;

public record RelatorioTicketsResponse(
        String periodo,
        int totalTickets,
        int abertos,
        int emAtendimento,
        int aguardandoCliente,
        int resolvidos,
        int cancelados,
        int arquivados,
        List<RelatorioQuantidadeAgrupadaResponse> porStatus,
        List<RelatorioQuantidadeAgrupadaResponse> porCanal
) {
    public RelatorioTicketsResponse {
        porStatus = porStatus == null ? List.of() : List.copyOf(porStatus);
        porCanal = porCanal == null ? List.of() : List.copyOf(porCanal);
    }
}
