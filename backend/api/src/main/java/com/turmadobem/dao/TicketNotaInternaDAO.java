package com.turmadobem.dao;

import com.turmadobem.model.TicketNotaInterna;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;

@ApplicationScoped
public class TicketNotaInternaDAO implements PanacheRepository<TicketNotaInterna> {
    public List<TicketNotaInterna> listarPorTicket(Long idTicket) {
        return list("ticket.idTicket = ?1 order by dataNota desc", idTicket);
    }
}
