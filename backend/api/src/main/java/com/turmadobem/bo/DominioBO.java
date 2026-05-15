package com.turmadobem.bo;

import com.turmadobem.dao.CanalDAO;
import com.turmadobem.dao.ClassificacaoDAO;
import com.turmadobem.dao.PrioridadeDAO;
import com.turmadobem.dao.StatusTicketDAO;
import com.turmadobem.dao.TipoContatoDAO;
import com.turmadobem.dto.LinkAidDtos;
import com.turmadobem.model.Canal;
import com.turmadobem.model.Classificacao;
import com.turmadobem.model.Prioridade;
import com.turmadobem.model.StatusTicket;
import com.turmadobem.model.TipoContato;
import io.quarkus.panache.common.Sort;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.util.List;

@ApplicationScoped
public class DominioBO {
    @Inject
    TipoContatoDAO tipoContatoDAO;

    @Inject
    CanalDAO canalDAO;

    @Inject
    StatusTicketDAO statusTicketDAO;

    @Inject
    PrioridadeDAO prioridadeDAO;

    @Inject
    ClassificacaoDAO classificacaoDAO;

    @Transactional(Transactional.TxType.SUPPORTS)
    public LinkAidDtos.DominiosResponse listar() {
        return new LinkAidDtos.DominiosResponse(
                listarTiposContato(),
                listarCanais(),
                listarStatusTicket(),
                listarPrioridades(),
                listarClassificacoes()
        );
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public List<LinkAidDtos.DominioItemResponse> listarTiposContato() {
        return tipoContatoDAO.listAll(Sort.ascending("nome")).stream()
                .map(this::tipoContato)
                .toList();
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public List<LinkAidDtos.DominioItemResponse> listarCanais() {
        return canalDAO.listAll(Sort.ascending("nome")).stream()
                .map(this::canal)
                .toList();
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public List<LinkAidDtos.DominioItemResponse> listarStatusTicket() {
        return statusTicketDAO.listAll(Sort.ascending("nome")).stream()
                .map(this::statusTicket)
                .toList();
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public List<LinkAidDtos.DominioItemResponse> listarPrioridades() {
        return prioridadeDAO.listAll(Sort.ascending("ordem")).stream()
                .map(this::prioridade)
                .toList();
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public List<LinkAidDtos.DominioItemResponse> listarClassificacoes() {
        return classificacaoDAO.listAll(Sort.ascending("nome")).stream()
                .map(this::classificacao)
                .toList();
    }

    private LinkAidDtos.DominioItemResponse tipoContato(TipoContato tipoContato) {
        return new LinkAidDtos.DominioItemResponse(tipoContato.getCodigo(), tipoContato.getNome(), null);
    }

    private LinkAidDtos.DominioItemResponse canal(Canal canal) {
        return new LinkAidDtos.DominioItemResponse(canal.getCodigo(), canal.getNome(), null);
    }

    private LinkAidDtos.DominioItemResponse statusTicket(StatusTicket statusTicket) {
        return new LinkAidDtos.DominioItemResponse(statusTicket.getCodigo(), statusTicket.getNome(), null);
    }

    private LinkAidDtos.DominioItemResponse prioridade(Prioridade prioridade) {
        return new LinkAidDtos.DominioItemResponse(
                prioridade.getCodigo(),
                prioridade.getNome(),
                prioridade.getOrdem()
        );
    }

    private LinkAidDtos.DominioItemResponse classificacao(Classificacao classificacao) {
        return new LinkAidDtos.DominioItemResponse(classificacao.getCodigo(), classificacao.getNome(), null);
    }
}
