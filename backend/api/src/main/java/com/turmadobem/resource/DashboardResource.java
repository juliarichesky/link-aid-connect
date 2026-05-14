package com.turmadobem.resource;

import com.turmadobem.dto.DashboardFinanceiroResumoResponse;
import com.turmadobem.dto.DashboardResumoResponse;
import com.turmadobem.dto.DashboardTicketsPorCanalResponse;
import com.turmadobem.dto.DashboardTicketsPorStatusResponse;
import com.turmadobem.dto.UltimoTicketDashboardResponse;
import com.turmadobem.security.AuthenticatedAccess;
import com.turmadobem.security.RoleRequired;
import com.turmadobem.service.DashboardService;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

import java.sql.SQLException;
import java.util.List;

@Path("/dashboard")
@AuthenticatedAccess
@RoleRequired({"ADMIN", "COLABORADOR"})
@Produces(MediaType.APPLICATION_JSON)
public class DashboardResource {
    @Inject
    DashboardService dashboardService;

    @GET
    @Path("/resumo")
    public DashboardResumoResponse resumo() throws SQLException {
        return dashboardService.resumo();
    }

    @GET
    @Path("/tickets-por-status")
    public List<DashboardTicketsPorStatusResponse> ticketsPorStatus() throws SQLException {
        return dashboardService.ticketsPorStatus();
    }

    @GET
    @Path("/tickets-por-canal")
    public List<DashboardTicketsPorCanalResponse> ticketsPorCanal() throws SQLException {
        return dashboardService.ticketsPorCanal();
    }

    @GET
    @Path("/financeiro-resumo")
    public DashboardFinanceiroResumoResponse financeiroResumo() throws SQLException {
        return dashboardService.financeiroResumo();
    }

    @GET
    @Path("/ultimos-tickets")
    public List<UltimoTicketDashboardResponse> ultimosTickets() throws SQLException {
        return dashboardService.ultimosTickets();
    }
}
