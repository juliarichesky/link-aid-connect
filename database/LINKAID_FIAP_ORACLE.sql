-- LINKAID - MVP BANCA
-- Script Oracle SQL para criacao do banco de dados do MVP.
-- Objetivo do MVP:
-- 1. login admin/colaborador
-- 2. criar ticket
-- 3. abrir ticket
-- 4. alterar status
-- 5. atribuir responsavel
-- 6. adicionar mensagem
-- 7. cadastrar dentista
-- 8. visualizar contato/historico
-- 9. dashboard com dados reais
-- 10. Watson/sandbox criando ticket no banco

-- ============================================================
-- DROP TABLES
-- Ordem: tabelas filhas primeiro, tabelas fortes por ultimo.
-- Os blocos abaixo ignoram erro ORA-00942 caso a tabela nao exista.
-- ============================================================

BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE T_LKA_WEBHOOK_EVENTO CASCADE CONSTRAINTS';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -942 THEN RAISE; END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE T_LKA_TICKET_NOTA_INTERNA CASCADE CONSTRAINTS';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -942 THEN RAISE; END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE T_LKA_TICKET_MENSAGEM CASCADE CONSTRAINTS';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -942 THEN RAISE; END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE T_LKA_TRIAGEM CASCADE CONSTRAINTS';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -942 THEN RAISE; END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE T_LKA_TICKET CASCADE CONSTRAINTS';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -942 THEN RAISE; END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE T_LKA_AGENDA_DENTISTA CASCADE CONSTRAINTS';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -942 THEN RAISE; END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE T_LKA_DENTISTA CASCADE CONSTRAINTS';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -942 THEN RAISE; END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE T_LKA_CONTATO CASCADE CONSTRAINTS';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -942 THEN RAISE; END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE T_LKA_USUARIO CASCADE CONSTRAINTS';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -942 THEN RAISE; END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE T_LKA_CLASSIFICACAO CASCADE CONSTRAINTS';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -942 THEN RAISE; END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE T_LKA_PRIORIDADE CASCADE CONSTRAINTS';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -942 THEN RAISE; END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE T_LKA_STATUS_TICKET CASCADE CONSTRAINTS';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -942 THEN RAISE; END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE T_LKA_CANAL CASCADE CONSTRAINTS';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -942 THEN RAISE; END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE T_LKA_TIPO_CONTATO CASCADE CONSTRAINTS';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -942 THEN RAISE; END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE T_LKA_PERFIL CASCADE CONSTRAINTS';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -942 THEN RAISE; END IF;
END;
/

-- ============================================================
-- TABELAS DE DOMINIO
-- Mantem padronizacao de valores usados pela API e pelo dashboard.
-- ============================================================

CREATE TABLE T_LKA_PERFIL (
    id_perfil       NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cd_perfil       VARCHAR2(30) NOT NULL,
    nm_perfil       VARCHAR2(60) NOT NULL,
    CONSTRAINT uk_lka_perfil_cd UNIQUE (cd_perfil),
    CONSTRAINT chk_lka_perfil_cd CHECK (cd_perfil IN ('ADMIN', 'COLABORADOR'))
);

CREATE TABLE T_LKA_TIPO_CONTATO (
    id_tipo_contato NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cd_tipo_contato VARCHAR2(30) NOT NULL,
    nm_tipo_contato VARCHAR2(60) NOT NULL,
    CONSTRAINT uk_lka_tipo_contato_cd UNIQUE (cd_tipo_contato)
);

CREATE TABLE T_LKA_CANAL (
    id_canal        NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cd_canal        VARCHAR2(30) NOT NULL,
    nm_canal        VARCHAR2(60) NOT NULL,
    CONSTRAINT uk_lka_canal_cd UNIQUE (cd_canal)
);

CREATE TABLE T_LKA_STATUS_TICKET (
    id_status       NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cd_status       VARCHAR2(40) NOT NULL,
    nm_status       VARCHAR2(80) NOT NULL,
    CONSTRAINT uk_lka_status_cd UNIQUE (cd_status)
);

