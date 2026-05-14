package com.turmadobem.service;

import com.turmadobem.entity.AgendaDentista;
import com.turmadobem.entity.Dentista;
import com.turmadobem.repository.AgendaDentistaRepository;
import com.turmadobem.repository.DentistaRepository;
import com.turmadobem.repository.TicketRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.sql.SQLException;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@ApplicationScoped
public class DentistaService {
    private static final Set<String> STATUS_DENTISTA = Set.of("ATIVO", "INATIVO", "FERIAS");
    private static final Set<String> STATUS_AGENDA = Set.of("DISPONIVEL", "RESERVADO", "BLOQUEADO", "CONCLUIDO");
    private static final Set<String> DIRECOES_ORDENACAO = Set.of("ASC", "DESC");
    private static final Map<String, String> CAMPOS_ORDENACAO = Map.of(
            "idDentista", "ID_DENTISTA",
            "nome", "NM_DENTISTA",
            "cro", "NR_CRO",
            "especialidade", "ESPECIALIDADE",
            "estado", "SG_ESTADO",
            "status", "STATUS_DENTISTA"
    );

    @Inject
    DentistaRepository dentistaRepository;

    @Inject
    AgendaDentistaRepository agendaDentistaRepository;

    @Inject
    TicketRepository ticketRepository;

    public Dentista criarDentista(Dentista dentista) throws SQLException {
        validarDentista(dentista);
        normalizarDentista(dentista);
        if (dentistaRepository.findByCro(dentista.getCro()) != null) {
            throw new IllegalArgumentException("Ja existe um dentista com este CRO.");
        }
        dentista.setIdDentista(dentistaRepository.nextId());
        Dentista criado = dentistaRepository.create(dentista);
        criado.setAgenda(List.of());
        return criado;
    }

    public List<Dentista> listarDentistas(String especialidade, String estado, String status) throws SQLException {
        List<Dentista> dentistas = dentistaRepository.findAll(especialidade, estado, status);
        preencherAgenda(dentistas);
        return dentistas;
    }

    public List<Dentista> listarDentistas(String especialidade, String estado, String status,
                                          int page, int size, String sortBy, String sortOrder) throws SQLException {
        List<Dentista> dentistas = dentistaRepository.findAll(
                especialidade,
                estado,
                status,
                validarPage(page),
                validarSize(size),
                normalizarSortBy(sortBy),
                normalizarSortOrder(sortOrder)
        );
        preencherAgenda(dentistas);
        return dentistas;
    }

    public Dentista buscarDentistaPorId(int idDentista) throws SQLException {
        Dentista dentista = dentistaRepository.findById(idDentista);
        if (dentista != null) {
            dentista.setAgenda(agendaDentistaRepository.findByDentista(idDentista, null));
        }
        return dentista;
    }

    public Dentista atualizarDentista(int idDentista, Dentista dentista) throws SQLException {
        validarDentista(dentista);
        normalizarDentista(dentista);
        Dentista existente = dentistaRepository.findById(idDentista);
        if (existente == null) {
            return null;
        }
        Dentista porCro = dentistaRepository.findByCro(dentista.getCro());
        if (porCro != null && !porCro.getIdDentista().equals(idDentista)) {
            throw new IllegalArgumentException("Ja existe um dentista com este CRO.");
        }
        dentista.setIdDentista(idDentista);
        Dentista atualizado = dentistaRepository.update(dentista);
        atualizado.setAgenda(agendaDentistaRepository.findByDentista(idDentista, null));
        return atualizado;
    }

    public void removerDentista(int idDentista) throws SQLException {
        if (!ticketRepository.findByDentistaResponsavel(idDentista).isEmpty()) {
            throw new IllegalStateException("Nao e possivel remover um dentista vinculado a tickets.");
        }
        agendaDentistaRepository.deleteByDentista(idDentista);
        dentistaRepository.delete(idDentista);
    }

    public List<AgendaDentista> listarAgenda(int idDentista, String status) throws SQLException {
        Dentista dentista = dentistaRepository.findById(idDentista);
        if (dentista == null) {
            throw new IllegalArgumentException("Dentista nao encontrado.");
        }
        String statusNormalizado = status == null || status.isBlank() ? null : normalizarStatusAgenda(status);
        List<AgendaDentista> agendas = agendaDentistaRepository.findByDentista(idDentista, statusNormalizado);
        for (AgendaDentista agenda : agendas) {
            agenda.setDentista(dentista);
        }
        return agendas;
    }

