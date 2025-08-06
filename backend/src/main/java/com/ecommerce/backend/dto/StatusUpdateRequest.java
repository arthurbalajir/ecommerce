package com.ecommerce.backend.dto;

import com.ecommerce.backend.model.Order;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StatusUpdateRequest {
    
    @NotNull(message = "Status is required")
    private Order.OrderStatus status;
}