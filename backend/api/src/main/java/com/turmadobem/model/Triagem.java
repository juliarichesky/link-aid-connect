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
@Table(name = "T_LKA_TRIAGEM")
public class Triagem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_TRIAGEM")
    private Long idTriagem;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ID_TICKET", nullable = false)
    private Ticket ticket;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ID_CONTATO", nullable = false)
    private Contato contato;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ID_USUARIO_RESPONSAVEL", nullable = false)
    private Usuario usuarioResponsavel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_DENTISTA")
    private Dentista dentista;

    @Column(name = "DT_HORA_TRIAGEM")
    private LocalDateTime dataHoraTriagem;

    @Column(name = "ST_TRIAGEM", nullable = false, length = 20)
    private String statusTriagem;

    @Lob
    @Column(name = "DS_TRIAGEM")
    private String descricaoTriagem;

    public Triagem() {
    }

    public Long getIdTriagem() {
        return idTriagem;
    }

    public void setIdTriagem(Long idTriagem) {
        this.idTriagem = idTriagem;
    }

    public Ticket getTicket() {
        return ticket;
    }

    public void setTicket(Ticket ticket) {
        this.ticket = ticket;
    }

    public Contato getContato() {
        return contato;
    }

    public void setContato(Contato contato) {
        this.contato = contato;
    }

    public Usuario getUsuarioResponsavel() {
        return usuarioResponsavel;
    }

    public void setUsuarioResponsavel(Usuario usuarioResponsavel) {
        this.usuarioResponsavel = usuarioResponsavel;
    }

    public Dentista getDentista() {
        return dentista;
    }

    public void setDentista(Dentista dentista) {
        this.dentista = dentista;
    }

    public LocalDateTime getDataHoraTriagem() {
        return dataHoraTriagem;
    }

    public void setDataHoraTriagem(LocalDateTime dataHoraTriagem) {
        this.dataHoraTriagem = dataHoraTriagem;
    }

    public String getStatusTriagem() {
        return statusTriagem;
    }

    public void setStatusTriagem(String statusTriagem) {
        this.statusTriagem = statusTriagem;
    }

    public String getDescricaoTriagem() {
        return descricaoTriagem;
    }

    public void setDescricaoTriagem(String descricaoTriagem) {
        this.descricaoTriagem = descricaoTriagem;
    }
}
