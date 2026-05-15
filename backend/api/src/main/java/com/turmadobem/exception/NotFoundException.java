package com.turmadobem.exception;

import jakarta.ws.rs.core.Response;

public class NotFoundException extends ApiException {
    public NotFoundException(String message) {
        super(Response.Status.NOT_FOUND, message);
    }
}
