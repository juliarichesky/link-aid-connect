package com.turmadobem.repository;

import com.turmadobem.dto.RelatorioContatosResponse;
import com.turmadobem.dto.RelatorioDentistasResponse;
import com.turmadobem.dto.RelatorioFinanceiroResponse;
import com.turmadobem.dto.RelatorioQuantidadeAgrupadaResponse;
import com.turmadobem.dto.RelatorioTicketsResponse;
import com.turmadobem.dto.RelatorioValorAgrupadoResponse;
import com.turmadobem.support.ConexaoBD;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@ApplicationScoped
public class RelatorioRepository {
    private static final Set<String> COLUNAS_AGRUPAMENTO_TICKET = Set.of("STATUS_TICKET", "CANAL_ORIGEM");
    private static final Set<String> COLUNAS_AGRUPAMENTO_FINANCEIRO = Set.of("CATEGORIA_TRANSACAO", "STATUS_TRANSACAO");
    private static final Set<String> COLUNAS_AGRUPAMENTO_DENTISTA = Set.of("SG_ESTADO", "ESPECIALIDADE");

    @Inject
    ConexaoBD conexaoBD;

    public RelatorioTicketsResponse buscarRelatorioTickets(String periodo, LocalDateTime inicio, LocalDateTime fim) throws SQLException {
        String sqlResumo = """
                SELECT
                    COUNT(*) AS TOTAL_TICKETS,
                    SUM(CASE WHEN STATUS_TICKET = 'ABERTO' THEN 1 ELSE 0 END) AS ABERTOS,
                    SUM(CASE WHEN STATUS_TICKET = 'EM_ATENDIMENTO' THEN 1 ELSE 0 END) AS EM_ATENDIMENTO,
                    SUM(CASE WHEN STATUS_TICKET = 'AGUARDANDO_CLIENTE' THEN 1 ELSE 0 END) AS AGUARDANDO_CLIENTE,
                    SUM(CASE WHEN STATUS_TICKET = 'RESOLVIDO' THEN 1 ELSE 0 END) AS RESOLVIDOS,
                    SUM(CASE WHEN STATUS_TICKET = 'CANCELADO' THEN 1 ELSE 0 END) AS CANCELADOS,
                    SUM(CASE WHEN STATUS_TICKET = 'ARQUIVADO' THEN 1 ELSE 0 END) AS ARQUIVADOS
                FROM TICKET
                WHERE DT_ABERTURA >= ? AND DT_ABERTURA < ?
                """;

        try (Connection connection = conexaoBD.conectar();
             PreparedStatement stmt = connection.prepareStatement(sqlResumo)) {
            stmt.setTimestamp(1, Timestamp.valueOf(inicio));
            stmt.setTimestamp(2, Timestamp.valueOf(fim));
            try (ResultSet rs = stmt.executeQuery()) {
                rs.next();
                return new RelatorioTicketsResponse(
                        periodo,
                        rs.getInt("TOTAL_TICKETS"),
                        rs.getInt("ABERTOS"),
                        rs.getInt("EM_ATENDIMENTO"),
                        rs.getInt("AGUARDANDO_CLIENTE"),
                        rs.getInt("RESOLVIDOS"),
                        rs.getInt("CANCELADOS"),
                        rs.getInt("ARQUIVADOS"),
                        buscarAgrupamentoTickets(connection, "STATUS_TICKET", inicio, fim),
                        buscarAgrupamentoTickets(connection, "CANAL_ORIGEM", inicio, fim)
                );
            }
        }
    }

