package com.turmadobem.exception;

import jakarta.ws.rs.core.Response;

public class ForbiddenException extends ApiException {
    public ForbiddenException(String message) {
        super(Response.Status.FORBIDDEN, message);
    }
}