CREATE TABLE T_LKA_PRIORIDADE (
    id_prioridade   NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cd_prioridade   VARCHAR2(20) NOT NULL,
    nm_prioridade   VARCHAR2(40) NOT NULL,
    nr_ordem        NUMBER(1) NOT NULL,
    CONSTRAINT uk_lka_prioridade_cd UNIQUE (cd_prioridade),
    CONSTRAINT chk_lka_prioridade_ordem CHECK (nr_ordem BETWEEN 1 AND 4)
);

CREATE TABLE T_LKA_CLASSIFICACAO (
    id_classificacao NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cd_classificacao VARCHAR2(40) NOT NULL,
    nm_classificacao VARCHAR2(80) NOT NULL,
    CONSTRAINT uk_lka_classificacao_cd UNIQUE (cd_classificacao)
);

-- ============================================================
-- USUARIOS
-- Senha em texto apenas para MVP didatico. Em producao, salvar hash.
-- ============================================================

CREATE TABLE T_LKA_USUARIO (
    id_usuario      NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_perfil       NUMBER NOT NULL,
    nm_usuario      VARCHAR2(100) NOT NULL,
    email_usuario   VARCHAR2(120) NOT NULL,
    senha_usuario   VARCHAR2(255) NOT NULL,
    st_usuario      CHAR(1) DEFAULT 'A' NOT NULL,
    dt_criacao      TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT uk_lka_usuario_email UNIQUE (email_usuario),
    CONSTRAINT chk_lka_usuario_status CHECK (st_usuario IN ('A', 'I')),
    CONSTRAINT fk_lka_usuario_perfil FOREIGN KEY (id_perfil)
        REFERENCES T_LKA_PERFIL (id_perfil)
);

-- ============================================================
-- CONTATOS
-- Representa beneficiarios, doadores, parceiros, dentistas voluntarios etc.
-- O documento pode ser CPF ou CNPJ. Ele fica opcional para contatos
-- vindos do WhatsApp que ainda nao informaram CPF/CNPJ.
-- ============================================================

CREATE TABLE T_LKA_CONTATO (
    id_contato        NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_tipo_contato   NUMBER NOT NULL,
    nm_contato        VARCHAR2(120) NOT NULL,
    doc_contato       VARCHAR2(20),
    email_contato     VARCHAR2(120),
    tel_contato       VARCHAR2(25),
    nm_cidade         VARCHAR2(80),
    sg_uf             CHAR(2),
    ds_observacao     CLOB,
    dt_cadastro       TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT uk_lka_contato_doc UNIQUE (doc_contato),
    CONSTRAINT fk_lka_contato_tipo FOREIGN KEY (id_tipo_contato)
        REFERENCES T_LKA_TIPO_CONTATO (id_tipo_contato)
);

-- ============================================================
-- DENTISTAS E AGENDA
-- Necessario para cadastro de dentista e atribuicao clinica.
-- ============================================================

CREATE TABLE T_LKA_DENTISTA (
    id_dentista       NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nm_dentista       VARCHAR2(120) NOT NULL,
    nr_cro            VARCHAR2(30) NOT NULL,
    ds_especialidade  VARCHAR2(80) NOT NULL,
    email_dentista    VARCHAR2(120),
    tel_dentista      VARCHAR2(25),
    nm_cidade         VARCHAR2(80),
    sg_uf             CHAR(2),
    st_dentista       CHAR(1) DEFAULT 'A' NOT NULL,
    dt_cadastro       TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT uk_lka_dentista_cro UNIQUE (nr_cro),
    CONSTRAINT chk_lka_dentista_status CHECK (st_dentista IN ('A', 'I', 'F'))
);

CREATE TABLE T_LKA_AGENDA_DENTISTA (
    id_agenda_dentista NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_dentista        NUMBER NOT NULL,
    dt_hora_inicio     TIMESTAMP NOT NULL,
    dt_hora_fim        TIMESTAMP NOT NULL,
    st_agenda          VARCHAR2(20) DEFAULT 'DISPONIVEL' NOT NULL,
    ds_observacao      VARCHAR2(300),
    CONSTRAINT chk_lka_agenda_status CHECK (st_agenda IN ('DISPONIVEL', 'RESERVADO', 'CANCELADO')),
    CONSTRAINT chk_lka_agenda_periodo CHECK (dt_hora_fim > dt_hora_inicio),
    CONSTRAINT fk_lka_agenda_dentista FOREIGN KEY (id_dentista)
        REFERENCES T_LKA_DENTISTA (id_dentista)
);

