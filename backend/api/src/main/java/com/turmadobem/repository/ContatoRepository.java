package com.turmadobem.repository;

import com.turmadobem.entity.Contato;
import com.turmadobem.support.ConexaoBD;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

@ApplicationScoped
public class ContatoRepository {
    private static final Map<String, String> COLUNAS_ORDENACAO = Map.of(
            "ID_CONTATO", "ID_CONTATO",
            "NM_CONTATO", "NM_CONTATO",
            "DOC_CONTATO", "DOC_CONTATO",
            "EMAIL_CONTATO", "EMAIL_CONTATO",
            "CANAL_ORIGEM", "CANAL_ORIGEM"
    );
    private static final Set<String> DIRECOES_ORDENACAO = Set.of("ASC", "DESC");

    @Inject
    ConexaoBD conexaoBD;

    public Contato create(Contato contato) throws SQLException {
        String sql = """
                INSERT INTO CONTATO (ID_CONTATO, NM_CONTATO, DOC_CONTATO, EMAIL_CONTATO, TEL_CONTATO, CANAL_ORIGEM)
                VALUES (?, ?, ?, ?, ?, ?)
                """;
        try (Connection connection = conexaoBD.conectar();
             PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setInt(1, contato.getIdContato());
            stmt.setString(2, contato.getNome());
            stmt.setString(3, contato.getDocumento());
            stmt.setString(4, contato.getEmail());
            stmt.setString(5, contato.getTelefone());
            stmt.setString(6, contato.getCanalOrigem());
            stmt.executeUpdate();
            return contato;
        }
    }

    public Contato findById(int idContato) throws SQLException {
        String sql = """
                SELECT ID_CONTATO, NM_CONTATO, DOC_CONTATO, EMAIL_CONTATO, TEL_CONTATO, CANAL_ORIGEM
                FROM CONTATO
                WHERE ID_CONTATO = ?
                """;
        try (Connection connection = conexaoBD.conectar();
             PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setInt(1, idContato);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapContato(rs);
                }
            }
        }
        return null;
    }

    public Contato findByDocumento(String documento) throws SQLException {
        String sql = """
                SELECT ID_CONTATO, NM_CONTATO, DOC_CONTATO, EMAIL_CONTATO, TEL_CONTATO, CANAL_ORIGEM
                FROM CONTATO
                WHERE DOC_CONTATO = ?
                """;
        try (Connection connection = conexaoBD.conectar();
             PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setString(1, documento);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapContato(rs);
                }
            }
        }
        return null;
    }

    public List<Contato> findAll() throws SQLException {
        String sql = """
                SELECT ID_CONTATO, NM_CONTATO, DOC_CONTATO, EMAIL_CONTATO, TEL_CONTATO, CANAL_ORIGEM
                FROM CONTATO
                ORDER BY ID_CONTATO
                """;
        List<Contato> contatos = new ArrayList<>();
        try (Connection connection = conexaoBD.conectar();
             PreparedStatement stmt = connection.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                contatos.add(mapContato(rs));
            }
        }
        return contatos;
    }

    public List<Contato> findAll(int page, int size, String sortColumn, String sortOrder) throws SQLException {
        int pageNormalizada = validarPage(page);
        int sizeNormalizado = validarSize(size);
        String colunaSegura = normalizarColunaOrdenacao(sortColumn);
        String ordemSegura = normalizarOrdem(sortOrder);
        String sql = """
                SELECT ID_CONTATO, NM_CONTATO, DOC_CONTATO, EMAIL_CONTATO, TEL_CONTATO, CANAL_ORIGEM
                FROM CONTATO
                ORDER BY %s %s, ID_CONTATO ASC
                OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
                """.formatted(colunaSegura, ordemSegura);
        List<Contato> contatos = new ArrayList<>();
        try (Connection connection = conexaoBD.conectar();
             PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setInt(1, pageNormalizada * sizeNormalizado);
            stmt.setInt(2, sizeNormalizado);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    contatos.add(mapContato(rs));
                }
            }
        }
        return contatos;
    }

    public Contato update(Contato contato) throws SQLException {
        String sql = """
                UPDATE CONTATO
                SET NM_CONTATO = ?, DOC_CONTATO = ?, EMAIL_CONTATO = ?, TEL_CONTATO = ?, CANAL_ORIGEM = ?
                WHERE ID_CONTATO = ?
                """;
        try (Connection connection = conexaoBD.conectar();
             PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setString(1, contato.getNome());
            stmt.setString(2, contato.getDocumento());
            stmt.setString(3, contato.getEmail());
            stmt.setString(4, contato.getTelefone());
            stmt.setString(5, contato.getCanalOrigem());
            stmt.setInt(6, contato.getIdContato());
            if (stmt.executeUpdate() == 0) {
                throw new SQLException("Contato nao encontrado para atualizacao.");
            }
            return contato;
        }
    }

    public void delete(int idContato) throws SQLException {
        String sql = "DELETE FROM CONTATO WHERE ID_CONTATO = ?";
        try (Connection connection = conexaoBD.conectar();
             PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setInt(1, idContato);
            if (stmt.executeUpdate() == 0) {
                throw new SQLException("Contato nao encontrado para remocao.");
            }
        }
    }

    public int nextId() throws SQLException {
        String sql = "SELECT NVL(MAX(ID_CONTATO), 0) + 1 FROM CONTATO";
        try (Connection connection = conexaoBD.conectar();
             PreparedStatement stmt = connection.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            rs.next();
            return rs.getInt(1);
        }
    }

    private Contato mapContato(ResultSet rs) throws SQLException {
        return new Contato(
                rs.getInt("ID_CONTATO"),
                rs.getString("NM_CONTATO"),
                rs.getString("DOC_CONTATO"),
                rs.getString("EMAIL_CONTATO"),
                rs.getString("TEL_CONTATO"),
                rs.getString("CANAL_ORIGEM")
        );
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
            return "ID_CONTATO";
        }
        return COLUNAS_ORDENACAO.getOrDefault(sortColumn, "ID_CONTATO");
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
