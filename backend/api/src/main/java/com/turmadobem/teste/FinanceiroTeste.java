package com.turmadobem.teste;

import com.turmadobem.entity.TransacaoFinanceira;

import java.math.BigDecimal;

public class FinanceiroTeste {
    public static void exibir(BancoSimulado banco) {
        System.out.println("\n==============================================");
        System.out.println(" FINANCEIRO");
        System.out.println("==============================================");

        if (banco.getTransacoes().isEmpty()) {
            System.out.println("Nenhuma transacao financeira registrada ainda.");
            return;
        }

        BigDecimal total = BigDecimal.ZERO;

        for (TransacaoFinanceira transacao : banco.getTransacoes()) {
            System.out.println("\n----------------------------------------------");
            System.out.println("ID: " + transacao.getIdTransacaoFinanceira());
            System.out.println("Tipo: " + transacao.getTipo());
            System.out.println("Categoria: " + transacao.getCategoria());
            System.out.println("Valor: R$ " + transacao.getValor());
            System.out.println("Status: " + transacao.getStatus());
            System.out.println("Data: " + transacao.getData());
            System.out.println("Contato: " + transacao.getContato().getNome());

            total = total.add(transacao.getValor());
        }

        System.out.println("\nTotal financeiro registrado: R$ " + total);
    }
}