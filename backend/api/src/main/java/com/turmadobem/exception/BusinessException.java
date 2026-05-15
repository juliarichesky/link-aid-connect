package com.turmadobem.exception;

import jakarta.ws.rs.core.Response;

public class BusinessException extends ApiException {
    public BusinessException(String message) {
        super(Response.Status.BAD_REQUEST, message);
    }
}
