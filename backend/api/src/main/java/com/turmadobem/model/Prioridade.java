package com.turmadobem.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "T_LKA_PRIORIDADE")
public class Prioridade {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_PRIORIDADE")
    private Long idPrioridade;

    @Column(name = "CD_PRIORIDADE", nullable = false, unique = true, length = 20)
    private String codigo;

    @Column(name = "NM_PRIORIDADE", nullable = false, length = 40)
    private String nome;

    @Column(name = "NR_ORDEM", nullable = false)
    private Integer ordem;

    public Prioridade() {
    }

    public Prioridade(Long idPrioridade, String codigo, String nome, Integer ordem) {
        this.idPrioridade = idPrioridade;
        this.codigo = codigo;
        this.nome = nome;
        this.ordem = ordem;
    }

    public Long getIdPrioridade() {
        return idPrioridade;
    }

    public void setIdPrioridade(Long idPrioridade) {
        this.idPrioridade = idPrioridade;
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

    public Integer getOrdem() {
        return ordem;
    }

    public void setOrdem(Integer ordem) {
        this.ordem = ordem;
    }
}
