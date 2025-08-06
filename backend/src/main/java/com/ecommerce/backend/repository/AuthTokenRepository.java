package com.ecommerce.backend.repository;

import com.ecommerce.backend.model.AuthToken;
import com.ecommerce.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface AuthTokenRepository extends JpaRepository<AuthToken, Long> {
    Optional<AuthToken> findByToken(String token);
    Optional<AuthToken> findByTokenAndExpiresAtAfter(String token, LocalDateTime now);
    void deleteAllByUser(User user);
    void deleteByExpiresAtBefore(LocalDateTime dateTime);
}