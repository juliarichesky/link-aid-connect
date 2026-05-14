package com.turmadobem.support;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

@ApplicationScoped
public class ConexaoBD {

    // REQUISITO SPRINT 3
    // Credenciais declaradas no código conforme solicitado pelo enunciado.
    // Essas informações estão também no (application.properties).

    private static final String DB_URL = "jdbc:oracle:thin:@oracle.fiap.com.br:1521:orcl";
    private static final String DB_USER = "SEU_USUARIO";
    private static final String DB_PASSWORD = "SUA_SENHA";

    @Inject
    DataSource dataSource;

    public Connection conectar() throws SQLException {
        return dataSource.getConnection();
    }
}