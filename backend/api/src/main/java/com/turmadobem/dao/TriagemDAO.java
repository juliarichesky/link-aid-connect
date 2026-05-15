package com.turmadobem.dao;

import com.turmadobem.model.Triagem;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class TriagemDAO implements PanacheRepository<Triagem> {
}
