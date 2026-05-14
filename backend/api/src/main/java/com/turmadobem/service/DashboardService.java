package com.turmadobem.service;

import com.turmadobem.dto.DashboardFinanceiroResumoResponse;
import com.turmadobem.dto.DashboardResumoResponse;
import com.turmadobem.dto.DashboardTicketsPorCanalResponse;
import com.turmadobem.dto.DashboardTicketsPorStatusResponse;
import com.turmadobem.dto.UltimoTicketDashboardResponse;
import com.turmadobem.repository.DashboardRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.sql.SQLException;
import java.util.List;

@ApplicationScoped
public class DashboardService {
    @Inject
    DashboardRepository dashboardRepository;

    public DashboardResumoResponse resumo() throws SQLException {
        return dashboardRepository.buscarResumo();
    }

    public List<DashboardTicketsPorStatusResponse> ticketsPorStatus() throws SQLException {
        return dashboardRepository.buscarTicketsPorStatus();
    }

    public List<DashboardTicketsPorCanalResponse> ticketsPorCanal() throws SQLException {
        return dashboardRepository.buscarTicketsPorCanal();
    }

    public DashboardFinanceiroResumoResponse financeiroResumo() throws SQLException {
        return dashboardRepository.buscarFinanceiroResumo();
    }

    public List<UltimoTicketDashboardResponse> ultimosTickets() throws SQLException {
        return dashboardRepository.buscarUltimosTickets();
    }
}
