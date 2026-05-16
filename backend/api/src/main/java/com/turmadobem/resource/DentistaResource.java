package com.turmadobem.resource;

import com.turmadobem.bo.DentistaBO;
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
import org.eclipse.microprofile.openapi.annotations.security.SecurityRequirement;

import java.util.List;

@Path("/dentistas")
@AuthenticatedAccess
@RoleRequired({"ADMIN", "COLABORADOR"})
@SecurityRequirement(name = "bearerAuth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class DentistaResource {
    @Inject
    DentistaBO dentistaBO;

    @GET
    public List<LinkAidDtos.DentistaResponse> listar() {
        return dentistaBO.listar();
    }

    @GET
    @Path("/{id}")
    public LinkAidDtos.DentistaResponse buscar(@PathParam("id") Long id) {
        return dentistaBO.buscar(id);
    }

    @POST
    public Response criar(@Valid LinkAidDtos.DentistaRequest request) {
        return Response.status(Response.Status.CREATED)
                .entity(dentistaBO.criar(request))
                .build();
    }

    @PUT
    @Path("/{id}")
    public LinkAidDtos.DentistaResponse atualizar(@PathParam("id") Long id,
                                                  @Valid LinkAidDtos.DentistaRequest request) {
        return dentistaBO.atualizar(id, request);
    }

    @DELETE
    @Path("/{id}")
    public Response remover(@PathParam("id") Long id) {
        dentistaBO.remover(id);
        return Response.noContent().build();
    }
}
