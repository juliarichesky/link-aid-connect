package com.turmadobem.dao;

import com.turmadobem.model.WebhookEvento;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class WebhookEventoDAO implements PanacheRepository<WebhookEvento> {
}
