package com.turmadobem.service;

import com.turmadobem.entity.Contato;
import com.turmadobem.entity.Dentista;
import com.turmadobem.entity.Mensagem;
import com.turmadobem.entity.Ticket;
import com.turmadobem.repository.ContatoRepository;
import com.turmadobem.repository.DentistaRepository;
import com.turmadobem.repository.MensagemRepository;
import com.turmadobem.repository.TicketRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.sql.SQLException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@ApplicationScoped
public class TicketService {
    private static final Logger LOG = Logger.getLogger(TicketService.class);
    private static final Set<String> CANAIS_SUPORTADOS = Set.of("WHATSAPP", "EMAIL", "CHAT", "TELEFONE", "INSTAGRAM", "TELEGRAM");
    private static final Set<String> STATUS_SUPORTADOS = Set.of("ABERTO", "EM_ATENDIMENTO", "AGUARDANDO_CLIENTE", "RESOLVIDO", "CANCELADO", "ARQUIVADO");
    private static final Set<String> PRIORIDADES_SUPORTADAS = Set.of("BAIXA", "MEDIA", "ALTA", "CRITICA");
    private static final Set<String> REMETENTES_SUPORTADOS = Set.of("BOT", "USUARIO", "ATENDENTE");
    private static final Set<String> DIRECOES_ORDENACAO = Set.of("ASC", "DESC");
    private static final Map<String, String> CAMPOS_ORDENACAO = Map.of(
            "idTicket", "T.ID_TICKET",
            "protocolo", "T.NR_PROTOCOLO",
            "assunto", "T.ASSUNTO",
            "status", "T.STATUS_TICKET",
            "prioridade", "T.PRIORIDADE_TICKET",
            "canalOrigem", "T.CANAL_ORIGEM",
            "dataAbertura", "T.DT_ABERTURA",
            "dataAtualizacao", "T.DT_ATUALIZACAO"
    );

    @Inject
    TicketRepository ticketRepository;

    @Inject
    ContatoRepository contatoRepository;

    @Inject
    DentistaRepository dentistaRepository;

    @Inject
    MensagemRepository mensagemRepository;

    public Ticket criarTicket(Ticket ticket) throws SQLException {
        validarTicket(ticket);
        normalizarTicket(ticket);
        Contato contato = contatoRepository.findById(ticket.getIdContato());
        if (contato == null) {
            throw new IllegalArgumentException("Contato nao encontrado.");
        }

        int idTicket = ticketRepository.nextId();
        LocalDateTime agora = LocalDateTime.now();
        ticket.setIdTicket(idTicket);
        ticket.setProtocolo(gerarProtocolo(idTicket, agora));
        ticket.setStatus(normalizarStatus(ticket.getStatus() == null ? "ABERTO" : ticket.getStatus()));
        associarDentistaResponsavel(ticket);
        ticket.setDataAbertura(agora);
        ticket.setDataAtualizacao(agora);
        ticket.setContato(contato);
        Ticket criado = ticketRepository.create(ticket);
        criado.setMensagens(List.of());
        LOG.infov("Ticket {0} criado para contato {1} com protocolo {2}.", criado.getIdTicket(), criado.getIdContato(), criado.getProtocolo());
        return criado;
    }

    public List<Ticket> listarTickets() throws SQLException {
        List<Ticket> tickets = ticketRepository.findAll(null, null);
        preencherMensagens(tickets);
        return tickets;
    }

    public List<Ticket> listarTickets(Integer contatoId, String canalOrigem) throws SQLException {
        String canalNormalizado = canalOrigem == null || canalOrigem.isBlank() ? null : normalizarCanal(canalOrigem);
        List<Ticket> tickets = ticketRepository.findAll(contatoId, canalNormalizado);
        preencherMensagens(tickets);
        return tickets;
    }

    public List<Ticket> listarTickets(Integer contatoId, String canalOrigem, int page, int size,
                                      String sortBy, String sortOrder) throws SQLException {
        String canalNormalizado = canalOrigem == null || canalOrigem.isBlank() ? null : normalizarCanal(canalOrigem);
        List<Ticket> tickets = ticketRepository.findAll(
                contatoId,
                canalNormalizado,
                validarPage(page),
                validarSize(size),
                normalizarSortBy(sortBy),
                normalizarSortOrder(sortOrder)
        );
        preencherMensagens(tickets);
        return tickets;
    }

    public Ticket buscarTicketPorId(int idTicket) throws SQLException {
        Ticket ticket = ticketRepository.findById(idTicket);
        if (ticket != null) {
            ticket.setMensagens(mensagemRepository.findByTicket(idTicket));
        }
        return ticket;
    }

    public List<Ticket> listarTicketsPorContato(int idContato) throws SQLException {
        List<Ticket> tickets = ticketRepository.findAll(idContato, null);
        preencherMensagens(tickets);
        return tickets;
    }

