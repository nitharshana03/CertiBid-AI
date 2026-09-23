package com.certibid.risk;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class AiRiskServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(AiRiskServiceApplication.class, args);
    }
}
