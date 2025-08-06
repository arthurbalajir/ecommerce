package com.ecommerce.backend.repository;

import com.ecommerce.backend.model.ActivityLog;
import com.ecommerce.backend.model.Admin;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    
    List<ActivityLog> findByAdmin(Admin admin);
    
    List<ActivityLog> findByAction(String action);
    
    List<ActivityLog> findByTimestampBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    @NonNull
    @Override
    Page<ActivityLog> findAll(@NonNull Pageable pageable);
}