-- ============================================================
-- TICKETS
-- Central do MVP. Um ticket nasce de um contato e pode ser atribuido
-- a um colaborador/admin e, opcionalmente, a um dentista.
-- ============================================================

CREATE TABLE T_LKA_TICKET (
    id_ticket                 NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nr_protocolo              VARCHAR2(40) NOT NULL,
    id_contato                NUMBER NOT NULL,
    id_canal                  NUMBER NOT NULL,
    id_status                 NUMBER NOT NULL,
    id_prioridade             NUMBER NOT NULL,
    id_classificacao          NUMBER,
    id_usuario_responsavel    NUMBER,
    id_dentista_responsavel   NUMBER,
    ds_assunto                VARCHAR2(150) NOT NULL,
    ds_ticket                 CLOB NOT NULL,
    ds_resumo_ia              CLOB,
    vl_confianca_ia           NUMBER(5,2),
    dt_abertura               TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    dt_atualizacao            TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    dt_fechamento             TIMESTAMP,
    CONSTRAINT uk_lka_ticket_protocolo UNIQUE (nr_protocolo),
    CONSTRAINT chk_lka_ticket_ia CHECK (vl_confianca_ia IS NULL OR vl_confianca_ia BETWEEN 0 AND 100),
    CONSTRAINT fk_lka_ticket_contato FOREIGN KEY (id_contato)
        REFERENCES T_LKA_CONTATO (id_contato),
    CONSTRAINT fk_lka_ticket_canal FOREIGN KEY (id_canal)
        REFERENCES T_LKA_CANAL (id_canal),
    CONSTRAINT fk_lka_ticket_status FOREIGN KEY (id_status)
        REFERENCES T_LKA_STATUS_TICKET (id_status),
    CONSTRAINT fk_lka_ticket_prioridade FOREIGN KEY (id_prioridade)
        REFERENCES T_LKA_PRIORIDADE (id_prioridade),
    CONSTRAINT fk_lka_ticket_classificacao FOREIGN KEY (id_classificacao)
        REFERENCES T_LKA_CLASSIFICACAO (id_classificacao),
    CONSTRAINT fk_lka_ticket_usuario_resp FOREIGN KEY (id_usuario_responsavel)
        REFERENCES T_LKA_USUARIO (id_usuario),
    CONSTRAINT fk_lka_ticket_dentista_resp FOREIGN KEY (id_dentista_responsavel)
        REFERENCES T_LKA_DENTISTA (id_dentista)
);

CREATE TABLE T_LKA_TICKET_MENSAGEM (
    id_mensagem      NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_ticket        NUMBER NOT NULL,
    id_usuario       NUMBER,
    tp_remetente     VARCHAR2(20) NOT NULL,
    ds_mensagem      CLOB NOT NULL,
    dt_mensagem      TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT chk_lka_msg_remetente CHECK (tp_remetente IN ('CONTATO', 'ATENDENTE', 'SISTEMA', 'IA')),
    CONSTRAINT fk_lka_msg_ticket FOREIGN KEY (id_ticket)
        REFERENCES T_LKA_TICKET (id_ticket),
    CONSTRAINT fk_lka_msg_usuario FOREIGN KEY (id_usuario)
        REFERENCES T_LKA_USUARIO (id_usuario)
);

CREATE TABLE T_LKA_TICKET_NOTA_INTERNA (
    id_nota_interna  NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_ticket        NUMBER NOT NULL,
    id_usuario       NUMBER NOT NULL,
    ds_nota          CLOB NOT NULL,
    dt_nota          TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT fk_lka_nota_ticket FOREIGN KEY (id_ticket)
        REFERENCES T_LKA_TICKET (id_ticket),
    CONSTRAINT fk_lka_nota_usuario FOREIGN KEY (id_usuario)
        REFERENCES T_LKA_USUARIO (id_usuario)
);

