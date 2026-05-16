package com.turmadobem.resource;

import com.turmadobem.bo.DominioBO;
import com.turmadobem.dto.LinkAidDtos;
import com.turmadobem.security.AuthenticatedAccess;
import com.turmadobem.security.RoleRequired;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.openapi.annotations.security.SecurityRequirement;

import java.util.List;

@Path("/dominios")
@AuthenticatedAccess
@RoleRequired({"ADMIN", "COLABORADOR"})
@SecurityRequirement(name = "bearerAuth")
@Produces(MediaType.APPLICATION_JSON)
public class DominioResource {
    @Inject
    DominioBO dominioBO;

    @GET
    public LinkAidDtos.DominiosResponse listar() {
        return dominioBO.listar();
    }

    @GET
    @Path("/tipos-contato")
    public List<LinkAidDtos.DominioItemResponse> listarTiposContato() {
        return dominioBO.listarTiposContato();
    }

    @GET
    @Path("/canais")
    public List<LinkAidDtos.DominioItemResponse> listarCanais() {
        return dominioBO.listarCanais();
    }

    @GET
    @Path("/status-ticket")
    public List<LinkAidDtos.DominioItemResponse> listarStatusTicket() {
        return dominioBO.listarStatusTicket();
    }

    @GET
    @Path("/prioridades")
    public List<LinkAidDtos.DominioItemResponse> listarPrioridades() {
        return dominioBO.listarPrioridades();
    }

    @GET
    @Path("/classificacoes")
    public List<LinkAidDtos.DominioItemResponse> listarClassificacoes() {
        return dominioBO.listarClassificacoes();
    }
}
