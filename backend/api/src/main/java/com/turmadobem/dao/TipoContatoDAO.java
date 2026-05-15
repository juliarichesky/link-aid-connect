package com.turmadobem.dao;

import com.turmadobem.model.TipoContato;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class TipoContatoDAO implements PanacheRepository<TipoContato> {
    public TipoContato buscarPorCodigo(String codigo) {
        return find("upper(codigo) = ?1", normalizar(codigo)).firstResult();
    }

    private String normalizar(String valor) {
        return valor == null ? null : valor.trim().toUpperCase();
    }
}
