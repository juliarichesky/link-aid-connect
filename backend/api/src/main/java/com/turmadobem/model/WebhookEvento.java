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
@Table(name = "T_LKA_WEBHOOK_EVENTO")
public class WebhookEvento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_WEBHOOK_EVENTO")
    private Long idWebhookEvento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_TICKET")
    private Ticket ticket;

    @Column(name = "DS_ORIGEM", nullable = false, length = 40)
    private String origem;

    @Column(name = "DS_EXTERNAL_ID", length = 120)
    private String externalId;

    @Lob
    @Column(name = "DS_PAYLOAD", nullable = false)
    private String payload;

    @Column(name = "ST_PROCESSAMENTO", nullable = false, length = 20)
    private String statusProcessamento;

    @Column(name = "DS_ERRO", length = 500)
    private String erro;

    @Column(name = "DT_RECEBIMENTO", nullable = false)
    private LocalDateTime dataRecebimento;

    public WebhookEvento() {
    }

    public Long getIdWebhookEvento() {
        return idWebhookEvento;
    }

    public void setIdWebhookEvento(Long idWebhookEvento) {
        this.idWebhookEvento = idWebhookEvento;
    }

    public Ticket getTicket() {
        return ticket;
    }

    public void setTicket(Ticket ticket) {
        this.ticket = ticket;
    }

    public String getOrigem() {
        return origem;
    }

    public void setOrigem(String origem) {
        this.origem = origem;
    }

    public String getExternalId() {
        return externalId;
    }

    public void setExternalId(String externalId) {
        this.externalId = externalId;
    }

    public String getPayload() {
        return payload;
    }

    public void setPayload(String payload) {
        this.payload = payload;
    }

    public String getStatusProcessamento() {
        return statusProcessamento;
    }

    public void setStatusProcessamento(String statusProcessamento) {
        this.statusProcessamento = statusProcessamento;
    }

    public String getErro() {
        return erro;
    }

    public void setErro(String erro) {
        this.erro = erro;
    }

    public LocalDateTime getDataRecebimento() {
        return dataRecebimento;
    }

    public void setDataRecebimento(LocalDateTime dataRecebimento) {
        this.dataRecebimento = dataRecebimento;
    }
}
