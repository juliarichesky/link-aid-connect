package com.turmadobem.service;

import com.turmadobem.entity.Contato;
import com.turmadobem.entity.TransacaoFinanceira;
import com.turmadobem.entity.Usuario;
import com.turmadobem.repository.ContatoRepository;
import com.turmadobem.repository.TransacaoFinanceiraRepository;
import com.turmadobem.repository.UsuarioRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.math.BigDecimal;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@ApplicationScoped
public class TransacaoFinanceiraService {
    private static final Logger LOG = Logger.getLogger(TransacaoFinanceiraService.class);
    private static final Set<String> TIPOS = Set.of("RECEITA", "DESPESA");
    private static final Set<String> STATUS = Set.of("PENDENTE", "PROCESSANDO", "CONCLUIDA", "CANCELADA");

    @Inject
    TransacaoFinanceiraRepository transacaoRepository;

    @Inject
    UsuarioRepository usuarioRepository;

    @Inject
    ContatoRepository contatoRepository;

    public TransacaoFinanceira criar(TransacaoFinanceira transacao) throws SQLException {
        validar(transacao);
        Usuario usuario = buscarUsuario(transacao.getIdUsuario());
        Contato contato = buscarContato(transacao.getIdContato());

        transacao.setIdTransacaoFinanceira(transacaoRepository.nextId());
        transacao.setTipo(normalizarTipo(transacao.getTipo()));
        transacao.setStatus(normalizarStatus(transacao.getStatus()));
        transacao.setCategoria(transacao.getCategoria().trim().toUpperCase(Locale.ROOT));
        transacao.setDescricao(transacao.getDescricao().trim());
        transacao.setUsuario(usuario);
        transacao.setContato(contato);
        TransacaoFinanceira criada = transacaoRepository.create(transacao);
        LOG.infov("Transacao financeira {0} criada para contato {1} com tipo {2}.",
                criada.getIdTransacaoFinanceira(), criada.getIdContato(), criada.getTipo());
        return criada;
    }

    public List<TransacaoFinanceira> listar() throws SQLException {
        return transacaoRepository.findAll();
    }

    public TransacaoFinanceira buscarPorId(int id) throws SQLException {
        return transacaoRepository.findById(id);
    }

    public TransacaoFinanceira atualizar(int id, TransacaoFinanceira transacao) throws SQLException {
        validar(transacao);
        TransacaoFinanceira existente = transacaoRepository.findById(id);
        if (existente == null) {
            return null;
        }
        Usuario usuario = buscarUsuario(transacao.getIdUsuario());
        Contato contato = buscarContato(transacao.getIdContato());

        transacao.setIdTransacaoFinanceira(id);
        transacao.setTipo(normalizarTipo(transacao.getTipo()));
        transacao.setStatus(normalizarStatus(transacao.getStatus()));
        transacao.setCategoria(transacao.getCategoria().trim().toUpperCase(Locale.ROOT));
        transacao.setDescricao(transacao.getDescricao().trim());
        transacao.setUsuario(usuario);
        transacao.setContato(contato);
        return transacaoRepository.update(transacao);
    }

    public void remover(int id) throws SQLException {
        transacaoRepository.delete(id);
    }

    public ResumoFinanceiro resumo() throws SQLException {
        BigDecimal receitas = transacaoRepository.somarPorTipo("RECEITA");
        BigDecimal despesas = transacaoRepository.somarPorTipo("DESPESA");
        BigDecimal saldo = receitas.subtract(despesas);
        return new ResumoFinanceiro(saldo, receitas, despesas);
    }

    private void validar(TransacaoFinanceira transacao) {
        if (transacao == null) {
            throw new IllegalArgumentException("Transacao financeira invalida.");
        }
        normalizarTipo(transacao.getTipo());
        normalizarStatus(transacao.getStatus());
        if (transacao.getValor() == null || transacao.getValor().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("O valor da transacao deve ser maior que zero.");
        }
        if (transacao.getCategoria() == null || transacao.getCategoria().isBlank()) {
            throw new IllegalArgumentException("A categoria e obrigatoria.");
        }
        if (transacao.getDescricao() == null || transacao.getDescricao().isBlank()) {
            throw new IllegalArgumentException("A descricao e obrigatoria.");
        }
        if (transacao.getData() == null || transacao.getData().isAfter(LocalDate.now())) {
            throw new IllegalArgumentException("A data da transacao nao pode estar no futuro.");
        }
        if (transacao.getIdUsuario() == null) {
            throw new IllegalArgumentException("O usuario da transacao e obrigatorio.");
        }
        if (transacao.getIdContato() == null) {
            throw new IllegalArgumentException("O contato da transacao e obrigatorio.");
        }
    }

    private Usuario buscarUsuario(int idUsuario) throws SQLException {
        Usuario usuario = usuarioRepository.findById(idUsuario);
        if (usuario == null) {
            throw new IllegalArgumentException("Usuario nao encontrado.");
        }
        return usuario;
    }

    private Contato buscarContato(int idContato) throws SQLException {
        Contato contato = contatoRepository.findById(idContato);
        if (contato == null) {
            throw new IllegalArgumentException("Contato nao encontrado.");
        }
        return contato;
    }

    private String normalizarTipo(String tipo) {
        if (tipo == null || tipo.isBlank()) {
            throw new IllegalArgumentException("O tipo da transacao e obrigatorio.");
        }
        String valor = tipo.trim().toUpperCase(Locale.ROOT);
        if (!TIPOS.contains(valor)) {
            throw new IllegalArgumentException("Tipo invalido. Use: " + TIPOS);
        }
        return valor;
    }

    private String normalizarStatus(String status) {
        if (status == null || status.isBlank()) {
            throw new IllegalArgumentException("O status da transacao e obrigatorio.");
        }
        String valor = status.trim().toUpperCase(Locale.ROOT);
        if (!STATUS.contains(valor)) {
            throw new IllegalArgumentException("Status invalido. Use: " + STATUS);
        }
        return valor;
    }

    public record ResumoFinanceiro(BigDecimal saldo, BigDecimal receitas, BigDecimal despesas) {
    }
}