-- ============================================================
-- TRIAGEM
-- Suporta o fluxo "agendar triagem" depois do atendimento humano.
-- ============================================================

CREATE TABLE T_LKA_TRIAGEM (
    id_triagem              NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_ticket               NUMBER NOT NULL,
    id_contato              NUMBER NOT NULL,
    id_usuario_responsavel  NUMBER NOT NULL,
    id_dentista             NUMBER,
    dt_hora_triagem         TIMESTAMP,
    st_triagem              VARCHAR2(20) DEFAULT 'PENDENTE' NOT NULL,
    ds_triagem              CLOB,
    CONSTRAINT chk_lka_triagem_status CHECK (st_triagem IN ('PENDENTE', 'AGENDADA', 'REALIZADA', 'CANCELADA')),
    CONSTRAINT fk_lka_triagem_ticket FOREIGN KEY (id_ticket)
        REFERENCES T_LKA_TICKET (id_ticket),
    CONSTRAINT fk_lka_triagem_contato FOREIGN KEY (id_contato)
        REFERENCES T_LKA_CONTATO (id_contato),
    CONSTRAINT fk_lka_triagem_usuario FOREIGN KEY (id_usuario_responsavel)
        REFERENCES T_LKA_USUARIO (id_usuario),
    CONSTRAINT fk_lka_triagem_dentista FOREIGN KEY (id_dentista)
        REFERENCES T_LKA_DENTISTA (id_dentista)
);

-- ============================================================
-- WEBHOOK / WATSON / SANDBOX
-- Mantem rastreabilidade do evento recebido do Watson, Twilio ou sandbox.
-- A API Python/Quarkus pode gravar o payload bruto aqui e linkar ao ticket.
-- ============================================================

CREATE TABLE T_LKA_WEBHOOK_EVENTO (
    id_webhook_evento NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_ticket         NUMBER,
    ds_origem         VARCHAR2(40) NOT NULL,
    ds_external_id    VARCHAR2(120),
    ds_payload        CLOB NOT NULL,
    st_processamento  VARCHAR2(20) DEFAULT 'RECEBIDO' NOT NULL,
    ds_erro           VARCHAR2(500),
    dt_recebimento    TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT chk_lka_webhook_status CHECK (st_processamento IN ('RECEBIDO', 'PROCESSADO', 'ERRO')),
    CONSTRAINT fk_lka_webhook_ticket FOREIGN KEY (id_ticket)
        REFERENCES T_LKA_TICKET (id_ticket)
);

-- ============================================================
-- INSERTS DE DOMINIO
-- ============================================================

INSERT INTO T_LKA_PERFIL (cd_perfil, nm_perfil)
VALUES ('ADMIN', 'Administrador');

INSERT INTO T_LKA_PERFIL (cd_perfil, nm_perfil)
VALUES ('COLABORADOR', 'Colaborador');

INSERT INTO T_LKA_TIPO_CONTATO (cd_tipo_contato, nm_tipo_contato)
VALUES ('BENEFICIARIO', 'Beneficiario');

INSERT INTO T_LKA_TIPO_CONTATO (cd_tipo_contato, nm_tipo_contato)
VALUES ('DOADOR', 'Doador');

INSERT INTO T_LKA_TIPO_CONTATO (cd_tipo_contato, nm_tipo_contato)
VALUES ('PARCEIRO', 'Parceiro');

INSERT INTO T_LKA_TIPO_CONTATO (cd_tipo_contato, nm_tipo_contato)
VALUES ('VOLUNTARIO', 'Dentista voluntario');

INSERT INTO T_LKA_TIPO_CONTATO (cd_tipo_contato, nm_tipo_contato)
VALUES ('ORGANIZACAO', 'Organizacao');

INSERT INTO T_LKA_CANAL (cd_canal, nm_canal)
VALUES ('WHATSAPP', 'WhatsApp');

INSERT INTO T_LKA_CANAL (cd_canal, nm_canal)
VALUES ('EMAIL', 'E-mail');

INSERT INTO T_LKA_CANAL (cd_canal, nm_canal)
VALUES ('INSTAGRAM', 'Instagram');

INSERT INTO T_LKA_CANAL (cd_canal, nm_canal)
VALUES ('TELEFONE', 'Telefone');

