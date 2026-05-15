package com.turmadobem.security;

import com.turmadobem.model.Usuario;
import com.turmadobem.resource.ApiErrorResponse;
import jakarta.annotation.Priority;
import jakarta.inject.Inject;
import jakarta.ws.rs.Priorities;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.container.ResourceInfo;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.Provider;

import java.io.IOException;
import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

@Provider
@Priority(Priorities.AUTHENTICATION)
public class AuthFilter implements ContainerRequestFilter {
    @Inject
    AuthSessionService authSessionService;

    @Inject
    CurrentUser currentUser;

    @Context
    ResourceInfo resourceInfo;

    @Override
    public void filter(ContainerRequestContext requestContext) throws IOException {
        Method method = resourceInfo.getResourceMethod();
        Class<?> resourceClass = resourceInfo.getResourceClass();

        boolean requiresAuth = hasAuthenticatedAccess(method, resourceClass);
        RoleRequired roleRequired = getRoleRequired(method, resourceClass);

        if (!requiresAuth && roleRequired == null) {
            return;
        }

        String authorization = requestContext.getHeaderString(HttpHeaders.AUTHORIZATION);
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            abort(requestContext, Response.Status.UNAUTHORIZED, "Token de autenticacao nao informado.");
            return;
        }

        String token = authorization.substring("Bearer ".length()).trim();
        Usuario usuario = authSessionService.findByToken(token);
        if (usuario == null) {
            abort(requestContext, Response.Status.UNAUTHORIZED, "Token de autenticacao invalido.");
            return;
        }

        currentUser.setUsuario(usuario);
        currentUser.setToken(token);

        if (roleRequired != null) {
            Set<String> allowed = new HashSet<>(Arrays.asList(roleRequired.value()));
            String perfil = usuario.getPerfil() == null ? null : usuario.getPerfil().getCodigo();
            if (perfil == null || !allowed.contains(perfil)) {
                abort(requestContext, Response.Status.FORBIDDEN, "Usuario sem permissao para acessar este recurso.");
            }
        }
    }

    private boolean hasAuthenticatedAccess(Method method, Class<?> resourceClass) {
        return method.isAnnotationPresent(AuthenticatedAccess.class)
                || resourceClass.isAnnotationPresent(AuthenticatedAccess.class);
    }

    private RoleRequired getRoleRequired(Method method, Class<?> resourceClass) {
        RoleRequired methodAnnotation = method.getAnnotation(RoleRequired.class);
        if (methodAnnotation != null) {
            return methodAnnotation;
        }
        return resourceClass.getAnnotation(RoleRequired.class);
    }

    private void abort(ContainerRequestContext requestContext, Response.Status status, String message) {
        requestContext.abortWith(Response.status(status)
                .type(MediaType.APPLICATION_JSON)
                .entity(new ApiErrorResponse(message))
                .build());
    }
}
