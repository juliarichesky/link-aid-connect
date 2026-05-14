package com.turmadobem.resource;

import com.turmadobem.dto.TicketTimelineResponse;
import com.turmadobem.entity.Mensagem;
import com.turmadobem.entity.Ticket;
import com.turmadobem.security.AuthenticatedAccess;
import com.turmadobem.security.RoleRequired;
import com.turmadobem.service.TicketService;
import com.turmadobem.service.TicketTimelineService;
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

@Path("/tickets")
@AuthenticatedAccess
@RoleRequired({"ADMIN", "COLABORADOR"})
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TicketResource {
    @Inject
    TicketService ticketService;

    @Inject
    TicketTimelineService ticketTimelineService;

    @GET
    public List<Ticket> listar(@QueryParam("contatoId") Integer contatoId,
                               @QueryParam("canalOrigem") String canalOrigem,
                               @QueryParam("page") @DefaultValue("0") int page,
                               @QueryParam("size") @DefaultValue("10") int size,
                               @QueryParam("sortBy") String sortBy,
                               @QueryParam("sortOrder") @DefaultValue("ASC") String sortOrder) throws SQLException {
        return ticketService.listarTickets(contatoId, canalOrigem, page, size, sortBy, sortOrder);
    }

    @GET
    @Path("/{id}")
    public Ticket buscarPorId(@PathParam("id") int id) throws SQLException {
        Ticket ticket = ticketService.buscarTicketPorId(id);
        if (ticket == null) {
            throw new WebApplicationException("Ticket nao encontrado.", Response.Status.NOT_FOUND);
        }
        return ticket;
    }

    @GET
    @Path("/{id}/timeline")
    public TicketTimelineResponse timeline(@PathParam("id") int id) throws SQLException {
        TicketTimelineResponse timeline = ticketTimelineService.buscarTimeline(id);
        if (timeline == null) {
            throw new WebApplicationException("Ticket nao encontrado.", Response.Status.NOT_FOUND);
        }
        return timeline;
    }

    @POST
    public Response criar(Ticket ticket) throws SQLException {
        return Response.status(Response.Status.CREATED)
                .entity(ticketService.criarTicket(ticket))
                .build();
    }

    @PUT
    @Path("/{id}")
    public Ticket atualizar(@PathParam("id") int id, Ticket ticket) throws SQLException {
        Ticket atualizado = ticketService.atualizarTicket(id, ticket);
        if (atualizado == null) {
            throw new WebApplicationException("Ticket nao encontrado.", Response.Status.NOT_FOUND);
        }
        return atualizado;
    }

    @PUT
    @Path("/{id}/status")
    public Ticket atualizarStatus(@PathParam("id") int id, TicketStatusRequest request) throws SQLException {
        Ticket atualizado = ticketService.atualizarStatus(id, request.getStatus());
        if (atualizado == null) {
            throw new WebApplicationException("Ticket nao encontrado.", Response.Status.NOT_FOUND);
        }
        return atualizado;
    }

    @DELETE
    @Path("/{id}")
    @Deprecated
    public MensagemResponse remover(@PathParam("id") int id) throws SQLException {
        ticketService.removerTicket(id);
        return new MensagemResponse("Ticket arquivado com sucesso.");
    }

    @PUT
    @Path("/{id}/arquivar")
    public Ticket arquivar(@PathParam("id") int id) throws SQLException {
        Ticket atualizado = ticketService.arquivarTicket(id);
        if (atualizado == null) {
            throw new WebApplicationException("Ticket nao encontrado.", Response.Status.NOT_FOUND);
        }
        return atualizado;
    }

    @PUT
    @Path("/{id}/desarquivar")
    public Ticket desarquivar(@PathParam("id") int id) throws SQLException {
        Ticket atualizado = ticketService.desarquivarTicket(id);
        if (atualizado == null) {
            throw new WebApplicationException("Ticket nao encontrado.", Response.Status.NOT_FOUND);
        }
        return atualizado;
    }

    @GET
    @Path("/{id}/mensagens")
    public List<Mensagem> listarMensagens(@PathParam("id") int id) throws SQLException {
        return ticketService.listarMensagens(id);
    }

    @POST
    @Path("/{id}/mensagens")
    public Response adicionarMensagem(@PathParam("id") int id, Mensagem mensagem) throws SQLException {
        return Response.status(Response.Status.CREATED)
                .entity(ticketService.adicionarMensagem(id, mensagem))
                .build();
    }
}
