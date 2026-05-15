package com.turmadobem.resource;

import com.turmadobem.bo.DashboardBO;
import com.turmadobem.dto.LinkAidDtos;
import com.turmadobem.security.AuthenticatedAccess;
import com.turmadobem.security.RoleRequired;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

import java.util.List;

@Path("/dashboard")
@AuthenticatedAccess
@RoleRequired({"ADMIN", "COLABORADOR"})
@Produces(MediaType.APPLICATION_JSON)
public class DashboardResource {
    @Inject
    DashboardBO dashboardBO;

    @GET
    public LinkAidDtos.DashboardResponse dashboard() {
        return dashboardBO.dashboard();
    }

    @GET
    @Path("/resumo")
    public LinkAidDtos.DashboardResumoResponse resumo() {
        return dashboardBO.resumo();
    }

    @GET
    @Path("/tickets-por-status")
    public List<LinkAidDtos.AgrupamentoResponse> ticketsPorStatus() {
        return dashboardBO.ticketsPorStatus();
    }

    @GET
    @Path("/tickets-por-canal")
    public List<LinkAidDtos.AgrupamentoResponse> ticketsPorCanal() {
        return dashboardBO.ticketsPorCanal();
    }

    @GET
    @Path("/ultimos-tickets")
    public List<LinkAidDtos.TicketResponse> ultimosTickets() {
        return dashboardBO.ultimosTickets(10);
    }
}
