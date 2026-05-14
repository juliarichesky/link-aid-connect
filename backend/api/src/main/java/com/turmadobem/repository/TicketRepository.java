package com.turmadobem.repository;

import com.turmadobem.entity.Contato;
import com.turmadobem.entity.Dentista;
import com.turmadobem.entity.Ticket;
import com.turmadobem.support.ConexaoBD;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

@ApplicationScoped
public class TicketRepository {
    private static final Map<String, String> COLUNAS_ORDENACAO = Map.of(
            "T.ID_TICKET", "T.ID_TICKET",
            "T.NR_PROTOCOLO", "T.NR_PROTOCOLO",
            "T.ASSUNTO", "T.ASSUNTO",
            "T.STATUS_TICKET", "T.STATUS_TICKET",
            "T.PRIORIDADE_TICKET", "T.PRIORIDADE_TICKET",
            "T.CANAL_ORIGEM", "T.CANAL_ORIGEM",
            "T.DT_ABERTURA", "T.DT_ABERTURA",
            "T.DT_ATUALIZACAO", "T.DT_ATUALIZACAO"
    );
    private static final Set<String> DIRECOES_ORDENACAO = Set.of("ASC", "DESC");

    @Inject
    ConexaoBD conexaoBD;

    public Ticket create(Ticket ticket) throws SQLException {
        String sql = """
                INSERT INTO TICKET (
                    ID_TICKET, NR_PROTOCOLO, ID_CONTATO, CANAL_ORIGEM, ASSUNTO, DESC_TICKET,
                    STATUS_TICKET, PRIORIDADE_TICKET, ID_DENTISTA_RESPONSAVEL, DT_ABERTURA, DT_ATUALIZACAO
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """;
        try (Connection connection = conexaoBD.conectar();
             PreparedStatement stmt = connection.prepareStatement(sql)) {
            preencherStatement(ticket, stmt);
            stmt.executeUpdate();
            return ticket;
        }
    }

