package com.turmadobem.dao;

import com.turmadobem.model.Dentista;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import io.quarkus.panache.common.Sort;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;

@ApplicationScoped
public class DentistaDAO implements PanacheRepository<Dentista> {
    public Dentista buscarPorCro(String cro) {
        if (cro == null || cro.isBlank()) {
            return null;
        }
        return find("upper(cro) = ?1", cro.trim().toUpperCase()).firstResult();
    }

    public List<Dentista> listarOrdenado() {
        return listAll(Sort.by("nome"));
    }
}
