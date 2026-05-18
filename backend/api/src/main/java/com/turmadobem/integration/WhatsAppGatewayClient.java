package com.turmadobem.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.turmadobem.exception.BusinessException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@ApplicationScoped
public class WhatsAppGatewayClient {
    private static final Duration REQUEST_TIMEOUT = Duration.ofSeconds(10);

    @ConfigProperty(name = "linkaid.whatsapp-gateway.url")
    String gatewayUrl;

    @Inject
    ObjectMapper objectMapper;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(REQUEST_TIMEOUT)
            .version(HttpClient.Version.HTTP_1_1)
            .build();

    public void enviarMensagem(String telefone, String mensagem) {
        String normalizedGatewayUrl = gatewayUrl == null ? "" : gatewayUrl.strip();
        if (normalizedGatewayUrl.isBlank()) {
            throw new BusinessException("URL do gateway WhatsApp nao configurada.");
        }

        try {
            String payload = objectMapper.writeValueAsString(new WhatsAppOutboundRequest(telefone, mensagem));
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(normalizedGatewayUrl.replaceAll("/$", "") + "/messages/whatsapp"))
                    .timeout(REQUEST_TIMEOUT)
                    .version(HttpClient.Version.HTTP_1_1)
                    .header("Accept", "application/json")
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(payload))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new BusinessException("Gateway WhatsApp retornou erro ao enviar mensagem.");
            }
        } catch (IOException exception) {
            throw new BusinessException("Falha ao comunicar com o gateway WhatsApp.");
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new BusinessException("Envio de WhatsApp interrompido.");
        } catch (IllegalArgumentException exception) {
            throw new BusinessException("URL do gateway WhatsApp invalida.");
        }
    }

    private record WhatsAppOutboundRequest(String to, String body) {
    }
}
