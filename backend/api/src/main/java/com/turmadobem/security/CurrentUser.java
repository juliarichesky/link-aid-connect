package com.turmadobem.security;

import com.turmadobem.entity.Usuario;
import jakarta.enterprise.context.RequestScoped;

@RequestScoped
public class CurrentUser {
    private Usuario usuario;
    private String token;

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}
