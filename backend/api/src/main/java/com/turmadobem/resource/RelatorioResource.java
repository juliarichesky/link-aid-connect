package com.turmadobem.resource;

import com.turmadobem.dto.RelatorioContatosResponse;
import com.turmadobem.dto.RelatorioDentistasResponse;
import com.turmadobem.dto.RelatorioFinanceiroResponse;
import com.turmadobem.dto.RelatorioTicketsResponse;
import com.turmadobem.security.AuthenticatedAccess;
import com.turmadobem.security.RoleRequired;
import com.turmadobem.service.RelatorioService;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;

import java.sql.SQLException;

@Path("/relatorios")
@AuthenticatedAccess
@RoleRequired({"ADMIN"})
@Produces(MediaType.APPLICATION_JSON)
public class RelatorioResource {

    @Inject
    RelatorioService relatorioService;

    @GET
    @Path("/tickets")
    public RelatorioTicketsResponse tickets(@QueryParam("periodo") String periodo) throws SQLException {
        return relatorioService.relatorioTickets(periodo);
    }

    @GET
    @Path("/financeiro")
    public RelatorioFinanceiroResponse financeiro(@QueryParam("periodo") String periodo) throws SQLException {
        return relatorioService.relatorioFinanceiro(periodo);
    }

    @GET
    @Path("/dentistas")
    public RelatorioDentistasResponse dentistas() throws SQLException {
        return relatorioService.relatorioDentistas();
    }

    @GET
    @Path("/contatos")
    public RelatorioContatosResponse contatos() throws SQLException {
        return relatorioService.relatorioContatos();
    }
}