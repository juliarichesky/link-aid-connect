package com.turmadobem.service;

import com.turmadobem.entity.Contato;
import com.turmadobem.repository.ContatoRepository;
import com.turmadobem.repository.TicketRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.sql.SQLException;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@ApplicationScoped
public class ContatoService {
    private static final Logger LOG = Logger.getLogger(ContatoService.class);
    private static final Set<String> CANAIS_SUPORTADOS = Set.of("WHATSAPP", "EMAIL", "CHAT", "TELEFONE", "INSTAGRAM", "TELEGRAM");
    private static final Set<String> DIRECOES_ORDENACAO = Set.of("ASC", "DESC");
    private static final Map<String, String> CAMPOS_ORDENACAO = Map.of(
            "idContato", "ID_CONTATO",
            "nome", "NM_CONTATO",
            "documento", "DOC_CONTATO",
            "email", "EMAIL_CONTATO",
            "canalOrigem", "CANAL_ORIGEM"
    );

    @Inject
    ContatoRepository contatoRepository;

    @Inject
    TicketRepository ticketRepository;

    public Contato criarContato(Contato contato) throws SQLException {
        validarContato(contato);
        normalizarContato(contato);
        if (contatoRepository.findByDocumento(contato.getDocumento()) != null) {
            throw new IllegalArgumentException("Ja existe um contato com este documento.");
        }
        contato.setIdContato(contatoRepository.nextId());
        Contato criado = contatoRepository.create(contato);
        criado.setTickets(List.of());
        LOG.infov("Contato {0} criado com canal {1}.", criado.getIdContato(), criado.getCanalOrigem());
        return criado;
    }

    public List<Contato> listarContatos() throws SQLException {
        List<Contato> contatos = contatoRepository.findAll();
        preencherTickets(contatos);
        return contatos;
    }

    public List<Contato> listarContatos(int page, int size, String sortBy, String sortOrder) throws SQLException {
        List<Contato> contatos = contatoRepository.findAll(
                validarPage(page),
                validarSize(size),
                normalizarSortBy(sortBy),
                normalizarSortOrder(sortOrder)
        );
        preencherTickets(contatos);
        return contatos;
    }

    public Contato buscarContatoPorId(int idContato) throws SQLException {
        Contato contato = contatoRepository.findById(idContato);
        if (contato != null) {
            contato.setTickets(ticketRepository.findAll(idContato, null));
        }
        return contato;
    }

    public Contato atualizarContato(int idContato, Contato contato) throws SQLException {
        validarContato(contato);
        normalizarContato(contato);
        Contato existente = contatoRepository.findById(idContato);
        if (existente == null) {
            return null;
        }
        Contato porDocumento = contatoRepository.findByDocumento(contato.getDocumento());
        if (porDocumento != null && !porDocumento.getIdContato().equals(idContato)) {
            throw new IllegalArgumentException("Ja existe um contato com este documento.");
        }
        contato.setIdContato(idContato);
        Contato atualizado = contatoRepository.update(contato);
        atualizado.setTickets(ticketRepository.findAll(idContato, null));
        return atualizado;
    }

    public void removerContato(int idContato) throws SQLException {
        if (!ticketRepository.findAll(idContato, null).isEmpty()) {
            throw new IllegalStateException("Nao e possivel remover um contato com tickets vinculados.");
        }
        contatoRepository.delete(idContato);
    }

    private void preencherTickets(List<Contato> contatos) throws SQLException {
        for (Contato contato : contatos) {
            contato.setTickets(ticketRepository.findAll(contato.getIdContato(), null));
        }
    }

    private void validarContato(Contato contato) {
        if (contato == null) {
            throw new IllegalArgumentException("Contato invalido.");
        }
        if (contato.getNome() == null || contato.getNome().isBlank()) {
            throw new IllegalArgumentException("O nome do contato e obrigatorio.");
        }
        if (contato.getDocumento() == null || contato.getDocumento().isBlank()) {
            throw new IllegalArgumentException("O documento do contato e obrigatorio.");
        }
        if (contato.getEmail() == null || contato.getEmail().isBlank()) {
            throw new IllegalArgumentException("O email do contato deve ser valido.");
        }
        if (contato.getTelefone() == null || contato.getTelefone().isBlank()) {
            throw new IllegalArgumentException("O telefone do contato e obrigatorio.");
        }
        normalizarCanal(contato.getCanalOrigem());
    }

    private void normalizarContato(Contato contato) {
        contato.setNome(normalizarTextoObrigatorio(contato.getNome(), "O nome do contato e obrigatorio."));
        contato.setDocumento(normalizarTextoObrigatorio(contato.getDocumento(), "O documento do contato e obrigatorio."));
        contato.setEmail(normalizarEmail(contato.getEmail()));
        contato.setTelefone(normalizarTextoObrigatorio(contato.getTelefone(), "O telefone do contato e obrigatorio."));
        contato.setCanalOrigem(normalizarCanal(contato.getCanalOrigem()));
    }

    private String normalizarTextoObrigatorio(String valor, String mensagemErro) {
        if (valor == null || valor.isBlank()) {
            throw new IllegalArgumentException(mensagemErro);
        }
        return valor.trim();
    }

    private String normalizarEmail(String email) {
        String valor = normalizarTextoObrigatorio(email, "O email do contato deve ser valido.").toLowerCase(Locale.ROOT);
        if (!valor.contains("@")) {
            throw new IllegalArgumentException("O email do contato deve ser valido.");
        }
        return valor;
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
            return "ID_CONTATO";
        }
        return CAMPOS_ORDENACAO.getOrDefault(sortBy.trim(), "ID_CONTATO");
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
