package com.smartcampus;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {

        // ================================
        // LOAD .env FILE
        // ================================
        // This reads .env and injects into system properties
        // So Spring Boot can access them via ${...}
        Dotenv dotenv = Dotenv.configure()
                .ignoreIfMissing() // prevents crash if .env is absent
                .load();

        dotenv.entries().forEach(entry ->
                System.setProperty(entry.getKey(), entry.getValue())
        );

        // ================================
        // RUN SPRING BOOT
        // ================================
        SpringApplication.run(BackendApplication.class, args);
    }
}