package com.turmadobem.repository;

import com.turmadobem.entity.Usuario;
import com.turmadobem.support.ConexaoBD;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

@ApplicationScoped
public class UsuarioRepository {
    @Inject
    ConexaoBD conexaoBD;

    public Usuario findById(int idUsuario) throws SQLException {
        String sql = """
                SELECT ID_USUARIO, NM_USUARIO, EMAIL_USUARIO, SENHA_USUARIO, ROLE_USUARIO, STATUS_USUARIO
                FROM USUARIO_SISTEMA
                WHERE ID_USUARIO = ?
                """;
        try (Connection connection = conexaoBD.conectar();
             PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setInt(1, idUsuario);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return new Usuario(
                            rs.getInt("ID_USUARIO"),
                            rs.getString("NM_USUARIO"),
                            rs.getString("EMAIL_USUARIO"),
                            rs.getString("SENHA_USUARIO"),
                            rs.getString("ROLE_USUARIO"),
                            rs.getString("STATUS_USUARIO")
                    );
                }
            }
        }
        return null;
    }

    public Usuario findByEmail(String email) throws SQLException {
        String sql = """
                SELECT ID_USUARIO, NM_USUARIO, EMAIL_USUARIO, SENHA_USUARIO, ROLE_USUARIO, STATUS_USUARIO
                FROM USUARIO_SISTEMA
                WHERE UPPER(EMAIL_USUARIO) = UPPER(?)
                """;
        try (Connection connection = conexaoBD.conectar();
             PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setString(1, email);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return new Usuario(
                            rs.getInt("ID_USUARIO"),
                            rs.getString("NM_USUARIO"),
                            rs.getString("EMAIL_USUARIO"),
                            rs.getString("SENHA_USUARIO"),
                            rs.getString("ROLE_USUARIO"),
                            rs.getString("STATUS_USUARIO")
                    );
                }
            }
        }
        return null;
    }
}
