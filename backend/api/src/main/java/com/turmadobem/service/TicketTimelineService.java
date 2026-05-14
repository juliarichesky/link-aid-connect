package com.turmadobem.service;

import com.turmadobem.dto.TicketTimelineResponse;
import com.turmadobem.repository.TicketTimelineRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.sql.SQLException;

@ApplicationScoped
public class TicketTimelineService {
    @Inject
    TicketTimelineRepository ticketTimelineRepository;

    public TicketTimelineResponse buscarTimeline(int idTicket) throws SQLException {
        return ticketTimelineRepository.buscarTimeline(idTicket);
    }
}
