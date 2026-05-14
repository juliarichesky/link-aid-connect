package com.turmadobem.repository;

import com.turmadobem.entity.Dentista;
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
public class DentistaRepository {
    private static final Map<String, String> COLUNAS_ORDENACAO = Map.of(
            "ID_DENTISTA", "ID_DENTISTA",
            "NM_DENTISTA", "NM_DENTISTA",
            "NR_CRO", "NR_CRO",
            "ESPECIALIDADE", "ESPECIALIDADE",
            "SG_ESTADO", "SG_ESTADO",
            "STATUS_DENTISTA", "STATUS_DENTISTA"
    );
    private static final Set<String> DIRECOES_ORDENACAO = Set.of("ASC", "DESC");

    @Inject
    ConexaoBD conexaoBD;

    public Dentista create(Dentista dentista) throws SQLException {
        String sql = """
                INSERT INTO DENTISTA (ID_DENTISTA, NM_DENTISTA, NR_CRO, ESPECIALIDADE, SG_ESTADO, STATUS_DENTISTA)
                VALUES (?, ?, ?, ?, ?, ?)
                """;
        try (Connection connection = conexaoBD.conectar();
             PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setInt(1, dentista.getIdDentista());
            stmt.setString(2, dentista.getNome());
            stmt.setString(3, dentista.getCro());
            stmt.setString(4, dentista.getEspecialidade());
            stmt.setString(5, dentista.getEstado());
            stmt.setString(6, dentista.getStatus());
            stmt.executeUpdate();
            return dentista;
        }
    }

