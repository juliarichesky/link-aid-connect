package com.turmadobem.bo;

import com.turmadobem.dao.CanalDAO;
import com.turmadobem.dao.ClassificacaoDAO;
import com.turmadobem.dao.PrioridadeDAO;
import com.turmadobem.dao.StatusTicketDAO;
import com.turmadobem.dao.TicketDAO;
import com.turmadobem.dao.TicketMensagemDAO;
import com.turmadobem.dao.UsuarioDAO;
import com.turmadobem.dto.LinkAidDtos;
import com.turmadobem.exception.BusinessException;
import com.turmadobem.exception.NotFoundException;
import com.turmadobem.model.Canal;
import com.turmadobem.model.Classificacao;
import com.turmadobem.model.Contato;
import com.turmadobem.model.Dentista;
import com.turmadobem.model.Prioridade;
import com.turmadobem.model.StatusTicket;
import com.turmadobem.model.Ticket;
import com.turmadobem.model.TicketMensagem;
import com.turmadobem.model.Usuario;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@ApplicationScoped
public class TicketBO {
    private static final Set<String> REMETENTES_VALIDOS = Set.of("CONTATO", "ATENDENTE", "SISTEMA", "IA");
    private static final Set<String> STATUS_FINAIS = Set.of("RESOLVIDO", "CANCELADO", "ARQUIVADO");

    @Inject
    TicketDAO ticketDAO;

    @Inject
    TicketMensagemDAO mensagemDAO;

    @Inject
    ContatoBO contatoBO;

    @Inject
    DentistaBO dentistaBO;

    @Inject
    UsuarioDAO usuarioDAO;

    @Inject
    CanalDAO canalDAO;

    @Inject
    StatusTicketDAO statusTicketDAO;

    @Inject
    PrioridadeDAO prioridadeDAO;

    @Inject
    ClassificacaoDAO classificacaoDAO;

