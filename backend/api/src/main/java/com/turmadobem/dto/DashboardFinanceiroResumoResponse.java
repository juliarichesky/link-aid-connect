package com.turmadobem.dto;

import java.math.BigDecimal;

public record DashboardFinanceiroResumoResponse(
        BigDecimal receitas,
        BigDecimal despesas,
        BigDecimal saldo
) {
}
