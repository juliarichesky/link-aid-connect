package com.turmadobem.teste;

import com.turmadobem.entity.Contato;
import com.turmadobem.entity.Ticket;
import com.turmadobem.entity.TransacaoFinanceira;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.Random;
import java.util.Set;

public class TicketsTeste {
    private static final Random random = new Random();

    private static final Set<String> CANAIS_SUPORTADOS = Set.of(
            "WHATSAPP", "EMAIL", "CHAT", "TELEFONE", "INSTAGRAM", "TELEGRAM"
    );

    public static void abrir(BancoSimulado banco) {
        System.out.println("\n==============================================");
        System.out.println(" MODULO DE TICKETS");
        System.out.println("==============================================");

        String canalOrigem = selecionarCanal();
        String motivoContato = selecionarMotivoContato();

        if ("VOLTAR".equals(motivoContato)) {
            return;
        }

        Contato contato;
        TransacaoFinanceira transacaoFinanceira = null;
        DadosVoluntario dadosVoluntario = null;
        DadosComplementares dadosComplementares = null;

        switch (motivoContato) {
            case "BENEFICIARIO" -> contato = coletarDadosPessoaFisica(canalOrigem, "BENEFICIARIO");

            case "DOACAO" -> {
                CadastroDoacao cadastroDoacao = coletarDadosDoacao(canalOrigem);
                contato = cadastroDoacao.contato();
                dadosComplementares = cadastroDoacao.dadosComplementares();
                transacaoFinanceira = cadastroDoacao.transacaoFinanceira();
            }

            case "VOLUNTARIO" -> {
                contato = coletarDadosPessoaFisica(canalOrigem, "VOLUNTARIO");
                dadosVoluntario = coletarDadosVoluntario();
            }

            case "EMPRESA_PARCEIRO" -> {
                CadastroParceiro cadastroParceiro = coletarDadosEmpresaParceiro(canalOrigem);
                contato = cadastroParceiro.contato();
                dadosComplementares = cadastroParceiro.dadosComplementares();
            }

            default -> throw new IllegalArgumentException("Motivo invalido.");
        }

        String assunto = ConsoleUtils.lerTextoObrigatorio("\nDigite o assunto do atendimento: ");
        String mensagemUsuario = ConsoleUtils.lerTextoObrigatorio("Digite a mensagem/solicitacao da pessoa: ");

        Ticket ticket = gerarTicket(contato, motivoContato, assunto, mensagemUsuario);

        banco.adicionarContato(contato);
        banco.adicionarTicket(ticket);

        if (transacaoFinanceira != null) {
            banco.adicionarTransacao(transacaoFinanceira);
        }

        imprimirResumoAtendimento(
                contato,
                ticket,
                transacaoFinanceira,
                dadosVoluntario,
                dadosComplementares
        );
    }

    private static String selecionarCanal() {
        System.out.println("\nPor qual meio de comunicacao a pessoa entrou em contato?");
        System.out.println("1 - WhatsApp");
        System.out.println("2 - E-mail");
        System.out.println("3 - Chat");
        System.out.println("4 - Telefone");
        System.out.println("5 - Instagram");
        System.out.println("6 - Telegram");

        int opcao = ConsoleUtils.lerOpcao("\nEscolha uma opcao: ", 1, 6);

        return switch (opcao) {
            case 1 -> "WHATSAPP";
            case 2 -> "EMAIL";
            case 3 -> "CHAT";
            case 4 -> "TELEFONE";
            case 5 -> "INSTAGRAM";
            case 6 -> "TELEGRAM";
            default -> throw new IllegalArgumentException("Canal invalido.");
        };
    }

    private static String selecionarMotivoContato() {
        System.out.println("\nQual e o motivo do contato?");
        System.out.println("1 - Beneficiario");
        System.out.println("2 - Doacao");
        System.out.println("3 - Voluntario");
        System.out.println("4 - Empresa/Parceiro");
        System.out.println("5 - Voltar ao menu anterior");

        int opcao = ConsoleUtils.lerOpcao("\nEscolha uma opcao: ", 1, 5);

        return switch (opcao) {
            case 1 -> "BENEFICIARIO";
            case 2 -> "DOACAO";
            case 3 -> "VOLUNTARIO";
            case 4 -> "EMPRESA_PARCEIRO";
            case 5 -> "VOLTAR";
            default -> throw new IllegalArgumentException("Motivo invalido.");
        };
    }

    private static Contato coletarDadosPessoaFisica(String canalOrigem, String tipoContato) {
        System.out.println("\n=== DADOS DO " + tipoContato + " ===");

        Contato contato = new Contato();
        contato.setIdContato(gerarIdAleatorio());
        contato.setNome(ConsoleUtils.lerTextoObrigatorio("Nome completo: "));
        contato.setDocumento(ConsoleUtils.lerTextoObrigatorio("CPF: "));
        contato.setEmail(ConsoleUtils.lerEmail("E-mail: "));
        contato.setTelefone(ConsoleUtils.lerTextoObrigatorio("Telefone: "));
        contato.setCanalOrigem(normalizarCanal(canalOrigem));

        return contato;
    }

