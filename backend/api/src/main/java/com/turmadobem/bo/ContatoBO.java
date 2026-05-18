package com.turmadobem.bo;

import com.turmadobem.dao.ContatoDAO;
import com.turmadobem.dao.TicketDAO;
import com.turmadobem.dao.TipoContatoDAO;
import com.turmadobem.dto.LinkAidDtos;
import com.turmadobem.exception.BusinessException;
import com.turmadobem.exception.NotFoundException;
import com.turmadobem.model.Contato;
import com.turmadobem.model.TipoContato;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@ApplicationScoped
public class ContatoBO {
    @Inject
    ContatoDAO contatoDAO;

    @Inject
    TipoContatoDAO tipoContatoDAO;

    @Inject
    TicketDAO ticketDAO;

    @Transactional(Transactional.TxType.SUPPORTS)
    public List<LinkAidDtos.ContatoResponse> listar() {
        return contatoDAO.listarOrdenado().stream().map(ApiMapper::contato).toList();
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public LinkAidDtos.ContatoResponse buscar(Long id) {
        return ApiMapper.contato(buscarEntidade(id));
    }

    @Transactional
    public LinkAidDtos.ContatoResponse criar(LinkAidDtos.ContatoRequest request) {
        Contato contato = new Contato();
        preencher(contato, request);
        contato.setDataCadastro(LocalDateTime.now());
        contatoDAO.persist(contato);
        return ApiMapper.contato(contato);
    }

    @Transactional
    public LinkAidDtos.ContatoResponse atualizar(Long id, LinkAidDtos.ContatoRequest request) {
        Contato contato = buscarEntidade(id);
        preencher(contato, request);
        return ApiMapper.contato(contato);
    }

    @Transactional
    public void remover(Long id) {
        Contato contato = buscarEntidade(id);
        long tickets = ticketDAO.count("contato.idContato = ?1", id);
        if (tickets > 0) {
            throw new BusinessException("Nao e possivel remover contato com tickets vinculados.");
        }
        contatoDAO.delete(contato);
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public LinkAidDtos.HistoricoContatoResponse historico(Long id) {
        Contato contato = buscarEntidade(id);
        var tickets = ticketDAO.listarPorContato(id).stream()
                .map(ticket -> ApiMapper.ticket(ticket, List.of()))
                .toList();
        return new LinkAidDtos.HistoricoContatoResponse(ApiMapper.contato(contato), tickets);
    }

    Contato criarOuAtualizarContatoBasico(Long idContato, String nome, String documento, String email, String telefone,
                                          String tipoContatoCodigo, String cidade, String uf, String observacao) {
        if (idContato != null) {
            return buscarEntidade(idContato);
        }

        String docNormalizado = normalizarDocumento(documento);
        Contato contato = docNormalizado == null ? null : contatoDAO.buscarPorDocumento(docNormalizado);
        if (contato == null && telefone != null && !telefone.isBlank()) {
            contato = contatoDAO.buscarPorTelefone(telefone.trim());
        }
        boolean novoContato = contato == null;
        if (novoContato) {
            contato = new Contato();
            contato.setDataCadastro(LocalDateTime.now());
        }

        contato.setNome(textoOuPadrao(nome, "Contato sem nome"));
        contato.setDocumento(docNormalizado);
        contato.setEmail(normalizarEmail(email));
        contato.setTelefone(normalizarTexto(telefone));
        contato.setTipoContato(buscarTipo(tipoContatoCodigo == null ? "SOLICITANTE" : tipoContatoCodigo));
        contato.setCidade(normalizarTexto(cidade));
        contato.setUf(normalizarUf(uf));
        contato.setObservacao(normalizarTexto(observacao));
        if (novoContato) {
            contatoDAO.persist(contato);
        }
        return contato;
    }

    private void preencher(Contato contato, LinkAidDtos.ContatoRequest request) {
        String documento = normalizarDocumento(request.documento());
        if (documento != null) {
            Contato existente = contatoDAO.buscarPorDocumento(documento);
            if (existente != null && !existente.getIdContato().equals(contato.getIdContato())) {
                throw new BusinessException("Ja existe um contato com este documento.");
            }
        }
        contato.setNome(normalizarObrigatorio(request.nome(), "Nome do contato e obrigatorio."));
        contato.setDocumento(documento);
        contato.setEmail(normalizarEmail(request.email()));
        contato.setTelefone(normalizarTexto(request.telefone()));
        contato.setTipoContato(buscarTipo(request.tipoContatoCodigo()));
        contato.setCidade(normalizarTexto(request.cidade()));
        contato.setUf(normalizarUf(request.uf()));
        contato.setObservacao(normalizarTexto(request.observacao()));
    }

    private Contato buscarEntidade(Long id) {
        Contato contato = contatoDAO.findById(id);
        if (contato == null) {
            throw new NotFoundException("Contato nao encontrado.");
        }
        return contato;
    }

    private TipoContato buscarTipo(String codigo) {
        TipoContato tipo = tipoContatoDAO.buscarPorCodigo(codigo);
        if (tipo == null) {
            throw new BusinessException("Tipo de contato invalido.");
        }
        return tipo;
    }

    private String normalizarObrigatorio(String valor, String mensagem) {
        String texto = normalizarTexto(valor);
        if (texto == null) {
            throw new BusinessException(mensagem);
        }
        return texto;
    }

    private String textoOuPadrao(String valor, String padrao) {
        String texto = normalizarTexto(valor);
        return texto == null ? padrao : texto;
    }

    private String normalizarTexto(String valor) {
        return valor == null || valor.isBlank() ? null : valor.trim();
    }

    private String normalizarEmail(String email) {
        return email == null || email.isBlank() ? null : email.trim().toLowerCase();
    }

    private String normalizarDocumento(String documento) {
        if (documento == null || documento.isBlank()) {
            return null;
        }
        return documento.replaceAll("\\D", "");
    }

    private String normalizarUf(String uf) {
        return uf == null || uf.isBlank() ? null : uf.trim().toUpperCase().substring(0, Math.min(2, uf.trim().length()));
    }
}
