package com.turmadobem.teste;

import com.turmadobem.entity.Ticket;
import com.turmadobem.entity.TransacaoFinanceira;

import java.math.BigDecimal;
import java.util.Map;
import java.util.stream.Collectors;

public class DashboardTeste {
    public static void exibir(BancoSimulado banco) {
        System.out.println("\n==============================================");
        System.out.println(" DASHBOARD");
        System.out.println("==============================================");

        int totalContatos = banco.getContatos().size();
        int totalTickets = banco.getTickets().size();
        int totalTransacoes = banco.getTransacoes().size();

        BigDecimal totalReceitas = banco.getTransacoes().stream()
                .filter(t -> "RECEITA".equalsIgnoreCase(t.getTipo()))
                .map(TransacaoFinanceira::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        System.out.println("Total de contatos: " + totalContatos);
        System.out.println("Total de tickets: " + totalTickets);
        System.out.println("Total de transacoes financeiras: " + totalTransacoes);
        System.out.println("Total de receitas: R$ " + totalReceitas);

        System.out.println("\nTickets por status:");
        Map<String, Long> ticketsPorStatus = banco.getTickets().stream()
                .collect(Collectors.groupingBy(Ticket::getStatus, Collectors.counting()));

        if (ticketsPorStatus.isEmpty()) {
            System.out.println("Nenhum ticket cadastrado.");
        } else {
            ticketsPorStatus.forEach((status, quantidade) ->
                    System.out.println(status + ": " + quantidade)
            );
        }

        System.out.println("\nTickets por canal:");
        Map<String, Long> ticketsPorCanal = banco.getTickets().stream()
                .collect(Collectors.groupingBy(Ticket::getCanalOrigem, Collectors.counting()));

        if (ticketsPorCanal.isEmpty()) {
            System.out.println("Nenhum canal registrado.");
        } else {
            ticketsPorCanal.forEach((canal, quantidade) ->
                    System.out.println(canal + ": " + quantidade)
            );
        }

        System.out.println("\nUltimos tickets:");
        banco.getTickets().stream()
                .limit(5)
                .forEach(ticket -> System.out.println(
                        ticket.getProtocolo() + " | " +
                                ticket.getAssunto() + " | " +
                                ticket.getStatus()
                ));
    }
}