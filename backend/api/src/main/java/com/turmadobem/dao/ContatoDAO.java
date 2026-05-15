package com.turmadobem.dao;

import com.turmadobem.model.Contato;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import io.quarkus.panache.common.Sort;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;

@ApplicationScoped
public class ContatoDAO implements PanacheRepository<Contato> {
    public Contato buscarPorDocumento(String documento) {
        if (documento == null || documento.isBlank()) {
            return null;
        }
        return find("documento", documento.trim()).firstResult();
    }

    public Contato buscarPorTelefone(String telefone) {
        if (telefone == null || telefone.isBlank()) {
            return null;
        }
        return find("telefone", telefone.trim()).firstResult();
    }

    public List<Contato> listarOrdenado() {
        return listAll(Sort.by("nome"));
    }
}