INSERT INTO T_LKA_CANAL (cd_canal, nm_canal)
VALUES ('MANUAL', 'Cadastro manual');

INSERT INTO T_LKA_CANAL (cd_canal, nm_canal)
VALUES ('WATSON_SANDBOX', 'Watson Sandbox');

INSERT INTO T_LKA_STATUS_TICKET (cd_status, nm_status)
VALUES ('NOVO', 'Novo');

INSERT INTO T_LKA_STATUS_TICKET (cd_status, nm_status)
VALUES ('ABERTO', 'Aberto');

INSERT INTO T_LKA_STATUS_TICKET (cd_status, nm_status)
VALUES ('EM_ATENDIMENTO', 'Em atendimento');

INSERT INTO T_LKA_STATUS_TICKET (cd_status, nm_status)
VALUES ('AGUARDANDO_TRIAGEM', 'Aguardando triagem');

INSERT INTO T_LKA_STATUS_TICKET (cd_status, nm_status)
VALUES ('AGUARDANDO_CLIENTE', 'Aguardando cliente');

INSERT INTO T_LKA_STATUS_TICKET (cd_status, nm_status)
VALUES ('RESOLVIDO', 'Resolvido');

INSERT INTO T_LKA_STATUS_TICKET (cd_status, nm_status)
VALUES ('CANCELADO', 'Cancelado');

INSERT INTO T_LKA_STATUS_TICKET (cd_status, nm_status)
VALUES ('ARQUIVADO', 'Arquivado');

INSERT INTO T_LKA_PRIORIDADE (cd_prioridade, nm_prioridade, nr_ordem)
VALUES ('BAIXA', 'Baixa', 1);

INSERT INTO T_LKA_PRIORIDADE (cd_prioridade, nm_prioridade, nr_ordem)
VALUES ('MEDIA', 'Media', 2);

INSERT INTO T_LKA_PRIORIDADE (cd_prioridade, nm_prioridade, nr_ordem)
VALUES ('ALTA', 'Alta', 3);

INSERT INTO T_LKA_PRIORIDADE (cd_prioridade, nm_prioridade, nr_ordem)
VALUES ('CRITICA', 'Critica', 4);

INSERT INTO T_LKA_CLASSIFICACAO (cd_classificacao, nm_classificacao)
VALUES ('SAUDE', 'Saude');

INSERT INTO T_LKA_CLASSIFICACAO (cd_classificacao, nm_classificacao)
VALUES ('EMERGENCIA', 'Emergencia');

INSERT INTO T_LKA_CLASSIFICACAO (cd_classificacao, nm_classificacao)
VALUES ('AGENDAMENTO', 'Agendamento');

INSERT INTO T_LKA_CLASSIFICACAO (cd_classificacao, nm_classificacao)
VALUES ('DOACAO', 'Doacao');

INSERT INTO T_LKA_CLASSIFICACAO (cd_classificacao, nm_classificacao)
VALUES ('PARCERIA', 'Parceria');

INSERT INTO T_LKA_CLASSIFICACAO (cd_classificacao, nm_classificacao)
VALUES ('VOLUNTARIADO', 'Voluntariado odontologico');

INSERT INTO T_LKA_CLASSIFICACAO (cd_classificacao, nm_classificacao)
VALUES ('FEEDBACK', 'Feedback');

INSERT INTO T_LKA_CLASSIFICACAO (cd_classificacao, nm_classificacao)
VALUES ('GERAL', 'Geral');

-- ============================================================
-- INSERTS DE DEMONSTRACAO
-- Usuarios usados pelo login da banca.
-- ============================================================

INSERT INTO T_LKA_USUARIO (id_perfil, nm_usuario, email_usuario, senha_usuario)
VALUES (
    (SELECT id_perfil FROM T_LKA_PERFIL WHERE cd_perfil = 'ADMIN'),
    'Ana Costa',
    'admin@linkaid.com',
    'admin123'
);

INSERT INTO T_LKA_USUARIO (id_perfil, nm_usuario, email_usuario, senha_usuario)
VALUES (
    (SELECT id_perfil FROM T_LKA_PERFIL WHERE cd_perfil = 'COLABORADOR'),
    'Carlos Silva',
    'colab@linkaid.com',
    'colab123'
);

