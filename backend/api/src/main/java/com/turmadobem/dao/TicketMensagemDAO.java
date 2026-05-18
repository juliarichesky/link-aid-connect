package com.turmadobem.dao;

import com.turmadobem.model.TicketMensagem;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;

@ApplicationScoped
public class TicketMensagemDAO implements PanacheRepository<TicketMensagem> {
    public List<TicketMensagem> listarPorTicket(Long idTicket) {
        return list("ticket.idTicket = ?1 order by dataMensagem asc, idMensagem asc", idTicket);
    }

    public boolean existeAtendentePorTicket(Long idTicket) {
        return count("ticket.idTicket = ?1 and tipoRemetente = ?2", idTicket, "ATENDENTE") > 0;
    }
}
