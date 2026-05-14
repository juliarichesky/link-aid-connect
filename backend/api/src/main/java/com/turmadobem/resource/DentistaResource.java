package com.turmadobem.resource;

import com.turmadobem.entity.AgendaDentista;
import com.turmadobem.entity.Dentista;
import com.turmadobem.security.AuthenticatedAccess;
import com.turmadobem.security.RoleRequired;
import com.turmadobem.service.DentistaService;
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

@Path("/dentistas")
@AuthenticatedAccess
@RoleRequired({"ADMIN", "COLABORADOR"})
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class DentistaResource {
    @Inject
    DentistaService dentistaService;

    @GET
    public List<Dentista> listar(@QueryParam("especialidade") String especialidade,
                                 @QueryParam("estado") String estado,
                                 @QueryParam("status") String status,
                                 @QueryParam("page") @DefaultValue("0") int page,
                                 @QueryParam("size") @DefaultValue("10") int size,
                                 @QueryParam("sortBy") String sortBy,
                                 @QueryParam("sortOrder") @DefaultValue("ASC") String sortOrder) throws SQLException {
        return dentistaService.listarDentistas(especialidade, estado, status, page, size, sortBy, sortOrder);
    }

    @GET
    @Path("/{id}")
    public Dentista buscarPorId(@PathParam("id") int id) throws SQLException {
        Dentista dentista = dentistaService.buscarDentistaPorId(id);
        if (dentista == null) {
            throw new WebApplicationException("Dentista nao encontrado.", Response.Status.NOT_FOUND);
        }
        return dentista;
    }

    @POST
    public Response criar(Dentista dentista) throws SQLException {
        return Response.status(Response.Status.CREATED)
                .entity(dentistaService.criarDentista(dentista))
                .build();
    }

    @PUT
    @Path("/{id}")
    public Dentista atualizar(@PathParam("id") int id, Dentista dentista) throws SQLException {
        Dentista atualizado = dentistaService.atualizarDentista(id, dentista);
        if (atualizado == null) {
            throw new WebApplicationException("Dentista nao encontrado.", Response.Status.NOT_FOUND);
        }
        return atualizado;
    }

    @DELETE
    @Path("/{id}")
    public MensagemResponse remover(@PathParam("id") int id) throws SQLException {
        dentistaService.removerDentista(id);
        return new MensagemResponse("Dentista removido com sucesso.");
    }

    @GET
    @Path("/{id}/agenda")
    public List<AgendaDentista> listarAgenda(@PathParam("id") int id,
                                             @QueryParam("status") String status) throws SQLException {
        return dentistaService.listarAgenda(id, status);
    }

    @POST
    @Path("/{id}/agenda")
    public Response criarAgenda(@PathParam("id") int id, AgendaDentista agenda) throws SQLException {
        return Response.status(Response.Status.CREATED)
                .entity(dentistaService.criarAgenda(id, agenda))
                .build();
    }
}
