package com.turmadobem.teste;

import com.turmadobem.entity.Ticket;
import com.turmadobem.entity.TransacaoFinanceira;

import java.math.BigDecimal;
import java.util.Map;
import java.util.stream.Collectors;

public class RelatoriosTeste {
    public static void exibir(BancoSimulado banco) {
        while (true) {
            System.out.println("\n==============================================");
            System.out.println(" RELATORIOS");
            System.out.println("==============================================");
            System.out.println("1 - Relatorio de tickets");
            System.out.println("2 - Relatorio financeiro");
            System.out.println("3 - Relatorio de contatos");
            System.out.println("4 - Voltar ao menu principal");

            int opcao = ConsoleUtils.lerOpcao("\nEscolha uma opcao: ", 1, 4);

            switch (opcao) {
                case 1 -> relatorioTickets(banco);
                case 2 -> relatorioFinanceiro(banco);
                case 3 -> relatorioContatos(banco);
                case 4 -> {
                    return;
                }
            }
        }
    }

    private static void relatorioTickets(BancoSimulado banco) {
        System.out.println("\n=== RELATORIO DE TICKETS ===");

        System.out.println("Total de tickets: " + banco.getTickets().size());

        Map<String, Long> porStatus = banco.getTickets().stream()
                .collect(Collectors.groupingBy(Ticket::getStatus, Collectors.counting()));

        Map<String, Long> porCanal = banco.getTickets().stream()
                .collect(Collectors.groupingBy(Ticket::getCanalOrigem, Collectors.counting()));

        System.out.println("\nTickets por status:");
        if (porStatus.isEmpty()) {
            System.out.println("Nenhum dado encontrado.");
        } else {
            porStatus.forEach((status, total) -> System.out.println(status + ": " + total));
        }

        System.out.println("\nTickets por canal:");
        if (porCanal.isEmpty()) {
            System.out.println("Nenhum dado encontrado.");
        } else {
            porCanal.forEach((canal, total) -> System.out.println(canal + ": " + total));
        }
    }

    private static void relatorioFinanceiro(BancoSimulado banco) {
        System.out.println("\n=== RELATORIO FINANCEIRO ===");

        BigDecimal receitas = banco.getTransacoes().stream()
                .filter(t -> "RECEITA".equalsIgnoreCase(t.getTipo()))
                .map(TransacaoFinanceira::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        System.out.println("Total de transacoes: " + banco.getTransacoes().size());
        System.out.println("Receitas: R$ " + receitas);
        System.out.println("Despesas: R$ 0.00");
        System.out.println("Saldo: R$ " + receitas);
    }

    private static void relatorioContatos(BancoSimulado banco) {
        System.out.println("\n=== RELATORIO DE CONTATOS ===");
        System.out.println("Total de contatos cadastrados: " + banco.getContatos().size());
    }
}