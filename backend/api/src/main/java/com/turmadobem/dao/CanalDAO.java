package com.turmadobem.dao;

import com.turmadobem.model.Canal;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class CanalDAO implements PanacheRepository<Canal> {
    public Canal buscarPorCodigo(String codigo) {
        return find("upper(codigo) = ?1", normalizar(codigo)).firstResult();
    }

    private String normalizar(String valor) {
        return valor == null ? null : valor.trim().toUpperCase();
    }
}
