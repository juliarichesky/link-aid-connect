package com.turmadobem.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "T_LKA_DENTISTA")
public class Dentista {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_DENTISTA")
    private Long idDentista;

    @Column(name = "NM_DENTISTA", nullable = false, length = 120)
    private String nome;

    @Column(name = "NR_CRO", nullable = false, unique = true, length = 30)
    private String cro;

    @Column(name = "DS_ESPECIALIDADE", nullable = false, length = 80)
    private String especialidade;

    @Column(name = "EMAIL_DENTISTA", length = 120)
    private String email;

    @Column(name = "TEL_DENTISTA", length = 25)
    private String telefone;

    @Column(name = "NM_CIDADE", length = 80)
    private String cidade;

    @Column(name = "SG_UF", length = 2)
    private String uf;

    @Column(name = "ST_DENTISTA", nullable = false, length = 1)
    private String status;

    @Column(name = "DT_CADASTRO", nullable = false)
    private LocalDateTime dataCadastro;

    public Dentista() {
    }

    public Dentista(Long idDentista, String nome, String cro, String especialidade, String email, String telefone,
                    String cidade, String uf, String status, LocalDateTime dataCadastro) {
        this.idDentista = idDentista;
        this.nome = nome;
        this.cro = cro;
        this.especialidade = especialidade;
        this.email = email;
        this.telefone = telefone;
        this.cidade = cidade;
        this.uf = uf;
        this.status = status;
        this.dataCadastro = dataCadastro;
    }

    public Long getIdDentista() {
        return idDentista;
    }

    public void setIdDentista(Long idDentista) {
        this.idDentista = idDentista;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getCro() {
        return cro;
    }

    public void setCro(String cro) {
        this.cro = cro;
    }

    public String getEspecialidade() {
        return especialidade;
    }

    public void setEspecialidade(String especialidade) {
        this.especialidade = especialidade;
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

    public String getCidade() {
        return cidade;
    }

    public void setCidade(String cidade) {
        this.cidade = cidade;
    }

    public String getUf() {
        return uf;
    }

    public void setUf(String uf) {
        this.uf = uf;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getDataCadastro() {
        return dataCadastro;
    }

    public void setDataCadastro(LocalDateTime dataCadastro) {
        this.dataCadastro = dataCadastro;
    }

    public boolean isAtivo() {
        return "A".equalsIgnoreCase(status);
    }
}
