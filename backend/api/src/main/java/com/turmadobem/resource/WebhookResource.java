package com.turmadobem.resource;

import com.turmadobem.bo.WebhookBO;
import com.turmadobem.dto.LinkAidDtos;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/webhooks")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class WebhookResource {
    @Inject
    WebhookBO webhookBO;

    @POST
    @Path("/watson/tickets")
    public Response criarTicketViaWatson(@Valid LinkAidDtos.WebhookTicketRequest request) {
        return Response.status(Response.Status.CREATED)
                .entity(webhookBO.criarTicketViaWatson(request))
                .build();
    }
}
