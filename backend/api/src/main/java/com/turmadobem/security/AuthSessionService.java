package com.turmadobem.security;

import com.turmadobem.entity.Usuario;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@ApplicationScoped
public class AuthSessionService {
    private final Map<String, Usuario> sessions = new ConcurrentHashMap<>();

    public String createSession(Usuario usuario) {
        String token = UUID.randomUUID().toString();
        sessions.put(token, sanitize(usuario));
        return token;
    }

    public Usuario findByToken(String token) {
        return sessions.get(token);
    }

    private Usuario sanitize(Usuario usuario) {
        return new Usuario(
                usuario.getIdUsuario(),
                usuario.getNome(),
                usuario.getEmail(),
                null,
                usuario.getRole(),
                usuario.getStatus()
        );
    }
}
