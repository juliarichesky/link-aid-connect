package com.turmadobem.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDateTime;

public class AgendaDentista {
    private Integer idAgendaDentista;
    private Integer idDentista;
    private LocalDateTime dataHoraInicio;
    private LocalDateTime dataHoraFim;
    private String status;
    private String observacao;
    @JsonIgnoreProperties("agenda")
    private Dentista dentista;

    public AgendaDentista() {
    }

    public AgendaDentista(Integer idAgendaDentista, Integer idDentista, LocalDateTime dataHoraInicio,
                          LocalDateTime dataHoraFim, String status, String observacao) {
        this.idAgendaDentista = idAgendaDentista;
        this.idDentista = idDentista;
        this.dataHoraInicio = dataHoraInicio;
        this.dataHoraFim = dataHoraFim;
        this.status = status;
        this.observacao = observacao;
    }

    public Integer getIdAgendaDentista() {
        return idAgendaDentista;
    }

    public void setIdAgendaDentista(Integer idAgendaDentista) {
        this.idAgendaDentista = idAgendaDentista;
    }

    public Integer getIdDentista() {
        return idDentista;
    }

    public void setIdDentista(Integer idDentista) {
        this.idDentista = idDentista;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getObservacao() {
        return observacao;
    }

    public void setObservacao(String observacao) {
        this.observacao = observacao;
    }

    public Dentista getDentista() {
        return dentista;
    }

    public void setDentista(Dentista dentista) {
        this.dentista = dentista;
        if (dentista != null) {
            this.idDentista = dentista.getIdDentista();
        }
    }
}
