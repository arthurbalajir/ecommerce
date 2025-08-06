package com.ecommerce.backend.service;

import com.ecommerce.backend.model.Order;
import com.ecommerce.backend.model.OrderItem;
import com.ecommerce.backend.model.Product;
import com.ecommerce.backend.repository.OrderItemRepository;
import com.ecommerce.backend.repository.OrderRepository;
import com.ecommerce.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class OrderService {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private OrderItemRepository orderItemRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private AdminService adminService;
    
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }
    
    public Page<Order> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable);
    }
    
    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(id);
    }
    
    public Optional<Order> getOrderByTrackingId(String trackingId) {
        return orderRepository.findByTrackingId(trackingId);
    }

    // 🚩 This method is used by /orders/my endpoint to get orders for a user's email
    public List<Order> getOrdersByEmail(String email) {
        return orderRepository.findByCustomerEmail(email);
    }
    
    public List<Order> getOrdersByStatus(Order.OrderStatus status) {
        return orderRepository.findByStatus(status);
    }
    
    public Page<Order> getOrdersByStatus(Order.OrderStatus status, Pageable pageable) {
        return orderRepository.findByStatus(status, pageable);
    }
    
    public List<Order> getOrdersByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return orderRepository.findByOrderDateBetween(startDate, endDate);
    }
    
    public List<Order> searchOrders(String keyword) {
        return orderRepository.searchOrders(keyword);
    }
    
    @Transactional
    public Order createOrder(Order order, List<OrderItem> orderItems) {
        // Generate a unique tracking ID
        String trackingId = generateTrackingId();
        order.setTrackingId(trackingId);
        
        // Save the order first
        Order savedOrder = orderRepository.save(order);
        
        // Process each order item
        orderItems.forEach(item -> {
            item.setOrder(savedOrder);
            
            // Reduce stock
            Product product = item.getProduct();
            product.setStock(product.getStock() - item.getQuantity());
            productRepository.save(product);
            
            orderItemRepository.save(item);
        });
        
        return savedOrder;
    }
    
    @Transactional
    public Order updateOrderStatus(Long id, Order.OrderStatus status, String adminEmail) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        
        Order.OrderStatus oldStatus = order.getStatus();
        order.setStatus(status);
        Order updatedOrder = orderRepository.save(order);
        
        // Log this activity
        adminService.getAdminByEmail(adminEmail).ifPresent(admin -> 
            adminService.logAdminActivity(admin, "ORDER_STATUS_UPDATED", 
                "Updated order status from " + oldStatus + " to " + status + 
                " for order #" + order.getTrackingId()));
        
        return updatedOrder;
    }
    
    private String generateTrackingId() {
        // Generate a random tracking ID (you can customize this logic)
        return "TRK" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();
    }
}