    public Ticket findById(int idTicket) throws SQLException {
        String sql = baseSelect() + " WHERE T.ID_TICKET = ?";
        try (Connection connection = conexaoBD.conectar();
             PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setInt(1, idTicket);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapTicket(rs);
                }
            }
        }
        return null;
    }

    public List<Ticket> findAll(Integer idContato, String canalOrigem) throws SQLException {
        StringBuilder sql = new StringBuilder(baseSelect()).append(" WHERE 1 = 1");
        List<Object> parametros = new ArrayList<>();
        if (idContato != null) {
            sql.append(" AND T.ID_CONTATO = ?");
            parametros.add(idContato);
        }
        if (canalOrigem != null && !canalOrigem.isBlank()) {
            sql.append(" AND UPPER(T.CANAL_ORIGEM) = ?");
            parametros.add(canalOrigem.toUpperCase());
        }
        sql.append(" ORDER BY T.ID_TICKET");
        return executarConsulta(sql.toString(), parametros);
    }

    public List<Ticket> findAll(Integer idContato, String canalOrigem, int page, int size,
                                String sortColumn, String sortOrder) throws SQLException {
        int pageNormalizada = validarPage(page);
        int sizeNormalizado = validarSize(size);
        String colunaSegura = normalizarColunaOrdenacao(sortColumn);
        String ordemSegura = normalizarOrdem(sortOrder);
        StringBuilder sql = new StringBuilder(baseSelect()).append(" WHERE 1 = 1");
        List<Object> parametros = new ArrayList<>();
        if (idContato != null) {
            sql.append(" AND T.ID_CONTATO = ?");
            parametros.add(idContato);
        }
        if (canalOrigem != null && !canalOrigem.isBlank()) {
            sql.append(" AND UPPER(T.CANAL_ORIGEM) = ?");
            parametros.add(canalOrigem.toUpperCase());
        }
        sql.append(" ORDER BY ").append(colunaSegura).append(' ').append(ordemSegura);
        if (!"T.ID_TICKET".equals(colunaSegura)) {
            sql.append(", T.ID_TICKET ASC");
        }
        sql.append(" OFFSET ? ROWS FETCH NEXT ? ROWS ONLY");
        parametros.add(pageNormalizada * sizeNormalizado);
        parametros.add(sizeNormalizado);
        return executarConsulta(sql.toString(), parametros);
    }

    public List<Ticket> findByDentistaResponsavel(int idDentista) throws SQLException {
        String sql = baseSelect() + " WHERE T.ID_DENTISTA_RESPONSAVEL = ? ORDER BY T.ID_TICKET";
        List<Object> parametros = List.of(idDentista);
        return executarConsulta(sql, parametros);
    }

    public Ticket update(Ticket ticket) throws SQLException {
        String sql = """
                UPDATE TICKET
                SET ID_CONTATO = ?, CANAL_ORIGEM = ?, ASSUNTO = ?, DESC_TICKET = ?,
                    STATUS_TICKET = ?, PRIORIDADE_TICKET = ?, ID_DENTISTA_RESPONSAVEL = ?, DT_ATUALIZACAO = ?
                WHERE ID_TICKET = ?
                """;
        try (Connection connection = conexaoBD.conectar();
             PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setInt(1, ticket.getIdContato());
            stmt.setString(2, ticket.getCanalOrigem());
            stmt.setString(3, ticket.getAssunto());
            stmt.setString(4, ticket.getDescricao());
            stmt.setString(5, ticket.getStatus());
            stmt.setString(6, ticket.getPrioridade());
            if (ticket.getIdDentistaResponsavel() != null) {
                stmt.setInt(7, ticket.getIdDentistaResponsavel());
            } else {
                stmt.setNull(7, java.sql.Types.INTEGER);
            }
            stmt.setTimestamp(8, Timestamp.valueOf(ticket.getDataAtualizacao()));
            stmt.setInt(9, ticket.getIdTicket());
            if (stmt.executeUpdate() == 0) {
                throw new SQLException("Ticket nao encontrado para atualizacao.");
            }
            return ticket;
        }
    }

    public int nextId() throws SQLException {
        String sql = "SELECT NVL(MAX(ID_TICKET), 0) + 1 FROM TICKET";
        try (Connection connection = conexaoBD.conectar();
             PreparedStatement stmt = connection.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            rs.next();
            return rs.getInt(1);
        }
    }

    private List<Ticket> executarConsulta(String sql, List<Object> parametros) throws SQLException {
        List<Ticket> tickets = new ArrayList<>();
        try (Connection connection = conexaoBD.conectar();
             PreparedStatement stmt = connection.prepareStatement(sql)) {
            for (int i = 0; i < parametros.size(); i++) {
                Object valor = parametros.get(i);
                if (valor instanceof Integer inteiro) {
                    stmt.setInt(i + 1, inteiro);
                } else {
                    stmt.setString(i + 1, String.valueOf(valor));
                }
            }
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    tickets.add(mapTicket(rs));
                }
            }
        }
        return tickets;
    }

    private void preencherStatement(Ticket ticket, PreparedStatement stmt) throws SQLException {
        stmt.setInt(1, ticket.getIdTicket());
        stmt.setString(2, ticket.getProtocolo());
        stmt.setInt(3, ticket.getIdContato());
        stmt.setString(4, ticket.getCanalOrigem());
        stmt.setString(5, ticket.getAssunto());
        stmt.setString(6, ticket.getDescricao());
        stmt.setString(7, ticket.getStatus());
        stmt.setString(8, ticket.getPrioridade());
        if (ticket.getIdDentistaResponsavel() != null) {
            stmt.setInt(9, ticket.getIdDentistaResponsavel());
        } else {
            stmt.setNull(9, java.sql.Types.INTEGER);
        }
        stmt.setTimestamp(10, Timestamp.valueOf(ticket.getDataAbertura()));
        stmt.setTimestamp(11, Timestamp.valueOf(ticket.getDataAtualizacao()));
    }

    private String baseSelect() {
        return """
                SELECT T.ID_TICKET, T.NR_PROTOCOLO, T.ID_CONTATO, T.CANAL_ORIGEM AS TICKET_CANAL_ORIGEM, T.ASSUNTO, T.DESC_TICKET,
                       T.STATUS_TICKET, T.PRIORIDADE_TICKET, T.ID_DENTISTA_RESPONSAVEL, T.DT_ABERTURA, T.DT_ATUALIZACAO,
                       C.NM_CONTATO, C.DOC_CONTATO, C.EMAIL_CONTATO, C.TEL_CONTATO, C.CANAL_ORIGEM AS CONTATO_CANAL_ORIGEM,
                       D.NM_DENTISTA, D.NR_CRO, D.ESPECIALIDADE, D.SG_ESTADO, D.STATUS_DENTISTA
                FROM TICKET T
                JOIN CONTATO C ON C.ID_CONTATO = T.ID_CONTATO
                LEFT JOIN DENTISTA D ON D.ID_DENTISTA = T.ID_DENTISTA_RESPONSAVEL
                """;
    }

    private Ticket mapTicket(ResultSet rs) throws SQLException {
        Ticket ticket = new Ticket(
                rs.getInt("ID_TICKET"),
                rs.getString("NR_PROTOCOLO"),
                rs.getInt("ID_CONTATO"),
                rs.getString("TICKET_CANAL_ORIGEM"),
                rs.getString("ASSUNTO"),
                rs.getString("DESC_TICKET"),
                rs.getString("STATUS_TICKET"),
                rs.getString("PRIORIDADE_TICKET"),
                rs.getTimestamp("DT_ABERTURA").toLocalDateTime(),
                rs.getTimestamp("DT_ATUALIZACAO").toLocalDateTime()
        );
        Number idDentista = (Number) rs.getObject("ID_DENTISTA_RESPONSAVEL");
        ticket.setIdDentistaResponsavel(idDentista == null ? null : idDentista.intValue());
        ticket.setContato(new Contato(
                rs.getInt("ID_CONTATO"),
                rs.getString("NM_CONTATO"),
                rs.getString("DOC_CONTATO"),
                rs.getString("EMAIL_CONTATO"),
                rs.getString("TEL_CONTATO"),
                rs.getString("CONTATO_CANAL_ORIGEM")
        ));
        if (idDentista != null) {
            ticket.setDentistaResponsavel(new Dentista(
                    idDentista.intValue(),
                    rs.getString("NM_DENTISTA"),
                    rs.getString("NR_CRO"),
                    rs.getString("ESPECIALIDADE"),
                    rs.getString("SG_ESTADO"),
                    rs.getString("STATUS_DENTISTA")
            ));
        }
        return ticket;
    }

    private int validarPage(int page) {
        if (page < 0) {
            throw new IllegalArgumentException("O parametro page deve ser maior ou igual a zero.");
        }
        return page;
    }

    private int validarSize(int size) {
        if (size <= 0 || size > 100) {
            throw new IllegalArgumentException("O parametro size deve estar entre 1 e 100.");
        }
        return size;
    }

    private String normalizarColunaOrdenacao(String sortColumn) {
        if (sortColumn == null || sortColumn.isBlank()) {
            return "T.ID_TICKET";
        }
        return COLUNAS_ORDENACAO.getOrDefault(sortColumn, "T.ID_TICKET");
    }

    private String normalizarOrdem(String sortOrder) {
        if (sortOrder == null || sortOrder.isBlank()) {
            return "ASC";
        }
        String ordem = sortOrder.trim().toUpperCase();
        if (!DIRECOES_ORDENACAO.contains(ordem)) {
            return "ASC";
        }
        return ordem;
    }
}
