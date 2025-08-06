package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.LoginRequest;
import com.ecommerce.backend.dto.RegisterRequest;
import com.ecommerce.backend.dto.TokenResponse;
import com.ecommerce.backend.model.User;
import com.ecommerce.backend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/users/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            TokenResponse tokenResponse = authService.registerUser(registerRequest);
            return ResponseEntity.ok(tokenResponse);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/users/login")
    public ResponseEntity<?> loginUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            TokenResponse tokenResponse = authService.loginUser(loginRequest);
            return ResponseEntity.ok(tokenResponse);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/users/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String tokenHeader) {
        String token = tokenHeader.replace("Bearer ", "");
        Optional<User> userOpt = authService.getCurrentUser(token);
        
        if (userOpt.isPresent()) {
            return ResponseEntity.ok(userOpt.get());
        } else {
            return ResponseEntity.status(401).body("Invalid or expired token");
        }
    }

    @PostMapping("/auth-tokens/refresh")
    public ResponseEntity<?> refreshToken(@RequestHeader("Authorization") String tokenHeader) {
        String token = tokenHeader.replace("Bearer ", "");
        authService.refreshToken(token);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/auth-tokens/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String tokenHeader) {
        String token = tokenHeader.replace("Bearer ", "");
        authService.invalidateToken(token);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/admin/login")
    public ResponseEntity<?> adminLogin(@Valid @RequestBody LoginRequest loginRequest) {
        if (authService.isValidAdminCredentials(loginRequest.getEmail(), loginRequest.getPassword())) {
            TokenResponse tokenResponse = authService.loginUser(loginRequest);
            return ResponseEntity.ok(tokenResponse);
        } else {
            return ResponseEntity.status(401).body("Invalid admin credentials");
        }
    }
}