package com.turmadobem.config;

import jakarta.ws.rs.ApplicationPath;
import jakarta.ws.rs.core.Application;
import org.eclipse.microprofile.openapi.annotations.OpenAPIDefinition;
import org.eclipse.microprofile.openapi.annotations.info.Info;

@ApplicationPath("/")
@OpenAPIDefinition(
        info = @Info(
                title = "LinkAid API",
                version = "1.0.0",
                description = "API MVP do LinkAid para gestao de tickets, contatos, dentistas, dashboard, relatorios e integracao Watson sandbox."
        )
)
public class OpenApiConfig extends Application {
}
