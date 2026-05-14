package com.turmadobem.dto;

import java.util.List;

public record RelatorioContatosResponse(
        int totalContatos,
        List<RelatorioQuantidadeAgrupadaResponse> porCanalOrigem,
        int contatosComTickets,
        int contatosSemTickets
) {
    public RelatorioContatosResponse {
        porCanalOrigem = porCanalOrigem == null ? List.of() : List.copyOf(porCanalOrigem);
    }
}
