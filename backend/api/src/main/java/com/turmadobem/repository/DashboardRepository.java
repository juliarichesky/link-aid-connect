package com.turmadobem.repository;

import com.turmadobem.dto.DashboardFinanceiroResumoResponse;
import com.turmadobem.dto.DashboardResumoResponse;
import com.turmadobem.dto.DashboardTicketsPorCanalResponse;
import com.turmadobem.dto.DashboardTicketsPorStatusResponse;
import com.turmadobem.dto.UltimoTicketDashboardResponse;
import com.turmadobem.support.ConexaoBD;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@ApplicationScoped
public class DashboardRepository {
    @Inject
    ConexaoBD conexaoBD;

    public DashboardResumoResponse buscarResumo() throws SQLException {
        String sql = """
                SELECT
                    (SELECT COUNT(*) FROM CONTATO) AS TOTAL_CONTATOS,
                    (SELECT COUNT(*) FROM TICKET) AS TOTAL_TICKETS,
                    (SELECT COUNT(*) FROM TICKET WHERE STATUS_TICKET = 'ABERTO') AS TICKETS_ABERTOS,
                    (SELECT COUNT(*) FROM TICKET WHERE STATUS_TICKET = 'EM_ATENDIMENTO') AS TICKETS_EM_ATENDIMENTO,
                    (SELECT COUNT(*) FROM TICKET WHERE STATUS_TICKET = 'AGUARDANDO_CLIENTE') AS TICKETS_AGUARDANDO_CLIENTE,
                    (SELECT COUNT(*) FROM TICKET WHERE STATUS_TICKET = 'RESOLVIDO') AS TICKETS_RESOLVIDOS,
                    (SELECT COUNT(*) FROM TICKET WHERE STATUS_TICKET = 'CANCELADO') AS TICKETS_CANCELADOS,
                    (SELECT COUNT(*) FROM TICKET WHERE STATUS_TICKET = 'ARQUIVADO') AS TICKETS_ARQUIVADOS,
                    (SELECT COUNT(*) FROM DENTISTA) AS TOTAL_DENTISTAS,
                    (SELECT COUNT(*) FROM DENTISTA WHERE STATUS_DENTISTA = 'ATIVO') AS DENTISTAS_ATIVOS,
                    (SELECT NVL(SUM(VL_TRANSACAO), 0) FROM TRANSACAO_FINANCEIRA WHERE TP_TRANSACAO = 'RECEITA') AS TOTAL_RECEITAS,
                    (SELECT NVL(SUM(VL_TRANSACAO), 0) FROM TRANSACAO_FINANCEIRA WHERE TP_TRANSACAO = 'DESPESA') AS TOTAL_DESPESAS
                FROM DUAL
                """;
        try (Connection connection = conexaoBD.conectar();
             PreparedStatement stmt = connection.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            rs.next();
            BigDecimal receitas = rs.getBigDecimal("TOTAL_RECEITAS");
            BigDecimal despesas = rs.getBigDecimal("TOTAL_DESPESAS");
            return new DashboardResumoResponse(
                    rs.getInt("TOTAL_CONTATOS"),
                    rs.getInt("TOTAL_TICKETS"),
                    rs.getInt("TICKETS_ABERTOS"),
                    rs.getInt("TICKETS_EM_ATENDIMENTO"),
                    rs.getInt("TICKETS_AGUARDANDO_CLIENTE"),
                    rs.getInt("TICKETS_RESOLVIDOS"),
                    rs.getInt("TICKETS_CANCELADOS"),
                    rs.getInt("TICKETS_ARQUIVADOS"),
                    rs.getInt("TOTAL_DENTISTAS"),
                    rs.getInt("DENTISTAS_ATIVOS"),
                    receitas,
                    despesas,
                    receitas.subtract(despesas)
            );
        }
    }

    public List<DashboardTicketsPorStatusResponse> buscarTicketsPorStatus() throws SQLException {
        String sql = """
                SELECT STATUS_TICKET, COUNT(*) AS QUANTIDADE
                FROM TICKET
                GROUP BY STATUS_TICKET
                ORDER BY STATUS_TICKET
                """;
        List<DashboardTicketsPorStatusResponse> itens = new ArrayList<>();
        try (Connection connection = conexaoBD.conectar();
             PreparedStatement stmt = connection.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                itens.add(new DashboardTicketsPorStatusResponse(
                        rs.getString("STATUS_TICKET"),
                        rs.getInt("QUANTIDADE")
                ));
            }
        }
        return itens;
    }

    public List<DashboardTicketsPorCanalResponse> buscarTicketsPorCanal() throws SQLException {
        String sql = """
                SELECT CANAL_ORIGEM, COUNT(*) AS QUANTIDADE
                FROM TICKET
                GROUP BY CANAL_ORIGEM
                ORDER BY CANAL_ORIGEM
                """;
        List<DashboardTicketsPorCanalResponse> itens = new ArrayList<>();
        try (Connection connection = conexaoBD.conectar();
             PreparedStatement stmt = connection.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                itens.add(new DashboardTicketsPorCanalResponse(
                        rs.getString("CANAL_ORIGEM"),
                        rs.getInt("QUANTIDADE")
                ));
            }
        }
        return itens;
    }

    public DashboardFinanceiroResumoResponse buscarFinanceiroResumo() throws SQLException {
        String sql = """
                SELECT
                    NVL(SUM(CASE WHEN TP_TRANSACAO = 'RECEITA' THEN VL_TRANSACAO ELSE 0 END), 0) AS RECEITAS,
                    NVL(SUM(CASE WHEN TP_TRANSACAO = 'DESPESA' THEN VL_TRANSACAO ELSE 0 END), 0) AS DESPESAS
                FROM TRANSACAO_FINANCEIRA
                """;
        try (Connection connection = conexaoBD.conectar();
             PreparedStatement stmt = connection.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            rs.next();
            BigDecimal receitas = rs.getBigDecimal("RECEITAS");
            BigDecimal despesas = rs.getBigDecimal("DESPESAS");
            return new DashboardFinanceiroResumoResponse(
                    receitas,
                    despesas,
                    receitas.subtract(despesas)
            );
        }
    }

    public List<UltimoTicketDashboardResponse> buscarUltimosTickets() throws SQLException {
        String sql = """
                SELECT
                    T.ID_TICKET,
                    T.NR_PROTOCOLO,
                    T.ASSUNTO,
                    T.STATUS_TICKET,
                    T.PRIORIDADE_TICKET,
                    T.CANAL_ORIGEM,
                    T.DT_ABERTURA,
                    C.NM_CONTATO
                FROM TICKET T
                JOIN CONTATO C ON C.ID_CONTATO = T.ID_CONTATO
                ORDER BY T.DT_ABERTURA DESC, T.ID_TICKET DESC
                FETCH FIRST 5 ROWS ONLY
                """;
        List<UltimoTicketDashboardResponse> itens = new ArrayList<>();
        try (Connection connection = conexaoBD.conectar();
             PreparedStatement stmt = connection.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                itens.add(new UltimoTicketDashboardResponse(
                        rs.getInt("ID_TICKET"),
                        rs.getString("NR_PROTOCOLO"),
                        rs.getString("ASSUNTO"),
                        rs.getString("STATUS_TICKET"),
                        rs.getString("PRIORIDADE_TICKET"),
                        rs.getString("CANAL_ORIGEM"),
                        rs.getTimestamp("DT_ABERTURA").toLocalDateTime(),
                        rs.getString("NM_CONTATO")
                ));
            }
        }
        return itens;
    }
}
