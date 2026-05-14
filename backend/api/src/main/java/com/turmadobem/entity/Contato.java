package com.turmadobem.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.ArrayList;
import java.util.List;

public class Contato {
    private Integer idContato;
    private String nome;
    private String documento;
    private String email;
    private String telefone;
    private String canalOrigem; // ✅ CORRETO

    @JsonIgnoreProperties("contato")
    private List<Ticket> tickets = new ArrayList<>();

    public Contato() {
    }

    public Contato(Integer idContato, String nome, String documento, String email, String telefone, String canalOrigem) {
        this.idContato = idContato;
        this.nome = nome;
        this.documento = documento;
        this.email = email;
        this.telefone = telefone;
        this.canalOrigem = canalOrigem;
    }

    public Integer getIdContato() {
        return idContato;
    }

    public void setIdContato(Integer idContato) {
        this.idContato = idContato;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getDocumento() {
        return documento;
    }

    public void setDocumento(String documento) {
        this.documento = documento;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public String getCanalOrigem() {
        return canalOrigem;
    }

    public void setCanalOrigem(String canalOrigem) {
        this.canalOrigem = canalOrigem;
    }

    public List<Ticket> getTickets() {
        return tickets;
    }

    public void setTickets(List<Ticket> tickets) {
        this.tickets = tickets == null ? new ArrayList<>() : tickets;
    }
}