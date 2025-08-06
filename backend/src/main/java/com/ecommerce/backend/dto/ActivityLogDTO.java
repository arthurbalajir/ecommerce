package com.ecommerce.backend.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ActivityLogDTO {
    private Long id;
    private Long adminId;
    private String adminName;
    private String action;
    private String details;
    private LocalDateTime timestamp;
}