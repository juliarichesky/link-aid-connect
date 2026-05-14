package com.turmadobem.resource;

import com.turmadobem.entity.TransacaoFinanceira;
import com.turmadobem.security.AuthenticatedAccess;
import com.turmadobem.security.RoleRequired;
import com.turmadobem.service.TransacaoFinanceiraService;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.sql.SQLException;
import java.util.List;

@Path("/financeiro")
@AuthenticatedAccess
@RoleRequired("ADMIN")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class FinanceiroResource {
    @Inject
    TransacaoFinanceiraService transacaoService;

    @GET
    public List<TransacaoFinanceira> listar() throws SQLException {
        return transacaoService.listar();
    }

    @GET
    @Path("/{id}")
    public TransacaoFinanceira buscarPorId(@PathParam("id") int id) throws SQLException {
        TransacaoFinanceira transacao = transacaoService.buscarPorId(id);
        if (transacao == null) {
            throw new WebApplicationException("Transacao financeira nao encontrada.", Response.Status.NOT_FOUND);
        }
        return transacao;
    }

    @POST
    public Response criar(TransacaoFinanceira transacao) throws SQLException {
        return Response.status(Response.Status.CREATED)
                .entity(transacaoService.criar(transacao))
                .build();
    }

    @PUT
    @Path("/{id}")
    public TransacaoFinanceira atualizar(@PathParam("id") int id, TransacaoFinanceira transacao) throws SQLException {
        TransacaoFinanceira atualizada = transacaoService.atualizar(id, transacao);
        if (atualizada == null) {
            throw new WebApplicationException("Transacao financeira nao encontrada.", Response.Status.NOT_FOUND);
        }
        return atualizada;
    }

    @DELETE
    @Path("/{id}")
    public MensagemResponse remover(@PathParam("id") int id) throws SQLException {
        transacaoService.remover(id);
        return new MensagemResponse("Transacao financeira removida com sucesso.");
    }

    @GET
    @Path("/resumo")
    public TransacaoFinanceiraService.ResumoFinanceiro resumo() throws SQLException {
        return transacaoService.resumo();
    }
}
