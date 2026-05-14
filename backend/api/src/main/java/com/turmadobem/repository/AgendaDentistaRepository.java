package com.turmadobem.repository;

import com.turmadobem.entity.AgendaDentista;
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
public class AgendaDentistaRepository {
    @Inject
    ConexaoBD conexaoBD;

    public AgendaDentista create(AgendaDentista agenda) throws SQLException {
        String sql = """
                INSERT INTO AGENDA_DENTISTA (ID_AGENDA_DENTISTA, ID_DENTISTA, DT_HORA_INICIO, DT_HORA_FIM, STATUS_AGENDA, OBSERVACAO)
                VALUES (?, ?, ?, ?, ?, ?)
                """;
        try (Connection connection = conexaoBD.conectar();
             PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setInt(1, agenda.getIdAgendaDentista());
            stmt.setInt(2, agenda.getIdDentista());
            stmt.setTimestamp(3, Timestamp.valueOf(agenda.getDataHoraInicio()));
            stmt.setTimestamp(4, Timestamp.valueOf(agenda.getDataHoraFim()));
            stmt.setString(5, agenda.getStatus());
            stmt.setString(6, agenda.getObservacao());
            stmt.executeUpdate();
            return agenda;
        }
    }

    public List<AgendaDentista> findByDentista(int idDentista, String status) throws SQLException {
        StringBuilder sql = new StringBuilder("""
                SELECT ID_AGENDA_DENTISTA, ID_DENTISTA, DT_HORA_INICIO, DT_HORA_FIM, STATUS_AGENDA, OBSERVACAO
                FROM AGENDA_DENTISTA
                WHERE ID_DENTISTA = ?
                """);
        if (status != null && !status.isBlank()) {
            sql.append(" AND UPPER(STATUS_AGENDA) = ?");
        }
        sql.append(" ORDER BY DT_HORA_INICIO");

        List<AgendaDentista> agendas = new ArrayList<>();
        try (Connection connection = conexaoBD.conectar();
             PreparedStatement stmt = connection.prepareStatement(sql.toString())) {
            stmt.setInt(1, idDentista);
            if (status != null && !status.isBlank()) {
                stmt.setString(2, status.toUpperCase());
            }
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    agendas.add(mapAgenda(rs));
                }
            }
        }
        return agendas;
    }

    public void deleteByDentista(int idDentista) throws SQLException {
        String sql = "DELETE FROM AGENDA_DENTISTA WHERE ID_DENTISTA = ?";
        try (Connection connection = conexaoBD.conectar();
             PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setInt(1, idDentista);
            stmt.executeUpdate();
        }
    }

    public int nextId() throws SQLException {
        String sql = "SELECT NVL(MAX(ID_AGENDA_DENTISTA), 0) + 1 FROM AGENDA_DENTISTA";
        try (Connection connection = conexaoBD.conectar();
             PreparedStatement stmt = connection.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            rs.next();
            return rs.getInt(1);
        }
    }

    private AgendaDentista mapAgenda(ResultSet rs) throws SQLException {
        return new AgendaDentista(
                rs.getInt("ID_AGENDA_DENTISTA"),
                rs.getInt("ID_DENTISTA"),
                rs.getTimestamp("DT_HORA_INICIO").toLocalDateTime(),
                rs.getTimestamp("DT_HORA_FIM").toLocalDateTime(),
                rs.getString("STATUS_AGENDA"),
                rs.getString("OBSERVACAO")
        );
    }
}