    public RelatorioFinanceiroResponse buscarRelatorioFinanceiro(String periodo, LocalDate inicio, LocalDate fim) throws SQLException {
        String sqlResumo = """
                SELECT
                    NVL(SUM(CASE WHEN TP_TRANSACAO = 'RECEITA' THEN VL_TRANSACAO ELSE 0 END), 0) AS TOTAL_RECEITAS,
                    NVL(SUM(CASE WHEN TP_TRANSACAO = 'DESPESA' THEN VL_TRANSACAO ELSE 0 END), 0) AS TOTAL_DESPESAS,
                    COUNT(*) AS QUANTIDADE_TRANSACOES
                FROM TRANSACAO_FINANCEIRA
                WHERE DT_TRANSACAO >= ? AND DT_TRANSACAO < ?
                """;

        try (Connection connection = conexaoBD.conectar();
             PreparedStatement stmt = connection.prepareStatement(sqlResumo)) {
            stmt.setDate(1, Date.valueOf(inicio));
            stmt.setDate(2, Date.valueOf(fim));
            try (ResultSet rs = stmt.executeQuery()) {
                rs.next();
                BigDecimal receitas = rs.getBigDecimal("TOTAL_RECEITAS");
                BigDecimal despesas = rs.getBigDecimal("TOTAL_DESPESAS");
                return new RelatorioFinanceiroResponse(
                        periodo,
                        receitas,
                        despesas,
                        receitas.subtract(despesas),
                        rs.getInt("QUANTIDADE_TRANSACOES"),
                        buscarAgrupamentoFinanceiro(connection, "CATEGORIA_TRANSACAO", inicio, fim),
                        buscarAgrupamentoFinanceiro(connection, "STATUS_TRANSACAO", inicio, fim)
                );
            }
        }
    }

    public RelatorioDentistasResponse buscarRelatorioDentistas() throws SQLException {
        String sqlResumo = """
                SELECT
                    COUNT(*) AS TOTAL_DENTISTAS,
                    SUM(CASE WHEN STATUS_DENTISTA = 'ATIVO' THEN 1 ELSE 0 END) AS ATIVOS,
                    SUM(CASE WHEN STATUS_DENTISTA = 'INATIVO' THEN 1 ELSE 0 END) AS INATIVOS,
                    SUM(CASE WHEN STATUS_DENTISTA = 'FERIAS' THEN 1 ELSE 0 END) AS FERIAS
                FROM DENTISTA
                """;
        try (Connection connection = conexaoBD.conectar();
             PreparedStatement stmt = connection.prepareStatement(sqlResumo);
             ResultSet rs = stmt.executeQuery()) {
            rs.next();
            return new RelatorioDentistasResponse(
                    rs.getInt("TOTAL_DENTISTAS"),
                    rs.getInt("ATIVOS"),
                    rs.getInt("INATIVOS"),
                    rs.getInt("FERIAS"),
                    buscarAgrupamentoDentistas(connection, "SG_ESTADO"),
                    buscarAgrupamentoDentistas(connection, "ESPECIALIDADE")
            );
        }
    }

    public RelatorioContatosResponse buscarRelatorioContatos() throws SQLException {
        String sqlResumo = """
                SELECT
                    COUNT(*) AS TOTAL_CONTATOS,
                    SUM(CASE WHEN EXISTS (SELECT 1 FROM TICKET T WHERE T.ID_CONTATO = C.ID_CONTATO) THEN 1 ELSE 0 END) AS CONTATOS_COM_TICKETS,
                    SUM(CASE WHEN NOT EXISTS (SELECT 1 FROM TICKET T WHERE T.ID_CONTATO = C.ID_CONTATO) THEN 1 ELSE 0 END) AS CONTATOS_SEM_TICKETS
                FROM CONTATO C
                """;
        try (Connection connection = conexaoBD.conectar();
             PreparedStatement stmt = connection.prepareStatement(sqlResumo);
             ResultSet rs = stmt.executeQuery()) {
            rs.next();
            return new RelatorioContatosResponse(
                    rs.getInt("TOTAL_CONTATOS"),
                    buscarAgrupamentoContatos(connection),
                    rs.getInt("CONTATOS_COM_TICKETS"),
                    rs.getInt("CONTATOS_SEM_TICKETS")
            );
        }
    }

