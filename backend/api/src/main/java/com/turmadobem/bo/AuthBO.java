package com.turmadobem.bo;

import com.turmadobem.dao.UsuarioDAO;
import com.turmadobem.dto.LinkAidDtos;
import com.turmadobem.exception.BusinessException;
import com.turmadobem.exception.ForbiddenException;
import com.turmadobem.model.Usuario;
import com.turmadobem.security.AuthSessionService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class AuthBO {
    @Inject
    UsuarioDAO usuarioDAO;

    @Inject
    AuthSessionService authSessionService;

    @Transactional(Transactional.TxType.SUPPORTS)
    public LinkAidDtos.LoginResponse login(LinkAidDtos.LoginRequest request) {
        String senha = request.senhaInformada();
        if (senha == null || senha.isBlank()) {
            throw new BusinessException("Senha obrigatoria.");
        }

        Usuario usuario = usuarioDAO.buscarPorEmail(request.email());
        if (usuario == null || usuario.getSenha() == null || !usuario.getSenha().equals(senha)) {
            throw new BusinessException("Credenciais invalidas.");
        }
        if (!usuario.isAtivo()) {
            throw new ForbiddenException("Usuario inativo.");
        }

        String token = authSessionService.createSession(usuario);
        return new LinkAidDtos.LoginResponse(
                token,
                usuario.getIdUsuario(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getPerfil().getCodigo()
        );
    }

    public LinkAidDtos.UsuarioResponse me(Usuario usuario) {
        if (usuario == null) {
            throw new ForbiddenException("Usuario autenticado nao encontrado.");
        }
        return ApiMapper.usuario(usuario);
    }
}
