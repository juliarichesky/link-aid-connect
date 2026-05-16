package com.turmadobem.resource;

import com.turmadobem.bo.TicketBO;
import com.turmadobem.dto.LinkAidDtos;
import com.turmadobem.security.AuthenticatedAccess;
import com.turmadobem.security.CurrentUser;
import com.turmadobem.security.RoleRequired;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
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
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.security.SecurityRequirement;

import java.util.List;

@Path("/tickets")
@AuthenticatedAccess
@RoleRequired({"ADMIN", "COLABORADOR"})
@SecurityRequirement(name = "bearerAuth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TicketResource {
    @Inject
    TicketBO ticketBO;

    @Inject
    CurrentUser currentUser;

    @GET
    public List<LinkAidDtos.TicketResponse> listar(@QueryParam("status") String status,
                                                   @QueryParam("canal") String canal,
                                                   @QueryParam("responsavelId") Long responsavelId,
                                                   @QueryParam("page") @DefaultValue("0") int page,
                                                   @QueryParam("size") @DefaultValue("20") int size) {
        return ticketBO.listar(status, canal, responsavelId, page, size);
    }

    @GET
    @Path("/{id}")
    public LinkAidDtos.TicketResponse buscar(@PathParam("id") Long id) {
        return ticketBO.buscar(id);
    }

    @POST
    public Response criar(@Valid LinkAidDtos.TicketRequest request) {
        return Response.status(Response.Status.CREATED)
                .entity(ticketBO.criar(request))
                .build();
    }

    @PUT
    @Path("/{id}")
    public LinkAidDtos.TicketResponse atualizar(@PathParam("id") Long id,
                                                @Valid LinkAidDtos.TicketUpdateRequest request) {
        return ticketBO.atualizar(id, request);
    }

    @PUT
    @Path("/{id}/status")
    public LinkAidDtos.TicketResponse atualizarStatus(@PathParam("id") Long id,
                                                      @Valid LinkAidDtos.TicketStatusRequest request) {
        return ticketBO.atualizarStatus(id, request.statusCodigo());
    }

    @PUT
    @Path("/{id}/responsavel")
    public LinkAidDtos.TicketResponse atribuirResponsavel(@PathParam("id") Long id,
                                                          @Valid LinkAidDtos.TicketResponsavelRequest request) {
        return ticketBO.atribuirResponsavel(id, request.idUsuarioResponsavel());
    }

    @DELETE
    @Path("/{id}")
    public LinkAidDtos.TicketResponse arquivar(@PathParam("id") Long id) {
        return ticketBO.arquivar(id);
    }

    @GET
    @Path("/{id}/mensagens")
    public List<LinkAidDtos.MensagemResponse> listarMensagens(@PathParam("id") Long id) {
        return ticketBO.listarMensagens(id);
    }

    @POST
    @Path("/{id}/mensagens")
    public Response adicionarMensagem(@PathParam("id") Long id,
                                      @Valid LinkAidDtos.MensagemRequest request) {
        Long usuarioPadrao = currentUser.getUsuario() == null ? null : currentUser.getUsuario().getIdUsuario();
        return Response.status(Response.Status.CREATED)
                .entity(ticketBO.adicionarMensagem(id, request, usuarioPadrao))
                .build();
    }

    @GET
    @Path("/{id}/notas-internas")
    public List<LinkAidDtos.NotaInternaResponse> listarNotasInternas(@PathParam("id") Long id) {
        return ticketBO.listarNotasInternas(id);
    }

    @POST
    @Path("/{id}/notas-internas")
    public Response adicionarNotaInterna(@PathParam("id") Long id,
                                         @Valid LinkAidDtos.NotaInternaRequest request) {
        Long usuarioPadrao = currentUser.getUsuario() == null ? null : currentUser.getUsuario().getIdUsuario();
        return Response.status(Response.Status.CREATED)
                .entity(ticketBO.adicionarNotaInterna(id, request, usuarioPadrao))
                .build();
    }
}
