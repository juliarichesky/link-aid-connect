package com.turmadobem.resource;

public record LoginResponse(String token, Integer idUsuario, String nome, String email, String role) {
}
