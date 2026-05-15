package com.turmadobem.security;

import com.turmadobem.model.Usuario;
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
        Usuario sessao = new Usuario();
        sessao.setIdUsuario(usuario.getIdUsuario());
        sessao.setNome(usuario.getNome());
        sessao.setEmail(usuario.getEmail());
        sessao.setPerfil(usuario.getPerfil());
        sessao.setStatus(usuario.getStatus());
        return sessao;
    }
}
