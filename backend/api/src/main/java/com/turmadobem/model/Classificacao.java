package com.turmadobem.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "T_LKA_CLASSIFICACAO")
public class Classificacao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_CLASSIFICACAO")
    private Long idClassificacao;

    @Column(name = "CD_CLASSIFICACAO", nullable = false, unique = true, length = 40)
    private String codigo;

    @Column(name = "NM_CLASSIFICACAO", nullable = false, length = 80)
    private String nome;

    public Classificacao() {
    }

    public Classificacao(Long idClassificacao, String codigo, String nome) {
        this.idClassificacao = idClassificacao;
        this.codigo = codigo;
        this.nome = nome;
    }

    public Long getIdClassificacao() {
        return idClassificacao;
    }

    public void setIdClassificacao(Long idClassificacao) {
        this.idClassificacao = idClassificacao;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }
}
