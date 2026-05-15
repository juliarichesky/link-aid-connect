package com.turmadobem.bo;

import com.turmadobem.dto.LinkAidDtos;
import com.turmadobem.model.Contato;
import com.turmadobem.model.Dentista;
import com.turmadobem.model.Ticket;
import com.turmadobem.model.TicketMensagem;
import com.turmadobem.model.TicketNotaInterna;
import com.turmadobem.model.Usuario;

import java.util.List;

final class ApiMapper {
    private ApiMapper() {
    }

    static LinkAidDtos.UsuarioResponse usuario(Usuario usuario) {
        if (usuario == null) {
            return null;
        }
        return new LinkAidDtos.UsuarioResponse(
                usuario.getIdUsuario(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getPerfil() == null ? null : usuario.getPerfil().getCodigo(),
                usuario.getStatus()
        );
    }

    static LinkAidDtos.ContatoResponse contato(Contato contato) {
        if (contato == null) {
            return null;
        }
        return new LinkAidDtos.ContatoResponse(
                contato.getIdContato(),
                contato.getNome(),
                contato.getDocumento(),
                contato.getEmail(),
                contato.getTelefone(),
                contato.getTipoContato() == null ? null : contato.getTipoContato().getCodigo(),
                contato.getTipoContato() == null ? null : contato.getTipoContato().getNome(),
                contato.getCidade(),
                contato.getUf(),
                contato.getObservacao(),
                contato.getDataCadastro()
        );
    }

    static LinkAidDtos.DentistaResponse dentista(Dentista dentista) {
        if (dentista == null) {
            return null;
        }
        return new LinkAidDtos.DentistaResponse(
                dentista.getIdDentista(),
                dentista.getNome(),
                dentista.getCro(),
                dentista.getEspecialidade(),
                dentista.getEmail(),
                dentista.getTelefone(),
                dentista.getCidade(),
                dentista.getUf(),
                dentista.getStatus(),
                dentista.getDataCadastro()
        );
    }

    static LinkAidDtos.MensagemResponse mensagem(TicketMensagem mensagem) {
        if (mensagem == null) {
            return null;
        }
        Usuario usuario = mensagem.getUsuario();
        return new LinkAidDtos.MensagemResponse(
                mensagem.getIdMensagem(),
                mensagem.getTicket() == null ? null : mensagem.getTicket().getIdTicket(),
                usuario == null ? null : usuario.getIdUsuario(),
                usuario == null ? null : usuario.getNome(),
                mensagem.getTipoRemetente(),
                mensagem.getMensagem(),
                mensagem.getDataMensagem()
        );
    }

    static LinkAidDtos.NotaInternaResponse notaInterna(TicketNotaInterna notaInterna) {
        if (notaInterna == null) {
            return null;
        }
        Usuario usuario = notaInterna.getUsuario();
        return new LinkAidDtos.NotaInternaResponse(
                notaInterna.getIdNotaInterna(),
                notaInterna.getTicket() == null ? null : notaInterna.getTicket().getIdTicket(),
                usuario == null ? null : usuario.getIdUsuario(),
                usuario == null ? null : usuario.getNome(),
                notaInterna.getNota(),
                notaInterna.getDataNota()
        );
    }

    static LinkAidDtos.TicketResponse ticket(Ticket ticket, List<TicketMensagem> mensagens) {
        if (ticket == null) {
            return null;
        }
        List<LinkAidDtos.MensagemResponse> mensagensResponse = mensagens == null
                ? List.of()
                : mensagens.stream().map(ApiMapper::mensagem).toList();
        return new LinkAidDtos.TicketResponse(
                ticket.getIdTicket(),
                ticket.getProtocolo(),
                contato(ticket.getContato()),
                ticket.getCanal() == null ? null : ticket.getCanal().getCodigo(),
                ticket.getCanal() == null ? null : ticket.getCanal().getNome(),
                ticket.getStatus() == null ? null : ticket.getStatus().getCodigo(),
                ticket.getStatus() == null ? null : ticket.getStatus().getNome(),
                ticket.getPrioridade() == null ? null : ticket.getPrioridade().getCodigo(),
                ticket.getPrioridade() == null ? null : ticket.getPrioridade().getNome(),
                ticket.getClassificacao() == null ? null : ticket.getClassificacao().getCodigo(),
                ticket.getClassificacao() == null ? null : ticket.getClassificacao().getNome(),
                usuario(ticket.getUsuarioResponsavel()),
                dentista(ticket.getDentistaResponsavel()),
                ticket.getAssunto(),
                ticket.getDescricao(),
                ticket.getResumoIa(),
                ticket.getConfiancaIa(),
                ticket.getDataAbertura(),
                ticket.getDataAtualizacao(),
                ticket.getDataFechamento(),
                mensagensResponse
        );
    }
}