INSERT INTO T_LKA_CONTATO (
    id_tipo_contato, nm_contato, doc_contato, email_contato, tel_contato, nm_cidade, sg_uf, ds_observacao
) VALUES (
    (SELECT id_tipo_contato FROM T_LKA_TIPO_CONTATO WHERE cd_tipo_contato = 'BENEFICIARIO'),
    'Maria Oliveira',
    '12345678900',
    'maria@email.com',
    '+5511999990000',
    'Sao Paulo',
    'SP',
    'Beneficiaria solicitando informacoes sobre tratamento odontologico.'
);

INSERT INTO T_LKA_CONTATO (
    id_tipo_contato, nm_contato, doc_contato, email_contato, tel_contato, nm_cidade, sg_uf, ds_observacao
) VALUES (
    (SELECT id_tipo_contato FROM T_LKA_TIPO_CONTATO WHERE cd_tipo_contato = 'PARCEIRO'),
    'Instituto Sorria',
    '12345678000100',
    'contato@sorria.org',
    '+552133334444',
    'Rio de Janeiro',
    'RJ',
    'Organizacao parceira interessada em proposta conjunta.'
);

INSERT INTO T_LKA_CONTATO (
    id_tipo_contato, nm_contato, doc_contato, email_contato, tel_contato, nm_cidade, sg_uf, ds_observacao
) VALUES (
    (SELECT id_tipo_contato FROM T_LKA_TIPO_CONTATO WHERE cd_tipo_contato = 'BENEFICIARIO'),
    'Pedro Almeida',
    '55566677788',
    'pedro.a@email.com',
    '+5531955556666',
    'Belo Horizonte',
    'MG',
    'Contato recebido via sandbox com relato de dor aguda.'
);

INSERT INTO T_LKA_DENTISTA (
    nm_dentista, nr_cro, ds_especialidade, email_dentista, tel_dentista, nm_cidade, sg_uf
) VALUES (
    'Dra. Fernanda Costa',
    'CRO-SP-12345',
    'Ortodontia',
    'fernanda@dentista.com',
    '+5511977776666',
    'Sao Paulo',
    'SP'
);

INSERT INTO T_LKA_DENTISTA (
    nm_dentista, nr_cro, ds_especialidade, email_dentista, tel_dentista, nm_cidade, sg_uf
) VALUES (
    'Dr. Marcos Lima',
    'CRO-MG-22222',
    'Cirurgia',
    'marcos@dentista.com',
    '+5531944443333',
    'Belo Horizonte',
    'MG'
);

INSERT INTO T_LKA_AGENDA_DENTISTA (
    id_dentista, dt_hora_inicio, dt_hora_fim, st_agenda, ds_observacao
) VALUES (
    (SELECT id_dentista FROM T_LKA_DENTISTA WHERE nr_cro = 'CRO-SP-12345'),
    TO_TIMESTAMP('2026-05-18 09:00', 'YYYY-MM-DD HH24:MI'),
    TO_TIMESTAMP('2026-05-18 12:00', 'YYYY-MM-DD HH24:MI'),
    'DISPONIVEL',
    'Horario reservado para triagens da semana.'
);

INSERT INTO T_LKA_TICKET (
    nr_protocolo, id_contato, id_canal, id_status, id_prioridade, id_classificacao,
    id_usuario_responsavel, id_dentista_responsavel, ds_assunto, ds_ticket,
    ds_resumo_ia, vl_confianca_ia, dt_abertura, dt_atualizacao
) VALUES (
    'TKT-20260514-001',
    (SELECT id_contato FROM T_LKA_CONTATO WHERE doc_contato = '12345678900'),
    (SELECT id_canal FROM T_LKA_CANAL WHERE cd_canal = 'WHATSAPP'),
    (SELECT id_status FROM T_LKA_STATUS_TICKET WHERE cd_status = 'EM_ATENDIMENTO'),
    (SELECT id_prioridade FROM T_LKA_PRIORIDADE WHERE cd_prioridade = 'ALTA'),
    (SELECT id_classificacao FROM T_LKA_CLASSIFICACAO WHERE cd_classificacao = 'SAUDE'),
    (SELECT id_usuario FROM T_LKA_USUARIO WHERE email_usuario = 'colab@linkaid.com'),
    (SELECT id_dentista FROM T_LKA_DENTISTA WHERE nr_cro = 'CRO-SP-12345'),
    'Duvida sobre tratamento odontologico',
    'Beneficiaria quer entender como funciona o atendimento odontologico gratuito.',
    'Beneficiaria buscando informacoes sobre tratamento gratuito.',
    92.50,
    TO_TIMESTAMP('2026-05-14 09:00', 'YYYY-MM-DD HH24:MI'),
    TO_TIMESTAMP('2026-05-14 09:15', 'YYYY-MM-DD HH24:MI')
);

