package com.turmadobem.dao;

import com.turmadobem.model.TicketNotaInterna;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class TicketNotaInternaDAO implements PanacheRepository<TicketNotaInterna> {
}
