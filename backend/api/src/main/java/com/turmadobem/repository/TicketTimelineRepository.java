package com.turmadobem.repository;

import com.turmadobem.dto.TicketTimelineContatoResponse;
import com.turmadobem.dto.TicketTimelineDentistaResponse;
import com.turmadobem.dto.TicketTimelineMensagemResponse;
import com.turmadobem.dto.TicketTimelineResponse;
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
public class TicketTimelineRepository {
    @Inject
    ConexaoBD conexaoBD;

    public TicketTimelineResponse buscarTimeline(int idTicket) throws SQLException {
        String sql = """
                SELECT
                    T.ID_TICKET,
                    T.NR_PROTOCOLO,
                    T.ASSUNTO,
                    T.DESC_TICKET,
                    T.STATUS_TICKET,
                    T.PRIORIDADE_TICKET,
                    T.CANAL_ORIGEM,
                    T.DT_ABERTURA,
                    T.DT_ATUALIZACAO,
                    C.ID_CONTATO,
                    C.NM_CONTATO,
                    C.DOC_CONTATO,
                    C.EMAIL_CONTATO,
                    C.TEL_CONTATO,
                    D.ID_DENTISTA,
                    D.NM_DENTISTA,
                    D.NR_CRO,
                    D.ESPECIALIDADE,
                    D.SG_ESTADO
                FROM TICKET T
                JOIN CONTATO C ON C.ID_CONTATO = T.ID_CONTATO
                LEFT JOIN DENTISTA D ON D.ID_DENTISTA = T.ID_DENTISTA_RESPONSAVEL
                WHERE T.ID_TICKET = ?
                """;

        try (Connection connection = conexaoBD.conectar();
             PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setInt(1, idTicket);
            try (ResultSet rs = stmt.executeQuery()) {
                if (!rs.next()) {
                    return null;
                }

                TicketTimelineDentistaResponse dentista = null;
                Number idDentista = (Number) rs.getObject("ID_DENTISTA");
                if (idDentista != null) {
                    dentista = new TicketTimelineDentistaResponse(
                            idDentista.intValue(),
                            rs.getString("NM_DENTISTA"),
                            rs.getString("NR_CRO"),
                            rs.getString("ESPECIALIDADE"),
                            rs.getString("SG_ESTADO")
                    );
                }

                return new TicketTimelineResponse(
                        rs.getInt("ID_TICKET"),
                        rs.getString("NR_PROTOCOLO"),
                        rs.getString("ASSUNTO"),
                        rs.getString("DESC_TICKET"),
                        rs.getString("STATUS_TICKET"),
                        rs.getString("PRIORIDADE_TICKET"),
                        rs.getString("CANAL_ORIGEM"),
                        toLocalDateTime(rs.getTimestamp("DT_ABERTURA")),
                        toLocalDateTime(rs.getTimestamp("DT_ATUALIZACAO")),
                        new TicketTimelineContatoResponse(
                                rs.getInt("ID_CONTATO"),
                                rs.getString("NM_CONTATO"),
                                rs.getString("DOC_CONTATO"),
                                rs.getString("EMAIL_CONTATO"),
                                rs.getString("TEL_CONTATO")
                        ),
                        dentista,
                        buscarMensagens(connection, idTicket)
                );
            }
        }
    }

    private List<TicketTimelineMensagemResponse> buscarMensagens(Connection connection, int idTicket) throws SQLException {
        String sql = """
                SELECT ID_MENSAGEM, TP_REMETENTE, DS_CONTEUDO, DT_HORA
                FROM MENSAGEM
                WHERE ID_TICKET = ?
                ORDER BY DT_HORA ASC, ID_MENSAGEM ASC
                """;
        List<TicketTimelineMensagemResponse> mensagens = new ArrayList<>();
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setInt(1, idTicket);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    mensagens.add(new TicketTimelineMensagemResponse(
                            rs.getInt("ID_MENSAGEM"),
                            rs.getString("TP_REMETENTE"),
                            rs.getString("DS_CONTEUDO"),
                            toLocalDateTime(rs.getTimestamp("DT_HORA"))
                    ));
                }
            }
        }
        return mensagens;
    }

    private LocalDateTime toLocalDateTime(Timestamp timestamp) {
        return timestamp == null ? null : timestamp.toLocalDateTime();
    }
}
