package com.turmadobem.config;

import org.eclipse.microprofile.openapi.annotations.OpenAPIDefinition;
import org.eclipse.microprofile.openapi.annotations.info.Info;
import org.eclipse.microprofile.openapi.annotations.enums.SecuritySchemeType;
import org.eclipse.microprofile.openapi.annotations.security.SecurityScheme;

@OpenAPIDefinition(
        info = @Info(
                title = "LinkAid API",
                version = "1.0.0",
                description = "API MVP do LinkAid para gestao de tickets, contatos, dentistas, dashboard, relatorios e integracao Watson sandbox."
        )
)
@SecurityScheme(
        securitySchemeName = "bearerAuth",
        type = SecuritySchemeType.HTTP,
        scheme = "bearer",
        bearerFormat = "Token",
        description = "Cole apenas o valor do token recebido em POST /auth/login. O Swagger envia o prefixo Bearer automaticamente."
)
public final class OpenApiConfig {
    private OpenApiConfig() {
    }
}
