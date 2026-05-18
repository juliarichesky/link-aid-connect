package com.turmadobem.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public final class LinkAidDtos {
    private LinkAidDtos() {
    }

    public record LoginRequest(
            @NotBlank @Email String email,
            String senha,
            String password
    ) {
        public String senhaInformada() {
            return senha != null && !senha.isBlank() ? senha : password;
        }
    }

    public record LoginResponse(
            String token,
            Long idUsuario,
            String nome,
            String email,
            String perfil
    ) {
    }

    public record UsuarioResponse(
            Long idUsuario,
            String nome,
            String email,
            String perfil,
            String status
    ) {
    }

    public record ContatoRequest(
            @NotBlank String nome,
            String documento,
            @Email String email,
            String telefone,
            @NotBlank String tipoContatoCodigo,
            String cidade,
            @Size(max = 2) String uf,
            String observacao
    ) {
    }

    public record ContatoResponse(
            Long idContato,
            String nome,
            String documento,
            String email,
            String telefone,
            String tipoContatoCodigo,
            String tipoContatoNome,
            String cidade,
            String uf,
            String observacao,
            LocalDateTime dataCadastro
    ) {
    }

    public record DentistaRequest(
            @NotBlank String nome,
            @NotBlank String cro,
            @NotBlank String especialidade,
            @Email String email,
            String telefone,
            String cidade,
            @Size(max = 2) String uf,
            String status
    ) {
    }

    public record DentistaResponse(
            Long idDentista,
            String nome,
            String cro,
            String especialidade,
            String email,
            String telefone,
            String cidade,
            String uf,
            String status,
            LocalDateTime dataCadastro
    ) {
    }

    public record TicketRequest(
            Long idContato,
            String nomeContato,
            String documentoContato,
            @Email String emailContato,
            String telefoneContato,
            String tipoContatoCodigo,
            String cidadeContato,
            @Size(max = 2) String ufContato,
            @NotBlank String canalCodigo,
            @NotBlank String prioridadeCodigo,
            String classificacaoCodigo,
            Long idUsuarioResponsavel,
            Long idDentistaResponsavel,
            @NotBlank String assunto,
            @NotBlank String descricao,
            String resumoIa,
            @DecimalMin("0.00") @DecimalMax("100.00") BigDecimal confiancaIa
    ) {
    }

    public record TicketUpdateRequest(
            String canalCodigo,
            String statusCodigo,
            String prioridadeCodigo,
            String classificacaoCodigo,
            Long idUsuarioResponsavel,
            Long idDentistaResponsavel,
            String assunto,
            String descricao,
            String resumoIa,
            @DecimalMin("0.00") @DecimalMax("100.00") BigDecimal confiancaIa
    ) {
    }

    public record TicketStatusRequest(@NotBlank String statusCodigo) {
    }

    public record TicketResponsavelRequest(@NotNull Long idUsuarioResponsavel) {
    }

    public record MensagemRequest(
            @NotBlank String tipoRemetente,
            @NotBlank String mensagem,
            Long idUsuario
    ) {
    }

    public record MensagemResponse(
            Long idMensagem,
            Long idTicket,
            Long idUsuario,
            String nomeUsuario,
            String tipoRemetente,
            String mensagem,
            LocalDateTime dataMensagem
    ) {
    }

    public record NotaInternaRequest(
            @NotBlank String nota,
            Long idUsuario
    ) {
    }

    public record NotaInternaResponse(
            Long idNotaInterna,
            Long idTicket,
            Long idUsuario,
            String nomeUsuario,
            String nota,
            LocalDateTime dataNota
    ) {
    }

    public record TicketResponse(
            Long idTicket,
            String protocolo,
            ContatoResponse contato,
            String canalCodigo,
            String canalNome,
            String statusCodigo,
            String statusNome,
            String prioridadeCodigo,
            String prioridadeNome,
            String classificacaoCodigo,
            String classificacaoNome,
            UsuarioResponse responsavel,
            DentistaResponse dentistaResponsavel,
            String assunto,
            String descricao,
            String resumoIa,
            BigDecimal confiancaIa,
            LocalDateTime dataAbertura,
            LocalDateTime dataAtualizacao,
            LocalDateTime dataFechamento,
            List<MensagemResponse> mensagens
    ) {
    }

    public record HistoricoContatoResponse(
            ContatoResponse contato,
            List<TicketResponse> tickets
    ) {
    }

    public record AgrupamentoResponse(
            String codigo,
            String nome,
            Long quantidade
    ) {
    }

    public record DashboardResumoResponse(
            Long totalContatos,
            Long totalTickets,
            Long ticketsNovos,
            Long ticketsEmAtendimento,
            Long ticketsResolvidos,
            Long totalDentistas,
            Long dentistasAtivos
    ) {
    }

    public record DashboardResponse(
            DashboardResumoResponse resumo,
            List<AgrupamentoResponse> ticketsPorStatus,
            List<AgrupamentoResponse> ticketsPorCanal,
            List<TicketResponse> ultimosTickets
    ) {
    }

    public record NotificacaoResponse(
            String id,
            String titulo,
            String descricao,
            String tipo,
            Long idTicket,
            LocalDateTime dataEvento
    ) {
    }

    public record DominioItemResponse(
            String codigo,
            String nome,
            Integer ordem
    ) {
    }

    public record DominiosResponse(
            List<DominioItemResponse> tiposContato,
            List<DominioItemResponse> canais,
            List<DominioItemResponse> statusTicket,
            List<DominioItemResponse> prioridades,
            List<DominioItemResponse> classificacoes
    ) {
    }

    public record WebhookTicketRequest(
            String externalId,
            String origem,
            String from,
            String nome,
            @NotBlank String body,
            String tipoContatoCodigo,
            String prioridadeCodigo,
            String classificacaoCodigo,
            String intent,
            String respostaIa,
            @DecimalMin("0.00") @DecimalMax("100.00") BigDecimal confiancaIa,
            String payload
    ) {
    }
}
