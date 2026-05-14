package com.turmadobem.teste;

import java.math.BigDecimal;
import java.util.Scanner;

public class ConsoleUtils {
    private static final Scanner scanner = new Scanner(System.in);

    public static int lerOpcao(String mensagem, int minimo, int maximo) {
        while (true) {
            System.out.print(mensagem);

            try {
                int opcao = Integer.parseInt(scanner.nextLine().trim());

                if (opcao >= minimo && opcao <= maximo) {
                    return opcao;
                }

                System.out.println("Opcao invalida. Escolha entre " + minimo + " e " + maximo + ".");
            } catch (NumberFormatException exception) {
                System.out.println("Digite apenas numeros.");
            }
        }
    }

    public static String lerTextoObrigatorio(String mensagem) {
        while (true) {
            System.out.print(mensagem);
            String texto = scanner.nextLine().trim();

            if (!texto.isBlank()) {
                return texto;
            }

            System.out.println("Campo obrigatorio. Tente novamente.");
        }
    }

    public static String lerEmail(String mensagem) {
        while (true) {
            String email = lerTextoObrigatorio(mensagem);

            if (email.contains("@")) {
                return email;
            }

            System.out.println("E-mail invalido. Digite um e-mail contendo @.");
        }
    }

    public static BigDecimal lerValorMonetario(String mensagem) {
        while (true) {
            System.out.print(mensagem);
            String valorDigitado = scanner.nextLine().trim().replace(",", ".");

            try {
                BigDecimal valor = new BigDecimal(valorDigitado);

                if (valor.compareTo(BigDecimal.ZERO) > 0) {
                    return valor;
                }

                System.out.println("O valor deve ser maior que zero.");
            } catch (NumberFormatException exception) {
                System.out.println("Valor invalido. Exemplo correto: 150.00");
            }
        }
    }
}