    private static CadastroDoacao coletarDadosDoacao(String canalOrigem) {
        System.out.println("\n=== TIPO DE DOADOR ===");
        System.out.println("1 - Pessoa fisica");
        System.out.println("2 - Pessoa juridica");

        int opcao = ConsoleUtils.lerOpcao("\nEscolha uma opcao: ", 1, 2);

        Contato contato = new Contato();
        contato.setIdContato(gerarIdAleatorio());
        contato.setCanalOrigem(normalizarCanal(canalOrigem));

        DadosComplementares dadosComplementares;

        if (opcao == 1) {
            System.out.println("\n=== DADOS DO DOADOR - PESSOA FISICA ===");

            contato.setNome(ConsoleUtils.lerTextoObrigatorio("Nome completo: "));
            contato.setDocumento(ConsoleUtils.lerTextoObrigatorio("CPF: "));
            contato.setEmail(ConsoleUtils.lerEmail("E-mail: "));
            contato.setTelefone(ConsoleUtils.lerTextoObrigatorio("Telefone: "));

            dadosComplementares = new DadosComplementares("PESSOA_FISICA", null);
        } else {
            System.out.println("\n=== DADOS DO DOADOR - PESSOA JURIDICA ===");

            contato.setNome(ConsoleUtils.lerTextoObrigatorio("Razao social / Nome da empresa: "));
            contato.setDocumento(ConsoleUtils.lerTextoObrigatorio("CNPJ: "));
            String representante = ConsoleUtils.lerTextoObrigatorio("Nome do representante: ");
            contato.setEmail(ConsoleUtils.lerEmail("E-mail corporativo: "));
            contato.setTelefone(ConsoleUtils.lerTextoObrigatorio("Telefone: "));

            dadosComplementares = new DadosComplementares("PESSOA_JURIDICA", representante);
        }

        BigDecimal valor = ConsoleUtils.lerValorMonetario("Valor da doacao: ");

        TransacaoFinanceira transacao = new TransacaoFinanceira();
        transacao.setIdTransacaoFinanceira(gerarIdAleatorio());
        transacao.setTipo("RECEITA");
        transacao.setValor(valor);
        transacao.setStatus("CONCLUIDA");
        transacao.setCategoria("DOACAO");
        transacao.setDescricao("Doacao registrada por simulacao da Sprint 3.");
        transacao.setData(LocalDate.now());
        transacao.setIdUsuario(1);
        transacao.setContato(contato);

        return new CadastroDoacao(contato, dadosComplementares, transacao);
    }

    private static DadosVoluntario coletarDadosVoluntario() {
        System.out.println("\n=== DADOS PROFISSIONAIS DO VOLUNTARIO ===");

        String cro = ConsoleUtils.lerTextoObrigatorio("CRO: ").toUpperCase(Locale.ROOT);
        String especialidade = ConsoleUtils.lerTextoObrigatorio("Especialidade: ").toUpperCase(Locale.ROOT);
        String estado = ConsoleUtils.lerTextoObrigatorio("UF de atendimento: ").toUpperCase(Locale.ROOT);

        return new DadosVoluntario(cro, especialidade, estado, "ATIVO");
    }

    private static CadastroParceiro coletarDadosEmpresaParceiro(String canalOrigem) {
        System.out.println("\n=== TIPO DE CADASTRO ===");
        System.out.println("1 - Pessoa fisica");
        System.out.println("2 - Pessoa juridica");

        int opcao = ConsoleUtils.lerOpcao("\nEscolha uma opcao: ", 1, 2);

        Contato contato = new Contato();
        contato.setIdContato(gerarIdAleatorio());
        contato.setCanalOrigem(normalizarCanal(canalOrigem));

        DadosComplementares dadosComplementares;

        if (opcao == 1) {
            System.out.println("\n=== DADOS DO PARCEIRO - PESSOA FISICA ===");

            contato.setNome(ConsoleUtils.lerTextoObrigatorio("Nome completo: "));
            contato.setDocumento(ConsoleUtils.lerTextoObrigatorio("CPF: "));
            contato.setEmail(ConsoleUtils.lerEmail("E-mail: "));
            contato.setTelefone(ConsoleUtils.lerTextoObrigatorio("Telefone: "));

            dadosComplementares = new DadosComplementares("PESSOA_FISICA", null);
        } else {
            System.out.println("\n=== DADOS DA EMPRESA/PARCEIRO - PESSOA JURIDICA ===");

            contato.setNome(ConsoleUtils.lerTextoObrigatorio("Razao social / Nome da empresa: "));
            contato.setDocumento(ConsoleUtils.lerTextoObrigatorio("CNPJ: "));
            String representante = ConsoleUtils.lerTextoObrigatorio("Nome do representante: ");
            contato.setEmail(ConsoleUtils.lerEmail("E-mail corporativo: "));
            contato.setTelefone(ConsoleUtils.lerTextoObrigatorio("Telefone: "));

            dadosComplementares = new DadosComplementares("PESSOA_JURIDICA", representante);
        }

        return new CadastroParceiro(contato, dadosComplementares);
    }

