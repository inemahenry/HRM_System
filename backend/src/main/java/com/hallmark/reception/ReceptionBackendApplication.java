package com.hallmark.reception;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ReceptionBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(ReceptionBackendApplication.class, args);
    }
}
