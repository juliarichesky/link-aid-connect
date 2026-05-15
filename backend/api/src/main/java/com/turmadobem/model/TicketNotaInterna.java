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
@Table(name = "T_LKA_TICKET_NOTA_INTERNA")
public class TicketNotaInterna {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_NOTA_INTERNA")
    private Long idNotaInterna;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ID_TICKET", nullable = false)
    private Ticket ticket;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ID_USUARIO", nullable = false)
    private Usuario usuario;

    @Lob
    @Column(name = "DS_NOTA", nullable = false)
    private String nota;

    @Column(name = "DT_NOTA", nullable = false)
    private LocalDateTime dataNota;

    public TicketNotaInterna() {
    }

    public Long getIdNotaInterna() {
        return idNotaInterna;
    }

    public void setIdNotaInterna(Long idNotaInterna) {
        this.idNotaInterna = idNotaInterna;
    }

    public Ticket getTicket() {
        return ticket;
    }

    public void setTicket(Ticket ticket) {
        this.ticket = ticket;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public String getNota() {
        return nota;
    }

    public void setNota(String nota) {
        this.nota = nota;
    }

    public LocalDateTime getDataNota() {
        return dataNota;
    }

    public void setDataNota(LocalDateTime dataNota) {
        this.dataNota = dataNota;
    }
}
