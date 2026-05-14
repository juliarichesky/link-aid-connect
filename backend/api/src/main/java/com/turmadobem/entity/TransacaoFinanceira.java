package com.turmadobem.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.math.BigDecimal;
import java.time.LocalDate;

public class TransacaoFinanceira {
    private Integer idTransacaoFinanceira;
    private String tipo;
    private BigDecimal valor;
    private String status;
    private String categoria;
    private String descricao;
    private LocalDate data;
    private Integer idUsuario;
    private Integer idContato;
    @JsonIgnoreProperties("tickets")
    private Contato contato;
    private Usuario usuario;

    public TransacaoFinanceira() {
    }

    public TransacaoFinanceira(Integer idTransacaoFinanceira, String tipo, BigDecimal valor, String status,
                               String categoria, String descricao, LocalDate data, Integer idUsuario, Integer idContato) {
        this.idTransacaoFinanceira = idTransacaoFinanceira;
        this.tipo = tipo;
        this.valor = valor;
        this.status = status;
        this.categoria = categoria;
        this.descricao = descricao;
        this.data = data;
        this.idUsuario = idUsuario;
        this.idContato = idContato;
    }

    public Integer getIdTransacaoFinanceira() {
        return idTransacaoFinanceira;
    }

    public void setIdTransacaoFinanceira(Integer idTransacaoFinanceira) {
        this.idTransacaoFinanceira = idTransacaoFinanceira;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public void setValor(BigDecimal valor) {
        this.valor = valor;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public LocalDate getData() {
        return data;
    }

    public void setData(LocalDate data) {
        this.data = data;
    }

    public Integer getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Integer idUsuario) {
        this.idUsuario = idUsuario;
    }

    public Integer getIdContato() {
        return idContato;
    }

    public void setIdContato(Integer idContato) {
        this.idContato = idContato;
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

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
        if (usuario != null) {
            this.idUsuario = usuario.getIdUsuario();
        }
    }
}
