package com.turmadobem.resource;

import com.turmadobem.bo.AuthBO;
import com.turmadobem.dto.LinkAidDtos;
import com.turmadobem.security.AuthenticatedAccess;
import com.turmadobem.security.CurrentUser;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

@Path("/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthResource {
    @Inject
    AuthBO authBO;

    @Inject
    CurrentUser currentUser;

    @POST
    @Path("/login")
    public LinkAidDtos.LoginResponse login(@Valid LinkAidDtos.LoginRequest request) {
        return authBO.login(request);
    }

    @GET
    @Path("/me")
    @AuthenticatedAccess
    public LinkAidDtos.UsuarioResponse me() {
        return authBO.me(currentUser.getUsuario());
    }
}