    public Dentista findById(int idDentista) throws SQLException {
        String sql = """
                SELECT ID_DENTISTA, NM_DENTISTA, NR_CRO, ESPECIALIDADE, SG_ESTADO, STATUS_DENTISTA
                FROM DENTISTA
                WHERE ID_DENTISTA = ?
                """;
        try (Connection connection = conexaoBD.conectar();
             PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setInt(1, idDentista);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapDentista(rs);
                }
            }
        }
        return null;
    }

    public Dentista findByCro(String cro) throws SQLException {
        String sql = """
                SELECT ID_DENTISTA, NM_DENTISTA, NR_CRO, ESPECIALIDADE, SG_ESTADO, STATUS_DENTISTA
                FROM DENTISTA
                WHERE NR_CRO = ?
                """;
        try (Connection connection = conexaoBD.conectar();
             PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setString(1, cro);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapDentista(rs);
                }
            }
        }
        return null;
    }

    public List<Dentista> findAll(String especialidade, String estado, String status) throws SQLException {
        StringBuilder sql = new StringBuilder("""
                SELECT ID_DENTISTA, NM_DENTISTA, NR_CRO, ESPECIALIDADE, SG_ESTADO, STATUS_DENTISTA
                FROM DENTISTA
                WHERE 1 = 1
                """);
        List<String> filtros = new ArrayList<>();
        if (especialidade != null && !especialidade.isBlank()) {
            sql.append(" AND UPPER(ESPECIALIDADE) = ?");
            filtros.add(especialidade.toUpperCase());
        }
        if (estado != null && !estado.isBlank()) {
            sql.append(" AND UPPER(SG_ESTADO) = ?");
            filtros.add(estado.toUpperCase());
        }
        if (status != null && !status.isBlank()) {
            sql.append(" AND UPPER(STATUS_DENTISTA) = ?");
            filtros.add(status.toUpperCase());
        }
        sql.append(" ORDER BY NM_DENTISTA");

        List<Dentista> dentistas = new ArrayList<>();
        try (Connection connection = conexaoBD.conectar();
             PreparedStatement stmt = connection.prepareStatement(sql.toString())) {
            for (int i = 0; i < filtros.size(); i++) {
                stmt.setString(i + 1, filtros.get(i));
            }
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    dentistas.add(mapDentista(rs));
                }
            }
        }
        return dentistas;
    }

    public List<Dentista> findAll(String especialidade, String estado, String status,
                                  int page, int size, String sortColumn, String sortOrder) throws SQLException {
        int pageNormalizada = validarPage(page);
        int sizeNormalizado = validarSize(size);
        String colunaSegura = normalizarColunaOrdenacao(sortColumn);
        String ordemSegura = normalizarOrdem(sortOrder);
        StringBuilder sql = new StringBuilder("""
                SELECT ID_DENTISTA, NM_DENTISTA, NR_CRO, ESPECIALIDADE, SG_ESTADO, STATUS_DENTISTA
                FROM DENTISTA
                WHERE 1 = 1
                """);
        List<String> filtros = new ArrayList<>();
        if (especialidade != null && !especialidade.isBlank()) {
            sql.append(" AND UPPER(ESPECIALIDADE) = ?");
            filtros.add(especialidade.trim().toUpperCase());
        }
        if (estado != null && !estado.isBlank()) {
            sql.append(" AND UPPER(SG_ESTADO) = ?");
            filtros.add(estado.trim().toUpperCase());
        }
        if (status != null && !status.isBlank()) {
            sql.append(" AND UPPER(STATUS_DENTISTA) = ?");
            filtros.add(status.trim().toUpperCase());
        }
        sql.append(" ORDER BY ").append(colunaSegura).append(' ').append(ordemSegura).append(", ID_DENTISTA ASC");
        sql.append(" OFFSET ? ROWS FETCH NEXT ? ROWS ONLY");

        List<Dentista> dentistas = new ArrayList<>();
        try (Connection connection = conexaoBD.conectar();
             PreparedStatement stmt = connection.prepareStatement(sql.toString())) {
            int index = 1;
            for (String filtro : filtros) {
                stmt.setString(index++, filtro);
            }
            stmt.setInt(index++, pageNormalizada * sizeNormalizado);
            stmt.setInt(index, sizeNormalizado);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    dentistas.add(mapDentista(rs));
                }
            }
        }
        return dentistas;
    }

    public Dentista update(Dentista dentista) throws SQLException {
        String sql = """
                UPDATE DENTISTA
                SET NM_DENTISTA = ?, NR_CRO = ?, ESPECIALIDADE = ?, SG_ESTADO = ?, STATUS_DENTISTA = ?
                WHERE ID_DENTISTA = ?
                """;
        try (Connection connection = conexaoBD.conectar();
             PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setString(1, dentista.getNome());
            stmt.setString(2, dentista.getCro());
            stmt.setString(3, dentista.getEspecialidade());
            stmt.setString(4, dentista.getEstado());
            stmt.setString(5, dentista.getStatus());
            stmt.setInt(6, dentista.getIdDentista());
            if (stmt.executeUpdate() == 0) {
                throw new SQLException("Dentista nao encontrado para atualizacao.");
            }
            return dentista;
        }
    }

    public void delete(int idDentista) throws SQLException {
        String sql = "DELETE FROM DENTISTA WHERE ID_DENTISTA = ?";
        try (Connection connection = conexaoBD.conectar();
             PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setInt(1, idDentista);
            if (stmt.executeUpdate() == 0) {
                throw new SQLException("Dentista nao encontrado para remocao.");
            }
        }
    }

    public int nextId() throws SQLException {
        String sql = "SELECT NVL(MAX(ID_DENTISTA), 0) + 1 FROM DENTISTA";
        try (Connection connection = conexaoBD.conectar();
             PreparedStatement stmt = connection.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            rs.next();
            return rs.getInt(1);
        }
    }

    private Dentista mapDentista(ResultSet rs) throws SQLException {
        return new Dentista(
                rs.getInt("ID_DENTISTA"),
                rs.getString("NM_DENTISTA"),
                rs.getString("NR_CRO"),
                rs.getString("ESPECIALIDADE"),
                rs.getString("SG_ESTADO"),
                rs.getString("STATUS_DENTISTA")
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
            return "NM_DENTISTA";
        }
        return COLUNAS_ORDENACAO.getOrDefault(sortColumn, "NM_DENTISTA");
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
