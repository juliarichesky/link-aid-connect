package com.turmadobem.repository;

import com.turmadobem.dto.HistoricoContatoResponse;
import com.turmadobem.dto.HistoricoContatoTicketResponse;
import com.turmadobem.support.ConexaoBD;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@ApplicationScoped
public class HistoricoContatoRepository {
    @Inject
    ConexaoBD conexaoBD;

    public HistoricoContatoResponse buscarHistoricoPorContato(int idContato) throws SQLException {
        String sqlContato = """
                SELECT
                    C.ID_CONTATO,
                    C.NM_CONTATO,
                    C.DOC_CONTATO,
                    C.EMAIL_CONTATO,
                    C.TEL_CONTATO,
                    C.CANAL_ORIGEM,
                    NVL(COUNT(T.ID_TICKET), 0) AS TOTAL_TICKETS,
                    MAX(T.DT_ATUALIZACAO) AS ULTIMO_ATENDIMENTO
                FROM CONTATO C
                LEFT JOIN TICKET T ON T.ID_CONTATO = C.ID_CONTATO
                WHERE C.ID_CONTATO = ?
                GROUP BY C.ID_CONTATO, C.NM_CONTATO, C.DOC_CONTATO, C.EMAIL_CONTATO, C.TEL_CONTATO, C.CANAL_ORIGEM
                """;

        try (Connection connection = conexaoBD.conectar();
             PreparedStatement stmt = connection.prepareStatement(sqlContato)) {
            stmt.setInt(1, idContato);
            try (ResultSet rs = stmt.executeQuery()) {
                if (!rs.next()) {
                    return null;
                }

                return new HistoricoContatoResponse(
                        rs.getInt("ID_CONTATO"),
                        rs.getString("NM_CONTATO"),
                        rs.getString("DOC_CONTATO"),
                        rs.getString("EMAIL_CONTATO"),
                        rs.getString("TEL_CONTATO"),
                        rs.getString("CANAL_ORIGEM"),
                        rs.getInt("TOTAL_TICKETS"),
                        toLocalDateTime(rs.getTimestamp("ULTIMO_ATENDIMENTO")),
                        buscarTicketsPorContato(connection, idContato)
                );
            }
        }
    }

    public List<HistoricoContatoTicketResponse> buscarTicketsPorContatoId(int idContato) throws SQLException {
        try (Connection connection = conexaoBD.conectar()) {
            return buscarTicketsPorContato(connection, idContato);
        }
    }

    public List<HistoricoContatoTicketResponse> buscarTicketsPorDocumento(String documento) throws SQLException {
        String sqlContato = "SELECT ID_CONTATO FROM CONTATO WHERE DOC_CONTATO = ?";
        try (Connection connection = conexaoBD.conectar();
             PreparedStatement stmt = connection.prepareStatement(sqlContato)) {
            stmt.setString(1, documento);
            try (ResultSet rs = stmt.executeQuery()) {
                if (!rs.next()) {
                    return null;
                }
                return buscarTicketsPorContato(connection, rs.getInt("ID_CONTATO"));
            }
        }
    }

    private List<HistoricoContatoTicketResponse> buscarTicketsPorContato(Connection connection, int idContato) throws SQLException {
        String sqlTickets = """
                SELECT
                    T.ID_TICKET,
                    T.NR_PROTOCOLO,
                    T.ASSUNTO,
                    T.DESC_TICKET,
                    T.STATUS_TICKET,
                    T.PRIORIDADE_TICKET,
                    T.CANAL_ORIGEM,
                    T.DT_ABERTURA,
                    T.DT_ATUALIZACAO
                FROM TICKET T
                WHERE T.ID_CONTATO = ?
                ORDER BY T.DT_ABERTURA DESC, T.ID_TICKET DESC
                """;
        List<HistoricoContatoTicketResponse> tickets = new ArrayList<>();
        try (PreparedStatement stmt = connection.prepareStatement(sqlTickets)) {
            stmt.setInt(1, idContato);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    tickets.add(new HistoricoContatoTicketResponse(
                            rs.getInt("ID_TICKET"),
                            rs.getString("NR_PROTOCOLO"),
                            rs.getString("ASSUNTO"),
                            rs.getString("DESC_TICKET"),
                            rs.getString("STATUS_TICKET"),
                            rs.getString("PRIORIDADE_TICKET"),
                            rs.getString("CANAL_ORIGEM"),
                            toLocalDateTime(rs.getTimestamp("DT_ABERTURA")),
                            toLocalDateTime(rs.getTimestamp("DT_ATUALIZACAO"))
                    ));
                }
            }
        }
        return tickets;
    }

    private LocalDateTime toLocalDateTime(Timestamp timestamp) {
        return timestamp == null ? null : timestamp.toLocalDateTime();
    }
}
