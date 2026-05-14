package com.turmadobem.teste;

public class ContatosTeste {
    public static void exibir(BancoSimulado banco) {
        System.out.println("\n==============================================");
        System.out.println(" CONTATOS CADASTRADOS");
        System.out.println("==============================================");

        if (banco.getContatos().isEmpty()) {
            System.out.println("Nenhum contato cadastrado ainda.");
            return;
        }

        banco.getContatos().forEach(contato -> {
            System.out.println("\n----------------------------------------------");
            System.out.println("ID: " + contato.getIdContato());
            System.out.println("Nome: " + contato.getNome());
            System.out.println("Documento: " + contato.getDocumento());
            System.out.println("E-mail: " + contato.getEmail());
            System.out.println("Telefone: " + contato.getTelefone());
            System.out.println("Canal de origem: " + contato.getCanalOrigem());
        });
    }
}