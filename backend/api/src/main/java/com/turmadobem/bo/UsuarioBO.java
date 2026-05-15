package com.turmadobem.bo;

import com.turmadobem.dao.UsuarioDAO;
import com.turmadobem.dto.LinkAidDtos;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.util.List;

@ApplicationScoped
public class UsuarioBO {
    @Inject
    UsuarioDAO usuarioDAO;

    @Transactional(Transactional.TxType.SUPPORTS)
    public List<LinkAidDtos.UsuarioResponse> listar(boolean apenasAtivos) {
        return usuarioDAO.listarOrdenado(apenasAtivos).stream()
                .map(ApiMapper::usuario)
                .toList();
    }
}
