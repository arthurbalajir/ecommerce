package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.LoginRequest;
import com.ecommerce.backend.dto.RegisterRequest;
import com.ecommerce.backend.dto.TokenResponse;
import com.ecommerce.backend.model.AuthToken;
import com.ecommerce.backend.model.User;
import com.ecommerce.backend.repository.AuthTokenRepository;
import com.ecommerce.backend.repository.UserRepository;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {
    
    private final UserRepository userRepository;
    private final AuthTokenRepository authTokenRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    
    public AuthService(UserRepository userRepository, AuthTokenRepository authTokenRepository, BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.authTokenRepository = authTokenRepository;
        this.passwordEncoder = passwordEncoder;
    }
    
    @Transactional
    public TokenResponse registerUser(RegisterRequest registerRequest) {
        // Check if user already exists
        if (userRepository.findByEmail(registerRequest.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already in use");
        }
        
        // Create new user
        User user = new User();
        user.setName(registerRequest.getName());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setIsAdmin(false);
        user.setCreatedAt(LocalDateTime.now());
        
        User savedUser = userRepository.save(user);
        
        // Create and return auth token
        return createTokenForUser(savedUser);
    }
    
    @Transactional
    public TokenResponse loginUser(LoginRequest loginRequest) {
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));
        
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }
        
        // Create and return auth token
        return createTokenForUser(user);
    }
    
    @Transactional(readOnly = true)
    public Optional<User> getUserFromToken(String token) {
        System.out.println("Looking up user for token: " + token.substring(0, Math.min(token.length(), 10)) + "...");
        
        try {
            Optional<AuthToken> authTokenOpt = authTokenRepository.findByTokenAndExpiresAtAfter(token, LocalDateTime.now());
            
            if (authTokenOpt.isPresent()) {
                AuthToken authToken = authTokenOpt.get();
                User user = authToken.getUser();
                
                if (user != null) {
                    System.out.println("Found user: " + user.getEmail() + " with isAdmin=" + user.getIsAdmin());
                    return Optional.of(user);
                } else {
                    System.out.println("Auth token exists but user is null");
                }
            } else {
                System.out.println("No valid auth token found");
            }
        } catch (Exception e) {
            System.err.println("Error getting user from token: " + e.getMessage());
            e.printStackTrace();
        }
        
        return Optional.empty();
    }
    
    @Transactional
    public void invalidateToken(String token) {
        authTokenRepository.findByToken(token)
                .ifPresent(authTokenRepository::delete);
    }
    
    private TokenResponse createTokenForUser(User user) {
        // Delete any existing tokens for this user
        authTokenRepository.deleteAllByUser(user);
        
        // Create new token
        AuthToken authToken = new AuthToken();
        authToken.setUser(user);
        authToken.setToken(UUID.randomUUID().toString());
        authToken.setCreatedAt(LocalDateTime.now());
        authToken.setExpiresAt(LocalDateTime.now().plusDays(7)); // Token valid for 7 days
        
        AuthToken savedToken = authTokenRepository.save(authToken);
        
        // Create response
        TokenResponse response = new TokenResponse();
        response.setUserId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setIsAdmin(user.getIsAdmin());
        response.setToken(savedToken.getToken());
        response.setExpiresAt(savedToken.getExpiresAt());
        
        return response;
    }
    
    @Transactional(readOnly = true)
    public Optional<User> getCurrentUser(String token) {
        return getUserFromToken(token);
    }
    
    @Transactional
    public void refreshToken(String token) {
        authTokenRepository.findByToken(token)
                .ifPresent(authToken -> {
                    authToken.setExpiresAt(LocalDateTime.now().plusDays(7));
                    authTokenRepository.save(authToken);
                });
    }
    
    @Transactional
    public boolean isValidAdminCredentials(String email, String password) {
        return userRepository.findByEmailAndIsAdmin(email, true)
                .map(admin -> passwordEncoder.matches(password, admin.getPassword()))
                .orElse(false);
    }
    
    // Additional method for scheduled tasks if needed
    @Transactional
    public void cleanupExpiredTokens() {
        authTokenRepository.deleteByExpiresAtBefore(LocalDateTime.now());
    }
}