    public Ticket atualizarTicket(int idTicket, Ticket ticket) throws SQLException {
        validarTicket(ticket);
        normalizarTicket(ticket);
        Ticket existente = ticketRepository.findById(idTicket);
        if (existente == null) {
            return null;
        }
        Contato contato = contatoRepository.findById(ticket.getIdContato());
        if (contato == null) {
            throw new IllegalArgumentException("Contato nao encontrado.");
        }

        existente.setIdContato(ticket.getIdContato());
        existente.setCanalOrigem(ticket.getCanalOrigem());
        existente.setAssunto(ticket.getAssunto());
        existente.setDescricao(ticket.getDescricao());
        existente.setStatus(normalizarStatus(ticket.getStatus()));
        existente.setPrioridade(ticket.getPrioridade());
        existente.setIdDentistaResponsavel(ticket.getIdDentistaResponsavel());
        associarDentistaResponsavel(existente);
        existente.setDataAtualizacao(LocalDateTime.now());
        existente.setContato(contato);
        Ticket atualizado = ticketRepository.update(existente);
        atualizado.setMensagens(mensagemRepository.findByTicket(idTicket));
        return atualizado;
    }

    public Ticket atualizarStatus(int idTicket, String status) throws SQLException {
        Ticket ticket = ticketRepository.findById(idTicket);
        if (ticket == null) {
            return null;
        }
        ticket.setStatus(normalizarStatus(status));
        ticket.setDataAtualizacao(LocalDateTime.now());
        Ticket atualizado = ticketRepository.update(ticket);
        atualizado.setMensagens(mensagemRepository.findByTicket(idTicket));
        return atualizado;
    }

    public List<Mensagem> listarMensagens(int idTicket) throws SQLException {
        garantirTicketExistente(idTicket);
        return mensagemRepository.findByTicket(idTicket);
    }

    public Mensagem adicionarMensagem(int idTicket, Mensagem mensagem) throws SQLException {
        Ticket ticket = garantirTicketExistente(idTicket);
        validarMensagem(mensagem);

        LocalDateTime agora = LocalDateTime.now();
        mensagem.setIdMensagem(mensagemRepository.nextId());
        mensagem.setIdTicket(idTicket);
        mensagem.setRemetente(normalizarRemetente(mensagem.getRemetente()));
        mensagem.setConteudo(mensagem.getConteudo().trim());
        mensagem.setDataHora(agora);
        mensagem.setTicket(ticket);

        Mensagem criada = mensagemRepository.create(mensagem);
        ticket.setDataAtualizacao(agora);
        ticketRepository.update(ticket);
        return criada;
    }

    public void removerTicket(int idTicket) throws SQLException {
        arquivarTicket(idTicket);
    }

    public Ticket arquivarTicket(int idTicket) throws SQLException {
        Ticket ticket = garantirTicketExistente(idTicket);
        ticket.setStatus(normalizarStatus("ARQUIVADO"));
        ticket.setDataAtualizacao(LocalDateTime.now());
        Ticket atualizado = ticketRepository.update(ticket);
        atualizado.setMensagens(mensagemRepository.findByTicket(idTicket));
        return atualizado;
    }

    public Ticket desarquivarTicket(int idTicket) throws SQLException {
        Ticket ticket = garantirTicketExistente(idTicket);
        ticket.setStatus(normalizarStatus("ABERTO"));
        ticket.setDataAtualizacao(LocalDateTime.now());
        Ticket atualizado = ticketRepository.update(ticket);
        atualizado.setMensagens(mensagemRepository.findByTicket(idTicket));
        return atualizado;
    }

    private void preencherMensagens(List<Ticket> tickets) throws SQLException {
        for (Ticket ticket : tickets) {
            ticket.setMensagens(mensagemRepository.findByTicket(ticket.getIdTicket()));
        }
    }

    private void validarTicket(Ticket ticket) {
        if (ticket == null) {
            throw new IllegalArgumentException("Ticket invalido.");
        }
        if (ticket.getIdContato() == null) {
            throw new IllegalArgumentException("O ticket deve estar vinculado a um contato.");
        }
        if (ticket.getAssunto() == null || ticket.getAssunto().isBlank()) {
            throw new IllegalArgumentException("O assunto do ticket e obrigatorio.");
        }
        if (ticket.getDescricao() == null || ticket.getDescricao().isBlank()) {
            throw new IllegalArgumentException("A descricao do ticket e obrigatoria.");
        }
        normalizarCanal(ticket.getCanalOrigem());
        normalizarPrioridade(ticket.getPrioridade());
        if (ticket.getStatus() != null) {
            normalizarStatus(ticket.getStatus());
        }
    }

