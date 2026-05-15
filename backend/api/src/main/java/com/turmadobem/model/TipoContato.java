package com.turmadobem.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "T_LKA_TIPO_CONTATO")
public class TipoContato {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_TIPO_CONTATO")
    private Long idTipoContato;

    @Column(name = "CD_TIPO_CONTATO", nullable = false, unique = true, length = 30)
    private String codigo;

    @Column(name = "NM_TIPO_CONTATO", nullable = false, length = 60)
    private String nome;

    public TipoContato() {
    }

    public TipoContato(Long idTipoContato, String codigo, String nome) {
        this.idTipoContato = idTipoContato;
        this.codigo = codigo;
        this.nome = nome;
    }

    public Long getIdTipoContato() {
        return idTipoContato;
    }

    public void setIdTipoContato(Long idTipoContato) {
        this.idTipoContato = idTipoContato;
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
