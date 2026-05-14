package com.turmadobem.resource;

import com.turmadobem.dto.HistoricoContatoResponse;
import com.turmadobem.dto.HistoricoContatoTicketResponse;
import com.turmadobem.entity.Contato;
import com.turmadobem.security.AuthenticatedAccess;
import com.turmadobem.security.RoleRequired;
import com.turmadobem.service.ContatoService;
import com.turmadobem.service.HistoricoContatoService;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.sql.SQLException;
import java.util.List;

@Path("/contatos")
@AuthenticatedAccess
@RoleRequired({"ADMIN", "COLABORADOR"})
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ContatoResource {
    @Inject
    ContatoService contatoService;

    @Inject
    HistoricoContatoService historicoContatoService;

    @GET
    public List<Contato> listar(@QueryParam("page") @DefaultValue("0") int page,
                                @QueryParam("size") @DefaultValue("10") int size,
                                @QueryParam("sortBy") String sortBy,
                                @QueryParam("sortOrder") @DefaultValue("ASC") String sortOrder) throws SQLException {
        return contatoService.listarContatos(page, size, sortBy, sortOrder);
    }

    @GET
    @Path("/{id}")
    public Contato buscarPorId(@PathParam("id") int id) throws SQLException {
        Contato contato = contatoService.buscarContatoPorId(id);
        if (contato == null) {
            throw new WebApplicationException("Contato nao encontrado.", Response.Status.NOT_FOUND);
        }
        return contato;
    }

    @POST
    public Response criar(Contato contato) throws SQLException {
        return Response.status(Response.Status.CREATED)
                .entity(contatoService.criarContato(contato))
                .build();
    }

    @PUT
    @Path("/{id}")
    public Contato atualizar(@PathParam("id") int id, Contato contato) throws SQLException {
        Contato atualizado = contatoService.atualizarContato(id, contato);
        if (atualizado == null) {
            throw new WebApplicationException("Contato nao encontrado.", Response.Status.NOT_FOUND);
        }
        return atualizado;
    }

    @DELETE
    @Path("/{id}")
    public MensagemResponse remover(@PathParam("id") int id) throws SQLException {
        contatoService.removerContato(id);
        return new MensagemResponse("Contato removido com sucesso.");
    }

    @GET
    @Path("/{id}/historico")
    public HistoricoContatoResponse historico(@PathParam("id") int id) throws SQLException {
        HistoricoContatoResponse historico = historicoContatoService.buscarHistorico(id);
        if (historico == null) {
            throw new WebApplicationException("Contato nao encontrado.", Response.Status.NOT_FOUND);
        }
        return historico;
    }

    @GET
    @Path("/documento/{documento}/tickets")
    public List<HistoricoContatoTicketResponse> ticketsPorDocumento(@PathParam("documento") String documento) throws SQLException {
        List<HistoricoContatoTicketResponse> tickets = historicoContatoService.buscarTicketsPorDocumento(documento);
        if (tickets == null) {
            throw new WebApplicationException("Contato nao encontrado.", Response.Status.NOT_FOUND);
        }
        return tickets;
    }

    @GET
    @Path("/{id}/tickets")
    public List<HistoricoContatoTicketResponse> ticketsPorContato(@PathParam("id") int id) throws SQLException {
        List<HistoricoContatoTicketResponse> tickets = historicoContatoService.buscarTicketsPorContato(id);
        if (tickets == null) {
            throw new WebApplicationException("Contato nao encontrado.", Response.Status.NOT_FOUND);
        }
        return tickets;
    }
}
