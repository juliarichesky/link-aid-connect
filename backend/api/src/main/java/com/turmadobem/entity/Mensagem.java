package com.turmadobem.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDateTime;

public class Mensagem {
    private Integer idMensagem;
    private Integer idTicket;
    private String remetente;
    private String conteudo;
    private LocalDateTime dataHora;
    @JsonIgnoreProperties({"mensagens", "contato"})
    private Ticket ticket;

    public Mensagem() {
    }

    public Mensagem(Integer idMensagem, Integer idTicket, String remetente, String conteudo, LocalDateTime dataHora) {
        this.idMensagem = idMensagem;
        this.idTicket = idTicket;
        this.remetente = remetente;
        this.conteudo = conteudo;
        this.dataHora = dataHora;
    }

    public Integer getIdMensagem() {
        return idMensagem;
    }

    public void setIdMensagem(Integer idMensagem) {
        this.idMensagem = idMensagem;
    }

    public Integer getIdTicket() {
        return idTicket;
    }

    public void setIdTicket(Integer idTicket) {
        this.idTicket = idTicket;
    }

    public String getRemetente() {
        return remetente;
    }

    public void setRemetente(String remetente) {
        this.remetente = remetente;
    }

    public String getConteudo() {
        return conteudo;
    }

    public void setConteudo(String conteudo) {
        this.conteudo = conteudo;
    }

    public LocalDateTime getDataHora() {
        return dataHora;
    }

    public void setDataHora(LocalDateTime dataHora) {
        this.dataHora = dataHora;
    }

    public Ticket getTicket() {
        return ticket;
    }

    public void setTicket(Ticket ticket) {
        this.ticket = ticket;
        if (ticket != null) {
            this.idTicket = ticket.getIdTicket();
        }
    }
}