    private static Ticket gerarTicket(
            Contato contato,
            String motivoContato,
            String assunto,
            String mensagemUsuario
    ) {
        int idTicket = gerarIdAleatorio();
        LocalDateTime agora = LocalDateTime.now();

        Ticket ticket = new Ticket();
        ticket.setIdTicket(idTicket);
        ticket.setProtocolo(gerarProtocolo(idTicket, agora));
        ticket.setContato(contato);
        ticket.setIdContato(contato.getIdContato());
        ticket.setCanalOrigem(contato.getCanalOrigem());
        ticket.setAssunto(assunto.trim());
        ticket.setDescricao(mensagemUsuario.trim());
        ticket.setStatus("ABERTO");
        ticket.setPrioridade(definirPrioridade(motivoContato));
        ticket.setDataAbertura(agora);
        ticket.setDataAtualizacao(agora);

        return ticket;
    }

    private static String definirPrioridade(String motivoContato) {
        return switch (motivoContato) {
            case "BENEFICIARIO" -> "ALTA";
            case "DOACAO", "EMPRESA_PARCEIRO" -> "MEDIA";
            case "VOLUNTARIO" -> "BAIXA";
            default -> "BAIXA";
        };
    }

    private static String gerarProtocolo(int idTicket, LocalDateTime dataHora) {
        return "TKT-" + dataHora.format(DateTimeFormatter.ofPattern("yyyyMMddHHmm")) + "-" + idTicket;
    }

    private static int gerarIdAleatorio() {
        return random.nextInt(9000) + 1000;
    }

    private static String normalizarCanal(String canal) {
        if (canal == null || canal.isBlank()) {
            throw new IllegalArgumentException("O canal de origem e obrigatorio.");
        }

        String valor = canal.trim().toUpperCase(Locale.ROOT);

        if (!CANAIS_SUPORTADOS.contains(valor)) {
            throw new IllegalArgumentException("Canal invalido. Use: " + CANAIS_SUPORTADOS);
        }

        return valor;
    }

    private static void imprimirResumoAtendimento(
            Contato contato,
            Ticket ticket,
            TransacaoFinanceira transacaoFinanceira,
            DadosVoluntario dadosVoluntario,
            DadosComplementares dadosComplementares
    ) {
        System.out.println("\n==============================================");
        System.out.println(" RESUMO DO ATENDIMENTO GERADO");
        System.out.println("==============================================");

        System.out.println("\nContato:");
        System.out.println("ID interno: " + contato.getIdContato());
        System.out.println("Nome: " + contato.getNome());
        System.out.println("Documento: " + contato.getDocumento());
        System.out.println("E-mail: " + contato.getEmail());
        System.out.println("Telefone: " + contato.getTelefone());
        System.out.println("Canal de origem: " + contato.getCanalOrigem());

        if (dadosComplementares != null) {
            System.out.println("Tipo de pessoa: " + dadosComplementares.tipoPessoa());

            if (dadosComplementares.representante() != null) {
                System.out.println("Representante: " + dadosComplementares.representante());
            }
        }

        if (dadosVoluntario != null) {
            System.out.println("\nDados profissionais do voluntario:");
            System.out.println("CRO: " + dadosVoluntario.cro());
            System.out.println("Especialidade: " + dadosVoluntario.especialidade());
            System.out.println("UF de atendimento: " + dadosVoluntario.estado());
            System.out.println("Status: " + dadosVoluntario.status());
        }

        System.out.println("\nTicket:");
        System.out.println("ID: " + ticket.getIdTicket());
        System.out.println("Protocolo: " + ticket.getProtocolo());
        System.out.println("Assunto: " + ticket.getAssunto());
        System.out.println("Descricao: " + ticket.getDescricao());
        System.out.println("Status: " + ticket.getStatus());
        System.out.println("Prioridade: " + ticket.getPrioridade());
        System.out.println("Data de abertura: " + ticket.getDataAbertura());
        System.out.println("Contato vinculado: " + ticket.getContato().getNome());

        if (transacaoFinanceira != null) {
            System.out.println("\nTransacao financeira:");
            System.out.println("ID: " + transacaoFinanceira.getIdTransacaoFinanceira());
            System.out.println("Tipo: " + transacaoFinanceira.getTipo());
            System.out.println("Categoria: " + transacaoFinanceira.getCategoria());
            System.out.println("Valor: R$ " + transacaoFinanceira.getValor());
            System.out.println("Status: " + transacaoFinanceira.getStatus());
            System.out.println("Data: " + transacaoFinanceira.getData());
        }
    }

    private record DadosVoluntario(
            String cro,
            String especialidade,
            String estado,
            String status
    ) {
    }

    private record DadosComplementares(
            String tipoPessoa,
            String representante
    ) {
    }

    private record CadastroDoacao(
            Contato contato,
            DadosComplementares dadosComplementares,
            TransacaoFinanceira transacaoFinanceira
    ) {
    }

    private record CadastroParceiro(
            Contato contato,
            DadosComplementares dadosComplementares
    ) {
    }
}