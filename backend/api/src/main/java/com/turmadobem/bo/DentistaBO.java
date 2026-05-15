package com.turmadobem.bo;

import com.turmadobem.dao.DentistaDAO;
import com.turmadobem.dao.TicketDAO;
import com.turmadobem.dto.LinkAidDtos;
import com.turmadobem.exception.BusinessException;
import com.turmadobem.exception.NotFoundException;
import com.turmadobem.model.Dentista;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@ApplicationScoped
public class DentistaBO {
    private static final Set<String> STATUS_VALIDOS = Set.of("A", "I", "F");

    @Inject
    DentistaDAO dentistaDAO;

    @Inject
    TicketDAO ticketDAO;

    @Transactional(Transactional.TxType.SUPPORTS)
    public List<LinkAidDtos.DentistaResponse> listar() {
        return dentistaDAO.listarOrdenado().stream().map(ApiMapper::dentista).toList();
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public LinkAidDtos.DentistaResponse buscar(Long id) {
        return ApiMapper.dentista(buscarEntidade(id));
    }

    @Transactional
    public LinkAidDtos.DentistaResponse criar(LinkAidDtos.DentistaRequest request) {
        Dentista dentista = new Dentista();
        preencher(dentista, request);
        dentista.setDataCadastro(LocalDateTime.now());
        dentistaDAO.persist(dentista);
        return ApiMapper.dentista(dentista);
    }

    @Transactional
    public LinkAidDtos.DentistaResponse atualizar(Long id, LinkAidDtos.DentistaRequest request) {
        Dentista dentista = buscarEntidade(id);
        preencher(dentista, request);
        return ApiMapper.dentista(dentista);
    }

    @Transactional
    public void remover(Long id) {
        Dentista dentista = buscarEntidade(id);
        long tickets = ticketDAO.count("dentistaResponsavel.idDentista = ?1", id);
        if (tickets > 0) {
            throw new BusinessException("Nao e possivel remover dentista com tickets vinculados. Marque como inativo.");
        }
        dentistaDAO.delete(dentista);
    }

    Dentista buscarDentistaAtivo(Long id) {
        if (id == null) {
            return null;
        }
        Dentista dentista = buscarEntidade(id);
        if (!dentista.isAtivo()) {
            throw new BusinessException("Dentista informado nao esta ativo.");
        }
        return dentista;
    }

    private void preencher(Dentista dentista, LinkAidDtos.DentistaRequest request) {
        String cro = normalizarObrigatorio(request.cro(), "CRO do dentista e obrigatorio.").toUpperCase();
        Dentista existente = dentistaDAO.buscarPorCro(cro);
        if (existente != null && !existente.getIdDentista().equals(dentista.getIdDentista())) {
            throw new BusinessException("Ja existe dentista cadastrado com este CRO.");
        }

        dentista.setNome(normalizarObrigatorio(request.nome(), "Nome do dentista e obrigatorio."));
        dentista.setCro(cro);
        dentista.setEspecialidade(normalizarObrigatorio(request.especialidade(), "Especialidade e obrigatoria."));
        dentista.setEmail(normalizarEmail(request.email()));
        dentista.setTelefone(normalizarTexto(request.telefone()));
        dentista.setCidade(normalizarTexto(request.cidade()));
        dentista.setUf(normalizarUf(request.uf()));
        dentista.setStatus(normalizarStatus(request.status()));
    }

    private Dentista buscarEntidade(Long id) {
        Dentista dentista = dentistaDAO.findById(id);
        if (dentista == null) {
            throw new NotFoundException("Dentista nao encontrado.");
        }
        return dentista;
    }

    private String normalizarStatus(String status) {
        String valor = status == null || status.isBlank() ? "A" : status.trim().toUpperCase();
        if (!STATUS_VALIDOS.contains(valor)) {
            throw new BusinessException("Status do dentista deve ser A, I ou F.");
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

    private String normalizarEmail(String email) {
        return email == null || email.isBlank() ? null : email.trim().toLowerCase();
    }

    private String normalizarUf(String uf) {
        return uf == null || uf.isBlank() ? null : uf.trim().toUpperCase().substring(0, Math.min(2, uf.trim().length()));
    }
}