    private void normalizarTicket(Ticket ticket) {
        ticket.setCanalOrigem(normalizarCanal(ticket.getCanalOrigem()));
        ticket.setAssunto(normalizarTextoObrigatorio(ticket.getAssunto(), "O assunto do ticket e obrigatorio."));
        ticket.setDescricao(normalizarTextoObrigatorio(ticket.getDescricao(), "A descricao do ticket e obrigatoria."));
        ticket.setPrioridade(normalizarPrioridade(ticket.getPrioridade()));
        if (ticket.getStatus() != null) {
            ticket.setStatus(normalizarStatus(ticket.getStatus()));
        }
    }

    private void associarDentistaResponsavel(Ticket ticket) throws SQLException {
        if (ticket.getIdDentistaResponsavel() == null) {
            ticket.setDentistaResponsavel(null);
            return;
        }
        Dentista dentista = dentistaRepository.findById(ticket.getIdDentistaResponsavel());
        if (dentista == null) {
            throw new IllegalArgumentException("Dentista responsavel nao encontrado.");
        }
        ticket.setDentistaResponsavel(dentista);
    }

    private void validarMensagem(Mensagem mensagem) {
        if (mensagem == null) {
            throw new IllegalArgumentException("Mensagem invalida.");
        }
        if (mensagem.getConteudo() == null || mensagem.getConteudo().trim().isEmpty()) {
            throw new IllegalArgumentException("O conteudo da mensagem e obrigatorio.");
        }
        normalizarRemetente(mensagem.getRemetente());
    }

    private Ticket garantirTicketExistente(int idTicket) throws SQLException {
        Ticket ticket = ticketRepository.findById(idTicket);
        if (ticket == null) {
            throw new IllegalArgumentException("Ticket nao encontrado.");
        }
        return ticket;
    }

    private String gerarProtocolo(int idTicket, LocalDateTime dataHora) {
        return "TKT-" + dataHora.format(DateTimeFormatter.ofPattern("yyyyMMddHHmm")) + "-" + idTicket;
    }

    private String normalizarTextoObrigatorio(String valor, String mensagemErro) {
        if (valor == null || valor.isBlank()) {
            throw new IllegalArgumentException(mensagemErro);
        }
        return valor.trim();
    }

    private String normalizarCanal(String canal) {
        if (canal == null || canal.isBlank()) {
            throw new IllegalArgumentException("O canal de origem e obrigatorio.");
        }
        String valor = canal.trim().toUpperCase(Locale.ROOT);
        if (!CANAIS_SUPORTADOS.contains(valor)) {
            throw new IllegalArgumentException("Canal invalido. Use: " + CANAIS_SUPORTADOS);
        }
        return valor;
    }

    private String normalizarStatus(String status) {
        if (status == null || status.isBlank()) {
            throw new IllegalArgumentException("O status do ticket e obrigatorio.");
        }
        String valor = status.trim().toUpperCase(Locale.ROOT);
        if (!STATUS_SUPORTADOS.contains(valor)) {
            throw new IllegalArgumentException("Status invalido. Use: " + STATUS_SUPORTADOS);
        }
        return valor;
    }

    private String normalizarPrioridade(String prioridade) {
        if (prioridade == null || prioridade.isBlank()) {
            throw new IllegalArgumentException("A prioridade do ticket e obrigatoria.");
        }
        String valor = prioridade.trim().toUpperCase(Locale.ROOT);
        if (!PRIORIDADES_SUPORTADAS.contains(valor)) {
            throw new IllegalArgumentException("Prioridade invalida. Use: " + PRIORIDADES_SUPORTADAS);
        }
        return valor;
    }

    private String normalizarRemetente(String remetente) {
        if (remetente == null || remetente.isBlank()) {
            throw new IllegalArgumentException("O remetente da mensagem e obrigatorio.");
        }
        String valor = remetente.trim().toUpperCase(Locale.ROOT);
        if (!REMETENTES_SUPORTADOS.contains(valor)) {
            throw new IllegalArgumentException("Remetente invalido. Use: " + REMETENTES_SUPORTADOS);
        }
        return valor;
    }

    private int validarPage(int page) {
        if (page < 0) {
            throw new IllegalArgumentException("O parametro page deve ser maior ou igual a zero.");
        }
        return page;
    }

    private int validarSize(int size) {
        if (size <= 0 || size > 100) {
            throw new IllegalArgumentException("O parametro size deve estar entre 1 e 100.");
        }
        return size;
    }

    private String normalizarSortBy(String sortBy) {
        if (sortBy == null || sortBy.isBlank()) {
            return "T.ID_TICKET";
        }
        return CAMPOS_ORDENACAO.getOrDefault(sortBy.trim(), "T.ID_TICKET");
    }

    private String normalizarSortOrder(String sortOrder) {
        if (sortOrder == null || sortOrder.isBlank()) {
            return "ASC";
        }
        String direcao = sortOrder.trim().toUpperCase(Locale.ROOT);
        if (!DIRECOES_ORDENACAO.contains(direcao)) {
            return "ASC";
        }
        return direcao;
    }
}
