package com.turmadobem.resource;

import com.turmadobem.entity.Usuario;
import com.turmadobem.security.AuthenticatedAccess;
import com.turmadobem.service.AuthService;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

import java.sql.SQLException;

@Path("/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthResource {
    @Inject
    AuthService authService;

    @POST
    @Path("/login")
    public LoginResponse login(LoginRequest request) throws SQLException {
        return authService.login(request);
    }

    @GET
    @Path("/me")
    @AuthenticatedAccess
    public Usuario me() {
        return authService.me();
    }
}
