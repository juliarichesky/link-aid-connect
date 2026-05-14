package com.turmadobem.teste;

public class TesteSprint3App {
    public static void main(String[] args) {
        BancoSimulado banco = new BancoSimulado();

        while (true) {
            System.out.println("\n==============================================");
            System.out.println(" LINKAID / TURMA DO BEM - MENU PRINCIPAL");
            System.out.println("==============================================");
            System.out.println("1 - Dashboard");
            System.out.println("2 - Tickets");
            System.out.println("3 - Historico");
            System.out.println("4 - Contatos");
            System.out.println("5 - Relatorios");
            System.out.println("6 - Configuracoes");
            System.out.println("7 - Canais");
            System.out.println("8 - Dentistas");
            System.out.println("9 - Financeiro");
            System.out.println("0 - Sair");

            int opcao = ConsoleUtils.lerOpcao("\nEscolha uma opcao: ", 0, 9);

            switch (opcao) {
                case 1 -> DashboardTeste.exibir(banco);
                case 2 -> TicketsTeste.abrir(banco);
                case 3 -> HistoricoTeste.exibir(banco);
                case 4 -> ContatosTeste.exibir(banco);
                case 5 -> RelatoriosTeste.exibir(banco);
                case 6 -> ConfiguracoesTeste.exibir();
                case 7 -> CanaisTeste.exibir();
                case 8 -> DentistasTeste.exibir();
                case 9 -> FinanceiroTeste.exibir(banco);
                case 0 -> {
                    System.out.println("\nEncerrando simulacao...");
                    return;
                }
            }
        }
    }
}