INSERT INTO T_LKA_TICKET (
    nr_protocolo, id_contato, id_canal, id_status, id_prioridade, id_classificacao,
    id_usuario_responsavel, ds_assunto, ds_ticket, ds_resumo_ia, vl_confianca_ia,
    dt_abertura, dt_atualizacao
) VALUES (
    'TKT-20260514-002',
    (SELECT id_contato FROM T_LKA_CONTATO WHERE doc_contato = '12345678000100'),
    (SELECT id_canal FROM T_LKA_CANAL WHERE cd_canal = 'EMAIL'),
    (SELECT id_status FROM T_LKA_STATUS_TICKET WHERE cd_status = 'ABERTO'),
    (SELECT id_prioridade FROM T_LKA_PRIORIDADE WHERE cd_prioridade = 'MEDIA'),
    (SELECT id_classificacao FROM T_LKA_CLASSIFICACAO WHERE cd_classificacao = 'PARCERIA'),
    (SELECT id_usuario FROM T_LKA_USUARIO WHERE email_usuario = 'admin@linkaid.com'),
    'Proposta de parceria',
    'Instituto Sorria entrou em contato para propor parceria com a ONG.',
    'Contato institucional com interesse em parceria.',
    88.00,
    TO_TIMESTAMP('2026-05-14 10:30', 'YYYY-MM-DD HH24:MI'),
    TO_TIMESTAMP('2026-05-14 10:30', 'YYYY-MM-DD HH24:MI')
);

INSERT INTO T_LKA_TICKET (
    nr_protocolo, id_contato, id_canal, id_status, id_prioridade, id_classificacao,
    ds_assunto, ds_ticket, ds_resumo_ia, vl_confianca_ia, dt_abertura, dt_atualizacao
) VALUES (
    'TKT-20260514-003',
    (SELECT id_contato FROM T_LKA_CONTATO WHERE doc_contato = '55566677788'),
    (SELECT id_canal FROM T_LKA_CANAL WHERE cd_canal = 'WATSON_SANDBOX'),
    (SELECT id_status FROM T_LKA_STATUS_TICKET WHERE cd_status = 'NOVO'),
    (SELECT id_prioridade FROM T_LKA_PRIORIDADE WHERE cd_prioridade = 'CRITICA'),
    (SELECT id_classificacao FROM T_LKA_CLASSIFICACAO WHERE cd_classificacao = 'EMERGENCIA'),
    'Dor de dente aguda',
    'Mensagem recebida pelo Watson/sandbox: estou com muita dor de dente e preciso de ajuda.',
    'Possivel emergencia odontologica. Encaminhar para fila humana com prioridade critica.',
    96.00,
    TO_TIMESTAMP('2026-05-14 11:05', 'YYYY-MM-DD HH24:MI'),
    TO_TIMESTAMP('2026-05-14 11:05', 'YYYY-MM-DD HH24:MI')
);

INSERT INTO T_LKA_TICKET_MENSAGEM (id_ticket, tp_remetente, ds_mensagem, dt_mensagem)
VALUES (
    (SELECT id_ticket FROM T_LKA_TICKET WHERE nr_protocolo = 'TKT-20260514-001'),
    'CONTATO',
    'Ola, gostaria de saber sobre tratamento odontologico gratuito.',
    TO_TIMESTAMP('2026-05-14 09:00', 'YYYY-MM-DD HH24:MI')
);

