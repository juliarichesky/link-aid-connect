package com.turmadobem.dto;

import java.math.BigDecimal;
import java.util.List;

public record RelatorioFinanceiroResponse(
        String periodo,
        BigDecimal totalReceitas,
        BigDecimal totalDespesas,
        BigDecimal saldo,
        int quantidadeTransacoes,
        List<RelatorioValorAgrupadoResponse> porCategoria,
        List<RelatorioValorAgrupadoResponse> porStatus
) {
    public RelatorioFinanceiroResponse {
        porCategoria = porCategoria == null ? List.of() : List.copyOf(porCategoria);
        porStatus = porStatus == null ? List.of() : List.copyOf(porStatus);
    }
}