    public AgendaDentista criarAgenda(int idDentista, AgendaDentista agenda) throws SQLException {
        Dentista dentista = dentistaRepository.findById(idDentista);
        if (dentista == null) {
            throw new IllegalArgumentException("Dentista nao encontrado.");
        }
        validarAgenda(agenda);
        agenda.setIdAgendaDentista(agendaDentistaRepository.nextId());
        agenda.setIdDentista(idDentista);
        agenda.setStatus(normalizarStatusAgenda(agenda.getStatus()));
        agenda.setDentista(dentista);
        return agendaDentistaRepository.create(agenda);
    }

    private void preencherAgenda(List<Dentista> dentistas) throws SQLException {
        for (Dentista dentista : dentistas) {
            dentista.setAgenda(agendaDentistaRepository.findByDentista(dentista.getIdDentista(), null));
        }
    }

    private void validarDentista(Dentista dentista) {
        if (dentista == null) {
            throw new IllegalArgumentException("Dentista invalido.");
        }
        if (dentista.getNome() == null || dentista.getNome().isBlank()) {
            throw new IllegalArgumentException("O nome do dentista e obrigatorio.");
        }
        if (dentista.getCro() == null || dentista.getCro().isBlank()) {
            throw new IllegalArgumentException("O CRO do dentista e obrigatorio.");
        }
        if (dentista.getEspecialidade() == null || dentista.getEspecialidade().isBlank()) {
            throw new IllegalArgumentException("A especialidade e obrigatoria.");
        }
        if (dentista.getEstado() == null || dentista.getEstado().isBlank()) {
            throw new IllegalArgumentException("O estado e obrigatorio.");
        }
        if (dentista.getStatus() == null || dentista.getStatus().isBlank()) {
            throw new IllegalArgumentException("O status do dentista e obrigatorio.");
        }
    }

    private void validarAgenda(AgendaDentista agenda) {
        if (agenda == null) {
            throw new IllegalArgumentException("Agenda invalida.");
        }
        if (agenda.getDataHoraInicio() == null || agenda.getDataHoraFim() == null) {
            throw new IllegalArgumentException("Inicio e fim da agenda sao obrigatorios.");
        }
        if (!agenda.getDataHoraFim().isAfter(agenda.getDataHoraInicio())) {
            throw new IllegalArgumentException("A data final deve ser posterior a data inicial.");
        }
        if (agenda.getStatus() == null || agenda.getStatus().isBlank()) {
            throw new IllegalArgumentException("O status da agenda e obrigatorio.");
        }
    }

    private void normalizarDentista(Dentista dentista) {
        dentista.setNome(normalizarTextoObrigatorio(dentista.getNome(), "O nome do dentista e obrigatorio."));
        dentista.setCro(normalizarTextoObrigatorio(dentista.getCro(), "O CRO do dentista e obrigatorio.").toUpperCase(Locale.ROOT));
        dentista.setEspecialidade(normalizarTextoObrigatorio(dentista.getEspecialidade(), "A especialidade e obrigatoria.").toUpperCase(Locale.ROOT));
        dentista.setEstado(normalizarEstado(dentista.getEstado()));
        dentista.setStatus(normalizarStatusDentista(dentista.getStatus()));
    }

    private String normalizarTextoObrigatorio(String valor, String mensagemErro) {
        if (valor == null || valor.isBlank()) {
            throw new IllegalArgumentException(mensagemErro);
        }
        return valor.trim();
    }

    private String normalizarEstado(String estado) {
        String valor = normalizarTextoObrigatorio(estado, "O estado e obrigatorio.").toUpperCase(Locale.ROOT);
        if (valor.length() != 2) {
            throw new IllegalArgumentException("O estado deve ter 2 letras.");
        }
        return valor;
    }

    private String normalizarStatusDentista(String status) {
        String valor = normalizarTextoObrigatorio(status, "O status do dentista e obrigatorio.").toUpperCase(Locale.ROOT);
        if (!STATUS_DENTISTA.contains(valor)) {
            throw new IllegalArgumentException("Status do dentista invalido. Use: " + STATUS_DENTISTA);
        }
        return valor;
    }

    private String normalizarStatusAgenda(String status) {
        String valor = normalizarTextoObrigatorio(status, "O status da agenda e obrigatorio.").toUpperCase(Locale.ROOT);
        if (!STATUS_AGENDA.contains(valor)) {
            throw new IllegalArgumentException("Status da agenda invalido. Use: " + STATUS_AGENDA);
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
            return "NM_DENTISTA";
        }
        return CAMPOS_ORDENACAO.getOrDefault(sortBy.trim(), "NM_DENTISTA");
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
