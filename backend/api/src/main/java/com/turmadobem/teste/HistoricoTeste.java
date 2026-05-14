package com.turmadobem.teste;

public class HistoricoTeste {
    public static void exibir(BancoSimulado banco) {
        System.out.println("\n==============================================");
        System.out.println(" HISTORICO DE TICKETS");
        System.out.println("==============================================");

        if (banco.getTickets().isEmpty()) {
            System.out.println("Nenhum ticket foi criado ainda.");
            return;
        }

        banco.getTickets().forEach(ticket -> {
            System.out.println("\n----------------------------------------------");
            System.out.println("Protocolo: " + ticket.getProtocolo());
            System.out.println("Contato: " + ticket.getContato().getNome());
            System.out.println("Documento: " + ticket.getContato().getDocumento());
            System.out.println("Canal: " + ticket.getCanalOrigem());
            System.out.println("Assunto: " + ticket.getAssunto());
            System.out.println("Descricao: " + ticket.getDescricao());
            System.out.println("Status: " + ticket.getStatus());
            System.out.println("Prioridade: " + ticket.getPrioridade());
            System.out.println("Data abertura: " + ticket.getDataAbertura());
        });
    }
}