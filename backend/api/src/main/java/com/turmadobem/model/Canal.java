package com.turmadobem.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "T_LKA_CANAL")
public class Canal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_CANAL")
    private Long idCanal;

    @Column(name = "CD_CANAL", nullable = false, unique = true, length = 30)
    private String codigo;

    @Column(name = "NM_CANAL", nullable = false, length = 60)
    private String nome;

    public Canal() {
    }

    public Canal(Long idCanal, String codigo, String nome) {
        this.idCanal = idCanal;
        this.codigo = codigo;
        this.nome = nome;
    }

    public Long getIdCanal() {
        return idCanal;
    }

    public void setIdCanal(Long idCanal) {
        this.idCanal = idCanal;
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
