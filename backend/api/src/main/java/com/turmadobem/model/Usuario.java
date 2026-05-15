package com.turmadobem.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "T_LKA_USUARIO")
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_USUARIO")
    private Long idUsuario;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ID_PERFIL", nullable = false)
    private Perfil perfil;

    @Column(name = "NM_USUARIO", nullable = false, length = 100)
    private String nome;

    @Column(name = "EMAIL_USUARIO", nullable = false, unique = true, length = 120)
    private String email;

    @JsonIgnore
    @Column(name = "SENHA_USUARIO", nullable = false, length = 255)
    private String senha;

    @Column(name = "ST_USUARIO", nullable = false, length = 1)
    private String status;

    @Column(name = "DT_CRIACAO", nullable = false)
    private LocalDateTime dataCriacao;

    public Usuario() {
    }

    public Usuario(Long idUsuario, Perfil perfil, String nome, String email, String senha, String status,
                   LocalDateTime dataCriacao) {
        this.idUsuario = idUsuario;
        this.perfil = perfil;
        this.nome = nome;
        this.email = email;
        this.senha = senha;
        this.status = status;
        this.dataCriacao = dataCriacao;
    }

    public Long getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Long idUsuario) {
        this.idUsuario = idUsuario;
    }

    public Perfil getPerfil() {
        return perfil;
    }

    public void setPerfil(Perfil perfil) {
        this.perfil = perfil;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getDataCriacao() {
        return dataCriacao;
    }

    public void setDataCriacao(LocalDateTime dataCriacao) {
        this.dataCriacao = dataCriacao;
    }

    public boolean isAtivo() {
        return "A".equalsIgnoreCase(status);
    }
}
