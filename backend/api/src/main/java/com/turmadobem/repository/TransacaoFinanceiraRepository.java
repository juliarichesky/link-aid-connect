package com.turmadobem.repository;

import com.turmadobem.entity.Contato;
import com.turmadobem.entity.TransacaoFinanceira;
import com.turmadobem.entity.Usuario;
import com.turmadobem.support.ConexaoBD;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@ApplicationScoped
public class TransacaoFinanceiraRepository {
    @Inject
    ConexaoBD conexaoBD;

    public TransacaoFinanceira create(TransacaoFinanceira transacao) throws SQLException {
        String sql = """
                INSERT INTO TRANSACAO_FINANCEIRA (
                    ID_TRANSACAO_FINANCEIRA, TP_TRANSACAO, VL_TRANSACAO, STATUS_TRANSACAO,
                    CATEGORIA_TRANSACAO, DS_TRANSACAO, DT_TRANSACAO, ID_USUARIO, ID_CONTATO
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """;
        try (Connection connection = conexaoBD.conectar();
             PreparedStatement stmt = connection.prepareStatement(sql)) {
            preencherStatement(stmt, transacao);
            stmt.executeUpdate();
            return transacao;
        }
    }

    public List<TransacaoFinanceira> findAll() throws SQLException {
        String sql = baseSelect() + " ORDER BY TF.DT_TRANSACAO DESC, TF.ID_TRANSACAO_FINANCEIRA DESC";
        List<TransacaoFinanceira> transacoes = new ArrayList<>();
        try (Connection connection = conexaoBD.conectar();
             PreparedStatement stmt = connection.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                transacoes.add(mapTransacao(rs));
            }
        }
        return transacoes;
    }

    public TransacaoFinanceira findById(int idTransacao) throws SQLException {
        String sql = baseSelect() + " WHERE TF.ID_TRANSACAO_FINANCEIRA = ?";
        try (Connection connection = conexaoBD.conectar();
             PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setInt(1, idTransacao);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapTransacao(rs);
                }
            }
        }
        return null;
    }

    public TransacaoFinanceira update(TransacaoFinanceira transacao) throws SQLException {
        String sql = """
                UPDATE TRANSACAO_FINANCEIRA
                SET TP_TRANSACAO = ?, VL_TRANSACAO = ?, STATUS_TRANSACAO = ?, CATEGORIA_TRANSACAO = ?,
                    DS_TRANSACAO = ?, DT_TRANSACAO = ?, ID_USUARIO = ?, ID_CONTATO = ?
                WHERE ID_TRANSACAO_FINANCEIRA = ?
                """;
        try (Connection connection = conexaoBD.conectar();
             PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setString(1, transacao.getTipo());
            stmt.setBigDecimal(2, transacao.getValor());
            stmt.setString(3, transacao.getStatus());
            stmt.setString(4, transacao.getCategoria());
            stmt.setString(5, transacao.getDescricao());
            stmt.setDate(6, Date.valueOf(transacao.getData()));
            stmt.setInt(7, transacao.getIdUsuario());
            stmt.setInt(8, transacao.getIdContato());
            stmt.setInt(9, transacao.getIdTransacaoFinanceira());
            if (stmt.executeUpdate() == 0) {
                throw new SQLException("Transacao financeira nao encontrada para atualizacao.");
            }
            return transacao;
        }
    }

    public void delete(int idTransacao) throws SQLException {
        String sql = "DELETE FROM TRANSACAO_FINANCEIRA WHERE ID_TRANSACAO_FINANCEIRA = ?";
        try (Connection connection = conexaoBD.conectar();
             PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setInt(1, idTransacao);
            if (stmt.executeUpdate() == 0) {
                throw new SQLException("Transacao financeira nao encontrada para remocao.");
            }
        }
    }

    public int nextId() throws SQLException {
        String sql = "SELECT NVL(MAX(ID_TRANSACAO_FINANCEIRA), 0) + 1 FROM TRANSACAO_FINANCEIRA";
        try (Connection connection = conexaoBD.conectar();
             PreparedStatement stmt = connection.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            rs.next();
            return rs.getInt(1);
        }
    }

    public BigDecimal somarPorTipo(String tipo) throws SQLException {
        String sql = "SELECT NVL(SUM(VL_TRANSACAO), 0) FROM TRANSACAO_FINANCEIRA WHERE TP_TRANSACAO = ?";
        try (Connection connection = conexaoBD.conectar();
             PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setString(1, tipo);
            try (ResultSet rs = stmt.executeQuery()) {
                rs.next();
                return rs.getBigDecimal(1);
            }
        }
    }

    private void preencherStatement(PreparedStatement stmt, TransacaoFinanceira transacao) throws SQLException {
        stmt.setInt(1, transacao.getIdTransacaoFinanceira());
        stmt.setString(2, transacao.getTipo());
        stmt.setBigDecimal(3, transacao.getValor());
        stmt.setString(4, transacao.getStatus());
        stmt.setString(5, transacao.getCategoria());
        stmt.setString(6, transacao.getDescricao());
        stmt.setDate(7, Date.valueOf(transacao.getData()));
        stmt.setInt(8, transacao.getIdUsuario());
        stmt.setInt(9, transacao.getIdContato());
    }

    private String baseSelect() {
        return """
                SELECT TF.ID_TRANSACAO_FINANCEIRA, TF.TP_TRANSACAO, TF.VL_TRANSACAO, TF.STATUS_TRANSACAO,
                       TF.CATEGORIA_TRANSACAO, TF.DS_TRANSACAO, TF.DT_TRANSACAO, TF.ID_USUARIO, TF.ID_CONTATO,
                       U.NM_USUARIO, U.EMAIL_USUARIO, U.STATUS_USUARIO,
                       C.NM_CONTATO, C.DOC_CONTATO, C.EMAIL_CONTATO, C.TEL_CONTATO, C.CANAL_ORIGEM
                FROM TRANSACAO_FINANCEIRA TF
                JOIN USUARIO_SISTEMA U ON U.ID_USUARIO = TF.ID_USUARIO
                JOIN CONTATO C ON C.ID_CONTATO = TF.ID_CONTATO
                """;
    }

    private TransacaoFinanceira mapTransacao(ResultSet rs) throws SQLException {
        TransacaoFinanceira transacao = new TransacaoFinanceira(
                rs.getInt("ID_TRANSACAO_FINANCEIRA"),
                rs.getString("TP_TRANSACAO"),
                rs.getBigDecimal("VL_TRANSACAO"),
                rs.getString("STATUS_TRANSACAO"),
                rs.getString("CATEGORIA_TRANSACAO"),
                rs.getString("DS_TRANSACAO"),
                rs.getDate("DT_TRANSACAO").toLocalDate(),
                rs.getInt("ID_USUARIO"),
                rs.getInt("ID_CONTATO")
        );
        transacao.setUsuario(new Usuario(
                rs.getInt("ID_USUARIO"),
                rs.getString("NM_USUARIO"),
                rs.getString("EMAIL_USUARIO"),
                null,
                null,
                rs.getString("STATUS_USUARIO")
        ));
        transacao.setContato(new Contato(
                rs.getInt("ID_CONTATO"),
                rs.getString("NM_CONTATO"),
                rs.getString("DOC_CONTATO"),
                rs.getString("EMAIL_CONTATO"),
                rs.getString("TEL_CONTATO"),
                rs.getString("CANAL_ORIGEM")
        ));
        return transacao;
    }
}
