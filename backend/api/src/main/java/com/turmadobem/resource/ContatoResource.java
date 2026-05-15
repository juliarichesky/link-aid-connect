package com.turmadobem.resource;

import com.turmadobem.bo.ContatoBO;
import com.turmadobem.dto.LinkAidDtos;
import com.turmadobem.security.AuthenticatedAccess;
import com.turmadobem.security.RoleRequired;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;

@Path("/contatos")
@AuthenticatedAccess
@RoleRequired({"ADMIN", "COLABORADOR"})
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ContatoResource {
    @Inject
    ContatoBO contatoBO;

    @GET
    public List<LinkAidDtos.ContatoResponse> listar() {
        return contatoBO.listar();
    }

    @GET
    @Path("/{id}")
    public LinkAidDtos.ContatoResponse buscar(@PathParam("id") Long id) {
        return contatoBO.buscar(id);
    }

    @GET
    @Path("/{id}/historico")
    public LinkAidDtos.HistoricoContatoResponse historico(@PathParam("id") Long id) {
        return contatoBO.historico(id);
    }

    @POST
    public Response criar(@Valid LinkAidDtos.ContatoRequest request) {
        return Response.status(Response.Status.CREATED)
                .entity(contatoBO.criar(request))
                .build();
    }

    @PUT
    @Path("/{id}")
    public LinkAidDtos.ContatoResponse atualizar(@PathParam("id") Long id,
                                                 @Valid LinkAidDtos.ContatoRequest request) {
        return contatoBO.atualizar(id, request);
    }

    @DELETE
    @Path("/{id}")
    public Response remover(@PathParam("id") Long id) {
        contatoBO.remover(id);
        return Response.noContent().build();
    }
}
