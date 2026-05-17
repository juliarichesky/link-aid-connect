package com.turmadobem.dao;

import com.turmadobem.model.Ticket;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import io.quarkus.panache.common.Sort;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.TypedQuery;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@ApplicationScoped
public class TicketDAO implements PanacheRepository<Ticket> {
    public List<Ticket> pesquisar(String statusCodigo, String canalCodigo, Long responsavelId, int page, int size) {
        StringBuilder jpql = new StringBuilder("1 = 1");
        Map<String, Object> params = new HashMap<>();

        if (statusCodigo != null && !statusCodigo.isBlank()) {
            jpql.append(" and upper(status.codigo) = :status");
            params.put("status", statusCodigo.trim().toUpperCase());
        }
        if (canalCodigo != null && !canalCodigo.isBlank()) {
            jpql.append(" and upper(canal.codigo) = :canal");
            params.put("canal", canalCodigo.trim().toUpperCase());
        }
        if (responsavelId != null) {
            jpql.append(" and usuarioResponsavel.idUsuario = :responsavelId");
            params.put("responsavelId", responsavelId);
        }

        return find(jpql.toString(), Sort.descending("dataAtualizacao"), params)
                .page(Math.max(page, 0), Math.min(Math.max(size, 1), 100))
                .list();
    }

    public List<Ticket> listarPorContato(Long idContato) {
        return list("contato.idContato = ?1 order by dataAbertura desc", idContato);
    }

    public List<Ticket> ultimosTickets(int limite) {
        return find("order by dataAbertura desc")
                .page(0, Math.min(Math.max(limite, 1), 20))
                .list();
    }

    public List<Ticket> notificacoesRecentes(int limite) {
        TypedQuery<Ticket> query = getEntityManager().createQuery("""
                select t
                from Ticket t
                join fetch t.status
                join fetch t.prioridade
                where t.status.codigo not in :statusFinais
                order by t.dataAtualizacao desc, t.idTicket desc
                """, Ticket.class);
        query.setParameter("statusFinais", List.of("RESOLVIDO", "CANCELADO", "ARQUIVADO"));
        query.setMaxResults(Math.min(Math.max(limite, 1), 20));
        return query.getResultList();
    }

    public List<Object[]> contarPorStatus() {
        TypedQuery<Object[]> query = getEntityManager().createQuery("""
                select t.status.codigo, t.status.nome, count(t)
                from Ticket t
                group by t.status.codigo, t.status.nome
                order by t.status.codigo
                """, Object[].class);
        return query.getResultList();
    }

    public List<Object[]> contarPorCanal() {
        TypedQuery<Object[]> query = getEntityManager().createQuery("""
                select t.canal.codigo, t.canal.nome, count(t)
                from Ticket t
                group by t.canal.codigo, t.canal.nome
                order by t.canal.codigo
                """, Object[].class);
        return query.getResultList();
    }
}
