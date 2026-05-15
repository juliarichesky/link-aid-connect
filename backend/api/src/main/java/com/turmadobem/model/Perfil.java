package com.turmadobem.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "T_LKA_PERFIL")
public class Perfil {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_PERFIL")
    private Long idPerfil;

    @Column(name = "CD_PERFIL", nullable = false, unique = true, length = 30)
    private String codigo;

    @Column(name = "NM_PERFIL", nullable = false, length = 60)
    private String nome;

    public Perfil() {
    }

    public Perfil(Long idPerfil, String codigo, String nome) {
        this.idPerfil = idPerfil;
        this.codigo = codigo;
        this.nome = nome;
    }

    public Long getIdPerfil() {
        return idPerfil;
    }

    public void setIdPerfil(Long idPerfil) {
        this.idPerfil = idPerfil;
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
