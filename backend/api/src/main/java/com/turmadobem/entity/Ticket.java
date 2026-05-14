package com.turmadobem.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class Ticket {
    private Integer idTicket;
    private String protocolo;
    private Integer idContato;
    private String canalOrigem;
    private String assunto;
    private String descricao;
    private String status;
    private String prioridade;
    private Integer idDentistaResponsavel;
    private LocalDateTime dataAbertura;
    private LocalDateTime dataAtualizacao;
    @JsonIgnoreProperties("tickets")
    private Contato contato;
    @JsonIgnoreProperties("agenda")
    private Dentista dentistaResponsavel;
    @JsonIgnoreProperties("ticket")
    private List<Mensagem> mensagens = new ArrayList<>();

    public Ticket() {
    }

    public Ticket(Integer idTicket, String protocolo, Integer idContato, String canalOrigem, String assunto,
                  String descricao, String status, String prioridade, LocalDateTime dataAbertura,
                  LocalDateTime dataAtualizacao) {
        this.idTicket = idTicket;
        this.protocolo = protocolo;
        this.idContato = idContato;
        this.canalOrigem = canalOrigem;
        this.assunto = assunto;
        this.descricao = descricao;
        this.status = status;
        this.prioridade = prioridade;
        this.dataAbertura = dataAbertura;
        this.dataAtualizacao = dataAtualizacao;
    }

    public Integer getIdTicket() {
        return idTicket;
    }

    public void setIdTicket(Integer idTicket) {
        this.idTicket = idTicket;
    }

    public String getProtocolo() {
        return protocolo;
    }

    public void setProtocolo(String protocolo) {
        this.protocolo = protocolo;
    }

    public Integer getIdContato() {
        return idContato;
    }

    public void setIdContato(Integer idContato) {
        this.idContato = idContato;
    }

    public String getCanalOrigem() {
        return canalOrigem;
    }

    public void setCanalOrigem(String canalOrigem) {
        this.canalOrigem = canalOrigem;
    }

    public String getAssunto() {
        return assunto;
    }

    public void setAssunto(String assunto) {
        this.assunto = assunto;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPrioridade() {
        return prioridade;
    }

    public void setPrioridade(String prioridade) {
        this.prioridade = prioridade;
    }

    public Integer getIdDentistaResponsavel() {
        return idDentistaResponsavel;
    }

    public void setIdDentistaResponsavel(Integer idDentistaResponsavel) {
        this.idDentistaResponsavel = idDentistaResponsavel;
    }

    public LocalDateTime getDataAbertura() {
        return dataAbertura;
    }

    public void setDataAbertura(LocalDateTime dataAbertura) {
        this.dataAbertura = dataAbertura;
    }

    public LocalDateTime getDataAtualizacao() {
        return dataAtualizacao;
    }

    public void setDataAtualizacao(LocalDateTime dataAtualizacao) {
        this.dataAtualizacao = dataAtualizacao;
    }

    public Contato getContato() {
        return contato;
    }

    public void setContato(Contato contato) {
        this.contato = contato;
        if (contato != null) {
            this.idContato = contato.getIdContato();
        }
    }

    public Dentista getDentistaResponsavel() {
        return dentistaResponsavel;
    }

    public void setDentistaResponsavel(Dentista dentistaResponsavel) {
        this.dentistaResponsavel = dentistaResponsavel;
        if (dentistaResponsavel != null) {
            this.idDentistaResponsavel = dentistaResponsavel.getIdDentista();
        }
    }

    public List<Mensagem> getMensagens() {
        return mensagens;
    }

    public void setMensagens(List<Mensagem> mensagens) {
        this.mensagens = mensagens == null ? new ArrayList<>() : mensagens;
    }
}
