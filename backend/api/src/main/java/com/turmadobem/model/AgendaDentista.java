package com.turmadobem.model;

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
@Table(name = "T_LKA_AGENDA_DENTISTA")
public class AgendaDentista {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_AGENDA_DENTISTA")
    private Long idAgendaDentista;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ID_DENTISTA", nullable = false)
    private Dentista dentista;

    @Column(name = "DT_HORA_INICIO", nullable = false)
    private LocalDateTime dataHoraInicio;

    @Column(name = "DT_HORA_FIM", nullable = false)
    private LocalDateTime dataHoraFim;

    @Column(name = "ST_AGENDA", nullable = false, length = 20)
    private String statusAgenda;

    @Column(name = "DS_OBSERVACAO", length = 300)
    private String observacao;

    public AgendaDentista() {
    }

    public Long getIdAgendaDentista() {
        return idAgendaDentista;
    }

    public void setIdAgendaDentista(Long idAgendaDentista) {
        this.idAgendaDentista = idAgendaDentista;
    }

    public Dentista getDentista() {
        return dentista;
    }

    public void setDentista(Dentista dentista) {
        this.dentista = dentista;
    }

    public LocalDateTime getDataHoraInicio() {
        return dataHoraInicio;
    }

    public void setDataHoraInicio(LocalDateTime dataHoraInicio) {
        this.dataHoraInicio = dataHoraInicio;
    }

    public LocalDateTime getDataHoraFim() {
        return dataHoraFim;
    }

    public void setDataHoraFim(LocalDateTime dataHoraFim) {
        this.dataHoraFim = dataHoraFim;
    }

    public String getStatusAgenda() {
        return statusAgenda;
    }

    public void setStatusAgenda(String statusAgenda) {
        this.statusAgenda = statusAgenda;
    }

    public String getObservacao() {
        return observacao;
    }

    public void setObservacao(String observacao) {
        this.observacao = observacao;
    }
}
