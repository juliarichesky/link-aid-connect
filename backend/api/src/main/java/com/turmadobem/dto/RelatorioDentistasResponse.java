package com.turmadobem.dto;

import java.util.List;

public record RelatorioDentistasResponse(
        int totalDentistas,
        int ativos,
        int inativos,
        int ferias,
        List<RelatorioQuantidadeAgrupadaResponse> porEstado,
        List<RelatorioQuantidadeAgrupadaResponse> porEspecialidade
) {
    public RelatorioDentistasResponse {
        porEstado = porEstado == null ? List.of() : List.copyOf(porEstado);
        porEspecialidade = porEspecialidade == null ? List.of() : List.copyOf(porEspecialidade);
    }
}