INSERT INTO T_LKA_TICKET_MENSAGEM (id_ticket, tp_remetente, ds_mensagem, dt_mensagem)
VALUES (
    (SELECT id_ticket FROM T_LKA_TICKET WHERE nr_protocolo = 'TKT-20260514-001'),
    'IA',
    'Classificacao automatica: SAUDE. Prioridade: ALTA.',
    TO_TIMESTAMP('2026-05-14 09:01', 'YYYY-MM-DD HH24:MI')
);

INSERT INTO T_LKA_TICKET_MENSAGEM (id_ticket, id_usuario, tp_remetente, ds_mensagem, dt_mensagem)
VALUES (
    (SELECT id_ticket FROM T_LKA_TICKET WHERE nr_protocolo = 'TKT-20260514-001'),
    (SELECT id_usuario FROM T_LKA_USUARIO WHERE email_usuario = 'colab@linkaid.com'),
    'ATENDENTE',
    'Ola, Maria. Vamos verificar seu caso e orientar os proximos passos.',
    TO_TIMESTAMP('2026-05-14 09:15', 'YYYY-MM-DD HH24:MI')
);

INSERT INTO T_LKA_WEBHOOK_EVENTO (
    id_ticket, ds_origem, ds_external_id, ds_payload, st_processamento, dt_recebimento
) VALUES (
    (SELECT id_ticket FROM T_LKA_TICKET WHERE nr_protocolo = 'TKT-20260514-003'),
    'WATSON_SANDBOX',
    'SANDBOX-MSG-0001',
    '{"from":"+5531955556666","body":"estou com muita dor de dente e preciso de ajuda","intent":"emergencia","priority":"CRITICA"}',
    'PROCESSADO',
    TO_TIMESTAMP('2026-05-14 11:05', 'YYYY-MM-DD HH24:MI')
);

COMMIT;

-- ============================================================
-- CONSULTAS DE VALIDACAO
-- Podem ser executadas no SQL Developer para conferir o MVP.
-- ============================================================

SELECT U.nm_usuario, U.email_usuario, P.cd_perfil, U.st_usuario
FROM T_LKA_USUARIO U
INNER JOIN T_LKA_PERFIL P ON P.id_perfil = U.id_perfil
ORDER BY U.id_usuario;

SELECT
    T.nr_protocolo,
    C.nm_contato,
    CA.cd_canal,
    ST.cd_status,
    PR.cd_prioridade,
    CL.cd_classificacao,
    U.nm_usuario AS responsavel
FROM T_LKA_TICKET T
INNER JOIN T_LKA_CONTATO C ON C.id_contato = T.id_contato
INNER JOIN T_LKA_CANAL CA ON CA.id_canal = T.id_canal
INNER JOIN T_LKA_STATUS_TICKET ST ON ST.id_status = T.id_status
INNER JOIN T_LKA_PRIORIDADE PR ON PR.id_prioridade = T.id_prioridade
LEFT JOIN T_LKA_CLASSIFICACAO CL ON CL.id_classificacao = T.id_classificacao
LEFT JOIN T_LKA_USUARIO U ON U.id_usuario = T.id_usuario_responsavel
ORDER BY T.dt_abertura DESC;

SELECT ST.cd_status, COUNT(T.id_ticket) AS total_tickets
FROM T_LKA_STATUS_TICKET ST
LEFT JOIN T_LKA_TICKET T ON T.id_status = ST.id_status
GROUP BY ST.cd_status
ORDER BY ST.cd_status;

SELECT CA.cd_canal, COUNT(T.id_ticket) AS total_tickets
FROM T_LKA_CANAL CA
LEFT JOIN T_LKA_TICKET T ON T.id_canal = CA.id_canal
GROUP BY CA.cd_canal
ORDER BY CA.cd_canal;

SELECT T.nr_protocolo, M.tp_remetente, M.ds_mensagem, M.dt_mensagem
FROM T_LKA_TICKET T
INNER JOIN T_LKA_TICKET_MENSAGEM M ON M.id_ticket = T.id_ticket
WHERE T.nr_protocolo = 'TKT-20260514-001'
ORDER BY M.dt_mensagem;
