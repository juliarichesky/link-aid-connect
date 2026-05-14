package com.turmadobem.service;

import com.turmadobem.dto.RelatorioContatosResponse;
import com.turmadobem.dto.RelatorioDentistasResponse;
import com.turmadobem.dto.RelatorioFinanceiroResponse;
import com.turmadobem.dto.RelatorioTicketsResponse;
import com.turmadobem.repository.RelatorioRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.sql.SQLException;
import java.time.LocalDate;
import java.time.LocalDateTime;

@ApplicationScoped
public class RelatorioService {
    @Inject
    RelatorioRepository relatorioRepository;

    public RelatorioTicketsResponse relatorioTickets(String periodo) throws SQLException {
        PeriodoFiltro filtro = PeriodoFiltro.from(periodo);
        return relatorioRepository.buscarRelatorioTickets(filtro.nome(), filtro.inicioDataHora(), filtro.fimDataHora());
    }

    public RelatorioFinanceiroResponse relatorioFinanceiro(String periodo) throws SQLException {
        PeriodoFiltro filtro = PeriodoFiltro.from(periodo);
        return relatorioRepository.buscarRelatorioFinanceiro(filtro.nome(), filtro.inicioData(), filtro.fimData());
    }

    public RelatorioDentistasResponse relatorioDentistas() throws SQLException {
        return relatorioRepository.buscarRelatorioDentistas();
    }

    public RelatorioContatosResponse relatorioContatos() throws SQLException {
        return relatorioRepository.buscarRelatorioContatos();
    }

    private record PeriodoFiltro(String nome, LocalDateTime inicioDataHora, LocalDateTime fimDataHora, LocalDate inicioData, LocalDate fimData) {
        static PeriodoFiltro from(String periodo) {
            String valor = (periodo == null || periodo.isBlank()) ? "mensal" : periodo.trim().toLowerCase();
            LocalDate hoje = LocalDate.now();
            return switch (valor) {
                case "semanal" -> new PeriodoFiltro(
                        "semanal",
                        hoje.minusDays(6).atStartOfDay(),
                        hoje.plusDays(1).atStartOfDay(),
                        hoje.minusDays(6),
                        hoje.plusDays(1)
                );
                case "mensal" -> {
                    LocalDate inicio = hoje.withDayOfMonth(1);
                    yield new PeriodoFiltro(
                            "mensal",
                            inicio.atStartOfDay(),
                            inicio.plusMonths(1).atStartOfDay(),
                            inicio,
                            inicio.plusMonths(1)
                    );
                }
                case "anual" -> {
                    LocalDate inicio = hoje.withDayOfYear(1);
                    yield new PeriodoFiltro(
                            "anual",
                            inicio.atStartOfDay(),
                            inicio.plusYears(1).atStartOfDay(),
                            inicio,
                            inicio.plusYears(1)
                    );
                }
                default -> throw new IllegalArgumentException("Periodo invalido. Use: semanal, mensal ou anual.");
            };
        }
    }
}
