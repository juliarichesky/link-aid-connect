package com.turmadobem.dao;

import com.turmadobem.model.AgendaDentista;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class AgendaDentistaDAO implements PanacheRepository<AgendaDentista> {
}