    private List<RelatorioQuantidadeAgrupadaResponse> buscarAgrupamentoTickets(Connection connection, String coluna, LocalDateTime inicio, LocalDateTime fim) throws SQLException {
        String colunaSegura = normalizarColunaAgrupamento(coluna, COLUNAS_AGRUPAMENTO_TICKET, "STATUS_TICKET");
        String sql = "SELECT " + colunaSegura + " AS CHAVE, COUNT(*) AS QUANTIDADE FROM TICKET WHERE DT_ABERTURA >= ? AND DT_ABERTURA < ? GROUP BY " + colunaSegura + " ORDER BY " + colunaSegura;
        List<RelatorioQuantidadeAgrupadaResponse> itens = new ArrayList<>();
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setTimestamp(1, Timestamp.valueOf(inicio));
            stmt.setTimestamp(2, Timestamp.valueOf(fim));
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    itens.add(new RelatorioQuantidadeAgrupadaResponse(rs.getString("CHAVE"), rs.getInt("QUANTIDADE")));
                }
            }
        }
        return itens;
    }

    private List<RelatorioValorAgrupadoResponse> buscarAgrupamentoFinanceiro(Connection connection, String coluna, LocalDate inicio, LocalDate fim) throws SQLException {
        String colunaSegura = normalizarColunaAgrupamento(coluna, COLUNAS_AGRUPAMENTO_FINANCEIRO, "CATEGORIA_TRANSACAO");
        String sql = "SELECT " + colunaSegura + " AS CHAVE, NVL(SUM(VL_TRANSACAO), 0) AS VALOR FROM TRANSACAO_FINANCEIRA WHERE DT_TRANSACAO >= ? AND DT_TRANSACAO < ? GROUP BY " + colunaSegura + " ORDER BY " + colunaSegura;
        List<RelatorioValorAgrupadoResponse> itens = new ArrayList<>();
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setDate(1, Date.valueOf(inicio));
            stmt.setDate(2, Date.valueOf(fim));
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    itens.add(new RelatorioValorAgrupadoResponse(rs.getString("CHAVE"), rs.getBigDecimal("VALOR")));
                }
            }
        }
        return itens;
    }

    private List<RelatorioQuantidadeAgrupadaResponse> buscarAgrupamentoDentistas(Connection connection, String coluna) throws SQLException {
        String colunaSegura = normalizarColunaAgrupamento(coluna, COLUNAS_AGRUPAMENTO_DENTISTA, "SG_ESTADO");
        String sql = "SELECT " + colunaSegura + " AS CHAVE, COUNT(*) AS QUANTIDADE FROM DENTISTA GROUP BY " + colunaSegura + " ORDER BY " + colunaSegura;
        List<RelatorioQuantidadeAgrupadaResponse> itens = new ArrayList<>();
        try (PreparedStatement stmt = connection.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                itens.add(new RelatorioQuantidadeAgrupadaResponse(rs.getString("CHAVE"), rs.getInt("QUANTIDADE")));
            }
        }
        return itens;
    }

    private List<RelatorioQuantidadeAgrupadaResponse> buscarAgrupamentoContatos(Connection connection) throws SQLException {
        String sql = """
                SELECT CANAL_ORIGEM AS CHAVE, COUNT(*) AS QUANTIDADE
                FROM CONTATO
                GROUP BY CANAL_ORIGEM
                ORDER BY CANAL_ORIGEM
                """;
        List<RelatorioQuantidadeAgrupadaResponse> itens = new ArrayList<>();
        try (PreparedStatement stmt = connection.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                itens.add(new RelatorioQuantidadeAgrupadaResponse(rs.getString("CHAVE"), rs.getInt("QUANTIDADE")));
            }
        }
        return itens;
    }

    private String normalizarColunaAgrupamento(String coluna, Set<String> colunasPermitidas, String colunaPadrao) {
        if (coluna == null || coluna.isBlank()) {
            return colunaPadrao;
        }
        if (!colunasPermitidas.contains(coluna)) {
            return colunaPadrao;
        }
        return coluna;
    }
}
