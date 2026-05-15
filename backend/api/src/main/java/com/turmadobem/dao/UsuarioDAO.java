package com.turmadobem.dao;

import com.turmadobem.model.Usuario;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class UsuarioDAO implements PanacheRepository<Usuario> {
    public Usuario buscarPorEmail(String email) {
        if (email == null || email.isBlank()) {
            return null;
        }
        return find("upper(email) = ?1", email.trim().toUpperCase()).firstResult();
    }
}
