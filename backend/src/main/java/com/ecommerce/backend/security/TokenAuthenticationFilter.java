package com.ecommerce.backend.security;

import com.ecommerce.backend.model.User;
import com.ecommerce.backend.service.AuthService;

import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Component
public class TokenAuthenticationFilter extends OncePerRequestFilter {
    
    private final AuthService authService;
    
    public TokenAuthenticationFilter(AuthService authService) {
        this.authService = authService;
    }
    
    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request, 
            @NonNull HttpServletResponse response, 
            @NonNull FilterChain filterChain)
            throws ServletException, IOException {
        
        try {
            String token = getTokenFromRequest(request);
            
            if (StringUtils.hasText(token)) {
                System.out.println("Processing token: " + token.substring(0, Math.min(token.length(), 10)) + "...");
                Optional<User> userOpt = authService.getUserFromToken(token);
                
                if (userOpt.isPresent()) {
                    User user = userOpt.get();
                    System.out.println("User authenticated: " + user.getEmail() + ", isAdmin: " + user.getIsAdmin());
                    
                    // Set up authentication
                    UsernamePasswordAuthenticationToken authentication;
                    
                    if (user.getIsAdmin()) {
                        // For admin users, add ROLE_ADMIN authority
                        authentication = new UsernamePasswordAuthenticationToken(
                            user,
                            null,
                            List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
                        );
                        System.out.println("Admin role assigned to: " + user.getEmail());
                    } else {
                        // For regular users, add ROLE_USER authority
                        authentication = new UsernamePasswordAuthenticationToken(
                            user,
                            null,
                            List.of(new SimpleGrantedAuthority("ROLE_USER"))
                        );
                        System.out.println("User role assigned to: " + user.getEmail());
                    }
                    
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                } else {
                    System.out.println("No user found for token");
                }
            }
        } catch (Exception ex) {
            System.err.println("Authentication error in filter: " + ex.getMessage());
            ex.printStackTrace();
        }
        
        filterChain.doFilter(request, response);
    }
    
    private String getTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        
        return null;
    }
}