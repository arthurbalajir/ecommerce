package com.ecommerce.backend.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserDTO {
    private Long id;
    private String name;
    private String email;
    private Boolean isAdmin;
    private LocalDateTime createdAt;
}