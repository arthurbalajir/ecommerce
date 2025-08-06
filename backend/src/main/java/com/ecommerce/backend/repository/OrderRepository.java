package com.ecommerce.backend.repository;

import com.ecommerce.backend.model.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByTrackingId(String trackingId);

    List<Order> findByCustomerEmail(String email);

    List<Order> findByStatus(Order.OrderStatus status);

    Page<Order> findByStatus(Order.OrderStatus status, Pageable pageable);

    List<Order> findByOrderDateBetween(LocalDateTime startDate, LocalDateTime endDate);

    @Query("SELECT o FROM Order o WHERE o.customerName LIKE %:keyword% OR o.customerEmail LIKE %:keyword% OR o.trackingId LIKE %:keyword%")
    List<Order> searchOrders(@Param("keyword") String keyword);
}