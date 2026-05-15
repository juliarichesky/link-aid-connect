package com.turmadobem.bo;

import com.turmadobem.dao.ContatoDAO;
import com.turmadobem.dao.DentistaDAO;
import com.turmadobem.dao.TicketDAO;
import com.turmadobem.dto.LinkAidDtos;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.util.List;

@ApplicationScoped
public class DashboardBO {
    @Inject
    ContatoDAO contatoDAO;

    @Inject
    TicketDAO ticketDAO;

    @Inject
    DentistaDAO dentistaDAO;

    @Transactional(Transactional.TxType.SUPPORTS)
    public LinkAidDtos.DashboardResponse dashboard() {
        return new LinkAidDtos.DashboardResponse(
                resumo(),
                ticketsPorStatus(),
                ticketsPorCanal(),
                ultimosTickets(5)
        );
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public LinkAidDtos.DashboardResumoResponse resumo() {
        return new LinkAidDtos.DashboardResumoResponse(
                contatoDAO.count(),
                ticketDAO.count(),
                ticketDAO.count("status.codigo = ?1", "NOVO"),
                ticketDAO.count("status.codigo = ?1", "EM_ATENDIMENTO"),
                ticketDAO.count("status.codigo = ?1", "RESOLVIDO"),
                dentistaDAO.count(),
                dentistaDAO.count("status = ?1", "A")
        );
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public List<LinkAidDtos.AgrupamentoResponse> ticketsPorStatus() {
        return ticketDAO.contarPorStatus().stream()
                .map(row -> new LinkAidDtos.AgrupamentoResponse(
                        (String) row[0],
                        (String) row[1],
                        (Long) row[2]
                ))
                .toList();
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public List<LinkAidDtos.AgrupamentoResponse> ticketsPorCanal() {
        return ticketDAO.contarPorCanal().stream()
                .map(row -> new LinkAidDtos.AgrupamentoResponse(
                        (String) row[0],
                        (String) row[1],
                        (Long) row[2]
                ))
                .toList();
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public List<LinkAidDtos.TicketResponse> ultimosTickets(int limite) {
        return ticketDAO.ultimosTickets(limite).stream()
                .map(ticket -> ApiMapper.ticket(ticket, List.of()))
                .toList();
    }
}
