package com.turmadobem.dto;

import java.math.BigDecimal;

public record DashboardResumoResponse(
        int totalContatos,
        int totalTickets,
        int ticketsAbertos,
        int ticketsEmAtendimento,
        int ticketsAguardandoCliente,
        int ticketsResolvidos,
        int ticketsCancelados,
        int ticketsArquivados,
        int totalDentistas,
        int dentistasAtivos,
        BigDecimal totalReceitas,
        BigDecimal totalDespesas,
        BigDecimal saldoFinanceiro
) {
}
