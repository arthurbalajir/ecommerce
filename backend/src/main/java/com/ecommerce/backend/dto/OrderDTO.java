package com.ecommerce.backend.dto;

import com.ecommerce.backend.model.Order;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
public class OrderDTO {
    private Long id;
    private String trackingId;
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    private String customerAddress;
    private BigDecimal totalAmount;
    private Order.OrderStatus status;
    private LocalDateTime orderDate;
    private List<OrderItemDTO> items = new ArrayList<>();
}