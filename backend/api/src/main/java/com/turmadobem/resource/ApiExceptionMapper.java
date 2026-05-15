package com.turmadobem.resource;

import com.turmadobem.exception.ApiException;
import jakarta.validation.ConstraintViolationException;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import org.jboss.logging.Logger;

import java.util.stream.Collectors;

@Provider
public class ApiExceptionMapper implements ExceptionMapper<Throwable> {
    private static final Logger LOG = Logger.getLogger(ApiExceptionMapper.class);

    @Override
    public Response toResponse(Throwable exception) {
        if (exception instanceof ApiException apiException) {
            return Response.status(apiException.getStatus())
                    .entity(new ApiErrorResponse(apiException.getMessage()))
                    .build();
        }
        if (exception instanceof ConstraintViolationException validationException) {
            String mensagem = validationException.getConstraintViolations().stream()
                    .map(violation -> violation.getPropertyPath() + ": " + violation.getMessage())
                    .collect(Collectors.joining("; "));
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ApiErrorResponse(mensagem))
                    .build();
        }
        if (exception instanceof WebApplicationException webApplicationException) {
            Response response = webApplicationException.getResponse();
            Object entity = response.getEntity();
            if (entity == null) {
                entity = new ApiErrorResponse(exception.getMessage());
            }
            return Response.status(response.getStatus())
                    .entity(entity)
                    .build();
        }
        if (exception instanceof IllegalArgumentException) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new ApiErrorResponse(exception.getMessage()))
                    .build();
        }
        if (exception instanceof IllegalStateException) {
            return Response.status(Response.Status.CONFLICT)
                    .entity(new ApiErrorResponse(exception.getMessage()))
                    .build();
        }
        if (exception.getClass().getName().contains("PersistenceException")) {
            LOG.error("Erro de banco de dados durante o processamento da requisicao.", exception);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(new ApiErrorResponse("Erro ao acessar o banco de dados."))
                    .build();
        }
        LOG.error("Erro interno nao tratado.", exception);
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(new ApiErrorResponse("Erro interno no servidor."))
                .build();
    }
}
