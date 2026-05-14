package com.turmadobem.service;

import com.turmadobem.dto.HistoricoContatoResponse;
import com.turmadobem.dto.HistoricoContatoTicketResponse;
import com.turmadobem.repository.ContatoRepository;
import com.turmadobem.repository.HistoricoContatoRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.sql.SQLException;
import java.util.List;

@ApplicationScoped
public class HistoricoContatoService {
    @Inject
    HistoricoContatoRepository historicoContatoRepository;

    @Inject
    ContatoRepository contatoRepository;

    public HistoricoContatoResponse buscarHistorico(int idContato) throws SQLException {
        if (contatoRepository.findById(idContato) == null) {
            throw new IllegalArgumentException("Contato nao encontrado.");
        }
        HistoricoContatoResponse historico = historicoContatoRepository.buscarHistoricoPorContato(idContato);
        if (historico == null) {
            throw new IllegalArgumentException("Contato nao encontrado.");
        }
        return historico;
    }

    public List<HistoricoContatoTicketResponse> buscarTicketsPorDocumento(String documento) throws SQLException {
        if (documento == null || documento.isBlank()) {
            throw new IllegalArgumentException("Documento nao informado.");
        }
        List<HistoricoContatoTicketResponse> tickets = historicoContatoRepository.buscarTicketsPorDocumento(documento.trim());
        if (tickets == null) {
            throw new IllegalArgumentException("Contato nao encontrado.");
        }
        return tickets;
    }

    public List<HistoricoContatoTicketResponse> buscarTicketsPorContato(int idContato) throws SQLException {
        if (contatoRepository.findById(idContato) == null) {
            throw new IllegalArgumentException("Contato nao encontrado.");
        }
        return historicoContatoRepository.buscarTicketsPorContatoId(idContato);
    }
}
