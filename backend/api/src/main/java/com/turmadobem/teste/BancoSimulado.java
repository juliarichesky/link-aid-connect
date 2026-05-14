package com.turmadobem.teste;

import com.turmadobem.entity.Contato;
import com.turmadobem.entity.Ticket;
import com.turmadobem.entity.TransacaoFinanceira;

import java.util.ArrayList;
import java.util.List;

public class BancoSimulado {
    private final List<Contato> contatos = new ArrayList<>();
    private final List<Ticket> tickets = new ArrayList<>();
    private final List<TransacaoFinanceira> transacoes = new ArrayList<>();

    public List<Contato> getContatos() {
        return contatos;
    }

    public List<Ticket> getTickets() {
        return tickets;
    }

    public List<TransacaoFinanceira> getTransacoes() {
        return transacoes;
    }

    public void adicionarContato(Contato contato) {
        contatos.add(contato);
    }

    public void adicionarTicket(Ticket ticket) {
        tickets.add(ticket);
    }

    public void adicionarTransacao(TransacaoFinanceira transacao) {
        transacoes.add(transacao);
    }
}