    @Transactional(Transactional.TxType.SUPPORTS)
    public List<LinkAidDtos.TicketResponse> listar(String status, String canal, Long responsavelId, int page, int size) {
        return ticketDAO.pesquisar(status, canal, responsavelId, page, size).stream()
                .map(ticket -> ApiMapper.ticket(ticket, List.of()))
                .toList();
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public LinkAidDtos.TicketResponse buscar(Long id) {
        Ticket ticket = buscarEntidade(id);
        return ApiMapper.ticket(ticket, mensagemDAO.listarPorTicket(id));
    }

    @Transactional
    public LinkAidDtos.TicketResponse criar(LinkAidDtos.TicketRequest request) {
        Ticket ticket = criarEntidade(request);
        return ApiMapper.ticket(ticket, mensagemDAO.listarPorTicket(ticket.getIdTicket()));
    }

    @Transactional
    public LinkAidDtos.TicketResponse atualizar(Long id, LinkAidDtos.TicketUpdateRequest request) {
        Ticket ticket = buscarEntidade(id);

        if (request.canalCodigo() != null) {
            ticket.setCanal(buscarCanal(request.canalCodigo()));
        }
        if (request.statusCodigo() != null) {
            aplicarStatus(ticket, request.statusCodigo());
        }
        if (request.prioridadeCodigo() != null) {
            ticket.setPrioridade(buscarPrioridade(request.prioridadeCodigo()));
        }
        if (request.classificacaoCodigo() != null) {
            ticket.setClassificacao(buscarClassificacao(request.classificacaoCodigo()));
        }
        if (request.idUsuarioResponsavel() != null) {
            ticket.setUsuarioResponsavel(buscarUsuarioAtivo(request.idUsuarioResponsavel()));
        }
        if (request.idDentistaResponsavel() != null) {
            ticket.setDentistaResponsavel(dentistaBO.buscarDentistaAtivo(request.idDentistaResponsavel()));
        }
        if (request.assunto() != null && !request.assunto().isBlank()) {
            ticket.setAssunto(request.assunto().trim());
        }
        if (request.descricao() != null && !request.descricao().isBlank()) {
            ticket.setDescricao(request.descricao().trim());
        }
        if (request.resumoIa() != null) {
            ticket.setResumoIa(request.resumoIa().trim());
        }
        if (request.confiancaIa() != null) {
            ticket.setConfiancaIa(request.confiancaIa());
        }
        ticket.setDataAtualizacao(LocalDateTime.now());
        return ApiMapper.ticket(ticket, mensagemDAO.listarPorTicket(id));
    }

    @Transactional
    public LinkAidDtos.TicketResponse atualizarStatus(Long id, String statusCodigo) {
        Ticket ticket = buscarEntidade(id);
        aplicarStatus(ticket, statusCodigo);
        ticket.setDataAtualizacao(LocalDateTime.now());
        return ApiMapper.ticket(ticket, mensagemDAO.listarPorTicket(id));
    }

    @Transactional
    public LinkAidDtos.TicketResponse atribuirResponsavel(Long id, Long idUsuarioResponsavel) {
        Ticket ticket = buscarEntidade(id);
        ticket.setUsuarioResponsavel(buscarUsuarioAtivo(idUsuarioResponsavel));
        if ("NOVO".equals(ticket.getStatus().getCodigo()) || "ABERTO".equals(ticket.getStatus().getCodigo())) {
            ticket.setStatus(buscarStatus("EM_ATENDIMENTO"));
        }
        ticket.setDataAtualizacao(LocalDateTime.now());
        return ApiMapper.ticket(ticket, mensagemDAO.listarPorTicket(id));
    }

    @Transactional
    public LinkAidDtos.TicketResponse arquivar(Long id) {
        return atualizarStatus(id, "ARQUIVADO");
    }

    @Transactional
    public LinkAidDtos.MensagemResponse adicionarMensagem(Long idTicket, LinkAidDtos.MensagemRequest request,
                                                          Long idUsuarioPadrao) {
        Ticket ticket = buscarEntidade(idTicket);
        Usuario usuario = resolverUsuarioMensagem(request, idUsuarioPadrao);
        TicketMensagem mensagem = registrarMensagem(ticket, request.tipoRemetente(), request.mensagem(), usuario);
        return ApiMapper.mensagem(mensagem);
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public List<LinkAidDtos.MensagemResponse> listarMensagens(Long idTicket) {
        buscarEntidade(idTicket);
        return mensagemDAO.listarPorTicket(idTicket).stream().map(ApiMapper::mensagem).toList();
    }

    Ticket criarEntidade(LinkAidDtos.TicketRequest request) {
        Contato contato = contatoBO.criarOuAtualizarContatoBasico(
                request.idContato(),
                request.nomeContato(),
                request.documentoContato(),
                request.emailContato(),
                request.telefoneContato(),
                request.tipoContatoCodigo(),
                request.cidadeContato(),
                request.ufContato(),
                null
        );
        Canal canal = buscarCanal(request.canalCodigo());
        Prioridade prioridade = buscarPrioridade(request.prioridadeCodigo());
        Classificacao classificacao = request.classificacaoCodigo() == null
                ? buscarClassificacao("GERAL")
                : buscarClassificacao(request.classificacaoCodigo());
        Usuario responsavel = request.idUsuarioResponsavel() == null
                ? null
                : buscarUsuarioAtivo(request.idUsuarioResponsavel());
        Dentista dentista = request.idDentistaResponsavel() == null
                ? null
                : dentistaBO.buscarDentistaAtivo(request.idDentistaResponsavel());

        LocalDateTime agora = LocalDateTime.now();
        Ticket ticket = new Ticket();
        ticket.setProtocolo("TMP-" + UUID.randomUUID());
        ticket.setContato(contato);
        ticket.setCanal(canal);
        ticket.setStatus(buscarStatus(responsavel == null ? "NOVO" : "EM_ATENDIMENTO"));
        ticket.setPrioridade(prioridade);
        ticket.setClassificacao(classificacao);
        ticket.setUsuarioResponsavel(responsavel);
        ticket.setDentistaResponsavel(dentista);
        ticket.setAssunto(normalizarObrigatorio(request.assunto(), "Assunto do ticket e obrigatorio."));
        ticket.setDescricao(normalizarObrigatorio(request.descricao(), "Descricao do ticket e obrigatoria."));
        ticket.setResumoIa(normalizarTexto(request.resumoIa()));
        ticket.setConfiancaIa(request.confiancaIa());
        ticket.setDataAbertura(agora);
        ticket.setDataAtualizacao(agora);

        ticketDAO.persist(ticket);
        ticketDAO.flush();
        ticket.setProtocolo(gerarProtocolo(ticket.getIdTicket(), agora));
        return ticket;
    }

    TicketMensagem registrarMensagem(Ticket ticket, String tipoRemetente, String texto, Usuario usuario) {
        String tipo = normalizarRemetente(tipoRemetente);
        if ("ATENDENTE".equals(tipo) && usuario == null) {
            throw new BusinessException("Mensagem de atendente precisa estar vinculada a um usuario.");
        }
        TicketMensagem mensagem = new TicketMensagem();
        mensagem.setTicket(ticket);
        mensagem.setUsuario(usuario);
        mensagem.setTipoRemetente(tipo);
        mensagem.setMensagem(normalizarObrigatorio(texto, "Mensagem obrigatoria."));
        mensagem.setDataMensagem(LocalDateTime.now());
        mensagemDAO.persist(mensagem);

        ticket.setDataAtualizacao(mensagem.getDataMensagem());
        return mensagem;
    }

    Ticket buscarEntidade(Long id) {
        Ticket ticket = ticketDAO.findById(id);
        if (ticket == null) {
            throw new NotFoundException("Ticket nao encontrado.");
        }
        return ticket;
    }

    Usuario buscarUsuarioAtivo(Long idUsuario) {
        Usuario usuario = usuarioDAO.findById(idUsuario);
        if (usuario == null) {
            throw new BusinessException("Usuario responsavel nao encontrado.");
        }
        if (!usuario.isAtivo()) {
            throw new BusinessException("Usuario responsavel nao esta ativo.");
        }
        return usuario;
    }

    private Usuario resolverUsuarioMensagem(LinkAidDtos.MensagemRequest request, Long idUsuarioPadrao) {
        Long idUsuario = request.idUsuario() == null ? idUsuarioPadrao : request.idUsuario();
        if (idUsuario == null) {
            return null;
        }
        return buscarUsuarioAtivo(idUsuario);
    }

    private void aplicarStatus(Ticket ticket, String statusCodigo) {
        StatusTicket status = buscarStatus(statusCodigo);
        ticket.setStatus(status);
        if (STATUS_FINAIS.contains(status.getCodigo())) {
            ticket.setDataFechamento(LocalDateTime.now());
        } else {
            ticket.setDataFechamento(null);
        }
    }

    private Canal buscarCanal(String codigo) {
        Canal canal = canalDAO.buscarPorCodigo(codigo);
        if (canal == null) {
            throw new BusinessException("Canal invalido.");
        }
        return canal;
    }

    private StatusTicket buscarStatus(String codigo) {
        StatusTicket status = statusTicketDAO.buscarPorCodigo(codigo);
        if (status == null) {
            throw new BusinessException("Status de ticket invalido.");
        }
        return status;
    }

    private Prioridade buscarPrioridade(String codigo) {
        Prioridade prioridade = prioridadeDAO.buscarPorCodigo(codigo);
        if (prioridade == null) {
            throw new BusinessException("Prioridade invalida.");
        }
        return prioridade;
    }

    private Classificacao buscarClassificacao(String codigo) {
        Classificacao classificacao = classificacaoDAO.buscarPorCodigo(codigo);
        if (classificacao == null) {
            throw new BusinessException("Classificacao invalida.");
        }
        return classificacao;
    }

    private String gerarProtocolo(Long idTicket, LocalDateTime dataHora) {
        return "TKT-" + dataHora.format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmm")) + "-" + idTicket;
    }

    private String normalizarRemetente(String remetente) {
        String valor = normalizarObrigatorio(remetente, "Tipo do remetente e obrigatorio.").toUpperCase();
        if (!REMETENTES_VALIDOS.contains(valor)) {
            throw new BusinessException("Tipo de remetente invalido.");
        }
        return valor;
    }

    private String normalizarObrigatorio(String valor, String mensagem) {
        String texto = normalizarTexto(valor);
        if (texto == null) {
            throw new BusinessException(mensagem);
        }
        return texto;
    }

    private String normalizarTexto(String valor) {
        return valor == null || valor.isBlank() ? null : valor.trim();
    }
}
