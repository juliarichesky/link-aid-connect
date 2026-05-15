package com.turmadobem.resource;

import com.turmadobem.bo.UsuarioBO;
import com.turmadobem.dto.LinkAidDtos;
import com.turmadobem.security.AuthenticatedAccess;
import com.turmadobem.security.RoleRequired;
import jakarta.inject.Inject;
import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;

import java.util.List;

@Path("/usuarios")
@AuthenticatedAccess
@RoleRequired({"ADMIN", "COLABORADOR"})
@Produces(MediaType.APPLICATION_JSON)
public class UsuarioResource {
    @Inject
    UsuarioBO usuarioBO;

    @GET
    public List<LinkAidDtos.UsuarioResponse> listar(@QueryParam("ativos") @DefaultValue("true") boolean ativos) {
        return usuarioBO.listar(ativos);
    }
}
