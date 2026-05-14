package com.turmadobem.service;

import com.turmadobem.entity.Usuario;
import com.turmadobem.repository.UsuarioRepository;
import com.turmadobem.resource.LoginRequest;
import com.turmadobem.resource.LoginResponse;
import com.turmadobem.security.AuthSessionService;
import com.turmadobem.security.CurrentUser;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.sql.SQLException;

@ApplicationScoped
public class AuthService {
    private static final Logger LOG = Logger.getLogger(AuthService.class);

    @Inject
    UsuarioRepository usuarioRepository;

    @Inject
    AuthSessionService authSessionService;

    @Inject
    CurrentUser currentUser;

    public LoginResponse login(LoginRequest request) throws SQLException {
        if (request == null || request.getEmail() == null || request.getEmail().isBlank()
                || request.getSenha() == null || request.getSenha().isBlank()) {
            throw new IllegalArgumentException("Email e senha sao obrigatorios.");
        }

        Usuario usuario = usuarioRepository.findByEmail(request.getEmail().trim());
        if (usuario == null || usuario.getSenha() == null || !usuario.getSenha().equals(request.getSenha())) {
            throw new IllegalArgumentException("Credenciais invalidas.");
        }
        if (!"ATIVO".equalsIgnoreCase(usuario.getStatus())) {
            throw new IllegalArgumentException("Usuario inativo.");
        }

        String token = authSessionService.createSession(usuario);
        LOG.infov("Login realizado para usuario {0} com role {1}.", usuario.getEmail(), usuario.getRole());
        return new LoginResponse(token, usuario.getIdUsuario(), usuario.getNome(), usuario.getEmail(), usuario.getRole());
    }

    public Usuario me() {
        Usuario usuario = currentUser.getUsuario();
        if (usuario == null) {
            throw new IllegalArgumentException("Usuario autenticado nao encontrado.");
        }
        return usuario;
    }
}
