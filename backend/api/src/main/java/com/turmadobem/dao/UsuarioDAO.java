package com.turmadobem.dao;

import com.turmadobem.model.Usuario;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import io.quarkus.panache.common.Sort;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;

@ApplicationScoped
public class UsuarioDAO implements PanacheRepository<Usuario> {
    public Usuario buscarPorEmail(String email) {
        if (email == null || email.isBlank()) {
            return null;
        }
        return find("upper(email) = ?1", email.trim().toUpperCase()).firstResult();
    }

    public List<Usuario> listarOrdenado(boolean apenasAtivos) {
        if (apenasAtivos) {
            return list("status = ?1 order by nome", "A");
        }
        return listAll(Sort.ascending("nome"));
    }
}
