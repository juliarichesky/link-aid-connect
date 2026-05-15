package com.turmadobem.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "T_LKA_CONTATO")
public class Contato {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_CONTATO")
    private Long idContato;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ID_TIPO_CONTATO", nullable = false)
    private TipoContato tipoContato;

    @Column(name = "NM_CONTATO", nullable = false, length = 120)
    private String nome;

    @Column(name = "DOC_CONTATO", unique = true, length = 20)
    private String documento;

    @Column(name = "EMAIL_CONTATO", length = 120)
    private String email;

    @Column(name = "TEL_CONTATO", length = 25)
    private String telefone;

    @Column(name = "NM_CIDADE", length = 80)
    private String cidade;

    @Column(name = "SG_UF", length = 2)
    private String uf;

    @Lob
    @Column(name = "DS_OBSERVACAO")
    private String observacao;

    @Column(name = "DT_CADASTRO", nullable = false)
    private LocalDateTime dataCadastro;

    public Contato() {
    }

    public Contato(Long idContato, TipoContato tipoContato, String nome, String documento, String email,
                   String telefone, String cidade, String uf, String observacao, LocalDateTime dataCadastro) {
        this.idContato = idContato;
        this.tipoContato = tipoContato;
        this.nome = nome;
        this.documento = documento;
        this.email = email;
        this.telefone = telefone;
        this.cidade = cidade;
        this.uf = uf;
        this.observacao = observacao;
        this.dataCadastro = dataCadastro;
    }

    public Long getIdContato() {
        return idContato;
    }

    public void setIdContato(Long idContato) {
        this.idContato = idContato;
    }

    public TipoContato getTipoContato() {
        return tipoContato;
    }

    public void setTipoContato(TipoContato tipoContato) {
        this.tipoContato = tipoContato;
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

    public String getObservacao() {
        return observacao;
    }

    public void setObservacao(String observacao) {
        this.observacao = observacao;
    }

    public LocalDateTime getDataCadastro() {
        return dataCadastro;
    }

    public void setDataCadastro(LocalDateTime dataCadastro) {
        this.dataCadastro = dataCadastro;
    }
}
