package com.ecommerce.backend.config;

import com.ecommerce.backend.service.AuthService;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

@Configuration
@EnableScheduling
public class ScheduledTasks {

    private final AuthService authService;

    
    public ScheduledTasks(AuthService authService) {
        this.authService = authService;
    }

    // Run every day at midnight
    @Scheduled(cron = "0 0 0 * * ?")
    public void cleanupExpiredTokens() {
        authService.cleanupExpiredTokens();
    }
}