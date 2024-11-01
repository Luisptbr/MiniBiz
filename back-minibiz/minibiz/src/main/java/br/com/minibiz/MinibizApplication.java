package br.com.minibiz;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.Banner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.core.env.Environment;

import java.io.PrintStream;

@SpringBootApplication
public class MinibizApplication {
    public static void main(String[] args) {
        // Carregar variáveis de ambiente do arquivo .env
        Dotenv dotenv = Dotenv.load();
        System.setProperty("MAIL_HOST", dotenv.get("MAIL_HOST"));
        System.setProperty("MAIL_PORT", dotenv.get("MAIL_PORT"));
        System.setProperty("MAIL_USERNAME", dotenv.get("MAIL_USERNAME"));
        System.setProperty("MAIL_PASSWORD", dotenv.get("MAIL_PASSWORD"));

        // Configurar e iniciar a aplicação Spring Boot
        SpringApplication app = new SpringApplication(MinibizApplication.class);

        // Definir o banner personalizado
        app.setBanner(new Banner() {
            @Override
            public void printBanner(Environment environment, Class<?> sourceClass, PrintStream out) {
                out.println("         __  ___   _             _    ____     _             ");
                out.println("        /  |/  /  (_)  ____     (_)  / __ )   (_)  ____      ");
                out.println("       / /|_/ /  / /  / __ \\   / /  / __  |  / /  /_  /      ");
                out.println("      / /  / /  / /  / / / /  / /  / /_/ /  / /    / /_   _  ");
                out.println("     /_/  /_/  /_/  /_/ /_/  /_/  /_____/  /_/    /___/  (_) ");
                out.println("                                                          		 ");
            }
        });
        
        app.setBannerMode(Banner.Mode.CONSOLE); // ou LOG, se preferir no log

        app.run(args);
    }
}
