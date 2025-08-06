package com.ecommerce.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class OrderRequest {
    
    @NotBlank(message = "Customer name is required")
    @Size(min = 3, max = 100, message = "Name must be between 3 and 100 characters")
    private String customerName;
    
    @NotBlank(message = "Customer phone is required")
    @Size(min = 5, max = 15, message = "Phone number must be between 5 and 15 characters")
    private String customerPhone;
    
    private String customerEmail;
    
    @NotBlank(message = "Customer address is required")
    private String customerAddress;
    
    @NotEmpty(message = "Order must have at least one item")
    @Valid
    private List<OrderItemDTO> items;
}