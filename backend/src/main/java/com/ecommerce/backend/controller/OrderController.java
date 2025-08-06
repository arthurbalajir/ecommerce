package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.OrderDTO;
import com.ecommerce.backend.dto.OrderItemDTO;
import com.ecommerce.backend.dto.OrderRequest;
import com.ecommerce.backend.dto.StatusUpdateRequest;
import com.ecommerce.backend.model.Order;
import com.ecommerce.backend.model.OrderItem;
import com.ecommerce.backend.model.Product;
import com.ecommerce.backend.model.User;
import com.ecommerce.backend.service.AuthService;
import com.ecommerce.backend.service.OrderService;
import com.ecommerce.backend.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class OrderController {
    
    @Autowired
    private OrderService orderService;
    
    @Autowired
    private ProductService productService;
    
    @Autowired
    private AuthService authService;

    // 🚩 New endpoint: Get my orders
    @GetMapping("/orders/my")
    public ResponseEntity<?> getMyOrders(@RequestHeader("Authorization") String tokenHeader) {
        String token = tokenHeader.replace("Bearer ", "");
        User user = authService.getUserFromToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired token"));

        List<Order> orders = orderService.getOrdersByEmail(user.getEmail());
        List<OrderDTO> orderDTOs = orders.stream().map(this::convertToDTO).collect(Collectors.toList());
        return ResponseEntity.ok(orderDTOs);
    }
    
    @PostMapping("/orders")
    public ResponseEntity<?> createOrder(@Valid @RequestBody OrderRequest orderRequest) {
        Order order = new Order();
        order.setCustomerName(orderRequest.getCustomerName());
        order.setCustomerPhone(orderRequest.getCustomerPhone());
        order.setCustomerEmail(orderRequest.getCustomerEmail());
        order.setCustomerAddress(orderRequest.getCustomerAddress());
        order.setStatus(Order.OrderStatus.Pending);

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (OrderItemDTO itemDTO : orderRequest.getItems()) {
            Product product = productService.getProductById(itemDTO.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found: " + itemDTO.getProductId()));

            if (product.getStock() < itemDTO.getQuantity()) {
                return ResponseEntity.badRequest().body("Not enough stock for product: " + product.getName());
            }

            OrderItem item = new OrderItem();
            item.setProduct(product);
            item.setQuantity(itemDTO.getQuantity());
            item.setPrice(product.getPrice());

            orderItems.add(item);
            totalAmount = totalAmount.add(product.getPrice().multiply(new BigDecimal(itemDTO.getQuantity())));
        }

        order.setTotalAmount(totalAmount);

        Order savedOrder = orderService.createOrder(order, orderItems);

        OrderDTO responseDTO = convertToDTO(savedOrder);
        return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
    }

    @GetMapping("/orders/track/{trackingId}")
    public ResponseEntity<?> trackOrder(@PathVariable String trackingId) {
        return orderService.getOrderByTrackingId(trackingId)
                .map(this::convertToDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @GetMapping("/admin/orders")
    public ResponseEntity<?> getOrders(
            @RequestParam(required = false) Order.OrderStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestHeader("Authorization") String tokenHeader) {
        String token = tokenHeader.replace("Bearer ", "");
        authService.getUserFromToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired token"));

        Page<Order> orders;
        if (status != null) {
            orders = orderService.getOrdersByStatus(status, PageRequest.of(page, size));
        } else {
            orders = orderService.getAllOrders(PageRequest.of(page, size));
        }

        return ResponseEntity.ok(orders.map(this::convertToDTO));
    }

    @GetMapping("/admin/orders/{id}")
    public ResponseEntity<?> getOrderDetails(
            @PathVariable Long id,
            @RequestHeader("Authorization") String tokenHeader) {
        String token = tokenHeader.replace("Bearer ", "");
        authService.getUserFromToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired token"));

        return orderService.getOrderById(id)
                .map(this::convertToDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/admin/orders/{id}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest request,
            @RequestHeader("Authorization") String tokenHeader) {
        String token = tokenHeader.replace("Bearer ", "");
        User admin = authService.getUserFromToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired token"));

        try {
            Order updatedOrder = orderService.updateOrderStatus(id, request.getStatus(), admin.getEmail());
            return ResponseEntity.ok(convertToDTO(updatedOrder));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    private OrderDTO convertToDTO(Order order) {
        OrderDTO dto = new OrderDTO();
        dto.setId(order.getId());
        dto.setTrackingId(order.getTrackingId());
        dto.setCustomerName(order.getCustomerName());
        dto.setCustomerPhone(order.getCustomerPhone());
        dto.setCustomerEmail(order.getCustomerEmail());
        dto.setCustomerAddress(order.getCustomerAddress());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setStatus(order.getStatus());
        dto.setOrderDate(order.getOrderDate());

        List<OrderItemDTO> itemDTOs = order.getOrderItems().stream()
                .map(item -> {
                    OrderItemDTO itemDTO = new OrderItemDTO();
                    itemDTO.setId(item.getId());
                    itemDTO.setProductId(item.getProduct().getId());
                    itemDTO.setProductName(item.getProduct().getName());
                    itemDTO.setQuantity(item.getQuantity());
                    itemDTO.setPrice(item.getPrice());
                    if (item.getProduct().getImageUrl() != null) {
                        itemDTO.setProductImage(item.getProduct().getImageUrl());
                    }
                    return itemDTO;
                })
                .collect(Collectors.toList());

        dto.setItems(itemDTOs);
        return dto;
    }
}