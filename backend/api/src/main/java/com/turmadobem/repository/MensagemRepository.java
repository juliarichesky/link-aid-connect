package com.turmadobem.repository;

import com.turmadobem.entity.Mensagem;
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

@ApplicationScoped
public class MensagemRepository {
    @Inject
    ConexaoBD conexaoBD;

    public Mensagem create(Mensagem mensagem) throws SQLException {
        String sql = """
                INSERT INTO MENSAGEM (ID_MENSAGEM, ID_TICKET, TP_REMETENTE, DS_CONTEUDO, DT_HORA)
                VALUES (?, ?, ?, ?, ?)
                """;
        try (Connection connection = conexaoBD.conectar();
             PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setInt(1, mensagem.getIdMensagem());
            stmt.setInt(2, mensagem.getIdTicket());
            stmt.setString(3, mensagem.getRemetente());
            stmt.setString(4, mensagem.getConteudo());
            stmt.setTimestamp(5, Timestamp.valueOf(mensagem.getDataHora()));
            stmt.executeUpdate();
            return mensagem;
        }
    }

    public List<Mensagem> findByTicket(int idTicket) throws SQLException {
        String sql = """
                SELECT ID_MENSAGEM, ID_TICKET, TP_REMETENTE, DS_CONTEUDO, DT_HORA
                FROM MENSAGEM
                WHERE ID_TICKET = ?
                ORDER BY DT_HORA, ID_MENSAGEM
                """;
        List<Mensagem> mensagens = new ArrayList<>();
        try (Connection connection = conexaoBD.conectar();
             PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setInt(1, idTicket);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    mensagens.add(mapMensagem(rs));
                }
            }
        }
        return mensagens;
    }

    public void deleteByTicket(int idTicket) throws SQLException {
        String sql = "DELETE FROM MENSAGEM WHERE ID_TICKET = ?";
        try (Connection connection = conexaoBD.conectar();
             PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setInt(1, idTicket);
            stmt.executeUpdate();
        }
    }

    public int nextId() throws SQLException {
        String sql = "SELECT NVL(MAX(ID_MENSAGEM), 0) + 1 FROM MENSAGEM";
        try (Connection connection = conexaoBD.conectar();
             PreparedStatement stmt = connection.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            rs.next();
            return rs.getInt(1);
        }
    }

    private Mensagem mapMensagem(ResultSet rs) throws SQLException {
        return new Mensagem(
                rs.getInt("ID_MENSAGEM"),
                rs.getInt("ID_TICKET"),
                rs.getString("TP_REMETENTE"),
                rs.getString("DS_CONTEUDO"),
                rs.getTimestamp("DT_HORA").toLocalDateTime()
        );
    }
}
