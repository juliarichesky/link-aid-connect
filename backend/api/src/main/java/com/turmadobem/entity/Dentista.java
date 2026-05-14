package com.turmadobem.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.ArrayList;
import java.util.List;

public class Dentista {
    private Integer idDentista;
    private String nome;
    private String cro;
    private String especialidade;
    private String estado;
    private String status;
    @JsonIgnoreProperties("dentista")
    private List<AgendaDentista> agenda = new ArrayList<>();

    public Dentista() {
    }

    public Dentista(Integer idDentista, String nome, String cro, String especialidade, String estado, String status) {
        this.idDentista = idDentista;
        this.nome = nome;
        this.cro = cro;
        this.especialidade = especialidade;
        this.estado = estado;
        this.status = status;
    }

    public Integer getIdDentista() {
        return idDentista;
    }

    public void setIdDentista(Integer idDentista) {
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

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<AgendaDentista> getAgenda() {
        return agenda;
    }

    public void setAgenda(List<AgendaDentista> agenda) {
        this.agenda = agenda == null ? new ArrayList<>() : agenda;
    }
}
