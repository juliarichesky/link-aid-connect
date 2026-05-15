package com.turmadobem.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "T_LKA_STATUS_TICKET")
public class StatusTicket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_STATUS")
    private Long idStatus;

    @Column(name = "CD_STATUS", nullable = false, unique = true, length = 40)
    private String codigo;

    @Column(name = "NM_STATUS", nullable = false, length = 80)
    private String nome;

    public StatusTicket() {
    }

    public StatusTicket(Long idStatus, String codigo, String nome) {
        this.idStatus = idStatus;
        this.codigo = codigo;
        this.nome = nome;
    }

    public Long getIdStatus() {
        return idStatus;
    }

    public void setIdStatus(Long idStatus) {
        this.idStatus = idStatus;
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
