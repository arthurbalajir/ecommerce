package com.ecommerce.backend.service;

import com.ecommerce.backend.model.ActivityLog;
import com.ecommerce.backend.model.Admin;
import com.ecommerce.backend.model.User;
import com.ecommerce.backend.repository.ActivityLogRepository;
import com.ecommerce.backend.repository.AdminRepository;
import com.ecommerce.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class AdminService {
    
    @Autowired
    private AdminRepository adminRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ActivityLogRepository activityLogRepository;
    
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;
    
    public List<Admin> getAllAdmins() {
        return adminRepository.findAll();
    }
    
    public Optional<Admin> getAdminById(Long id) {
        return adminRepository.findById(id);
    }
    
    public Optional<Admin> getAdminByEmail(String email) {
        return adminRepository.findByEmail(email);
    }
    
    /**
     * Checks if any admin exists in the system
     * @return true if at least one admin exists, false otherwise
     */
    public boolean anyAdminExists() {
        return adminRepository.count() > 0;
    }
    
    /**
     * Register the first admin when no admins exist in the system
     * @param admin The admin to register
     * @return The saved admin
     */
    @Transactional
    public Admin registerFirstAdmin(Admin admin) {
        if (adminRepository.count() > 0) {
            throw new IllegalStateException("Cannot register first admin when admins already exist");
        }
        
        if (adminRepository.existsByEmail(admin.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }
        
        admin.setPassword(passwordEncoder.encode(admin.getPassword()));
        Admin savedAdmin = adminRepository.save(admin);
        
        // Create a corresponding user record with admin privileges
        User adminUser = new User();
        adminUser.setName(admin.getName());
        adminUser.setEmail(admin.getEmail());
        adminUser.setPassword(admin.getPassword());
        adminUser.setIsAdmin(true);
        userRepository.save(adminUser);
        
        // Log this activity
        ActivityLog log = new ActivityLog();
        log.setAdmin(savedAdmin);
        log.setAction("ADMIN_CREATED");
        log.setDetails("First admin account created: " + admin.getEmail());
        activityLogRepository.save(log);
        
        return savedAdmin;
    }
    
    @Transactional
    public Admin registerAdmin(Admin admin, String actionBy) {
        if (adminRepository.existsByEmail(admin.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }
        
        admin.setPassword(passwordEncoder.encode(admin.getPassword()));
        Admin savedAdmin = adminRepository.save(admin);
        
        // Create a corresponding user record with admin privileges
        User adminUser = new User();
        adminUser.setName(admin.getName());
        adminUser.setEmail(admin.getEmail());
        adminUser.setPassword(admin.getPassword());
        adminUser.setIsAdmin(true);
        userRepository.save(adminUser);
        
        // Log this activity
        logAdminActivity(getAdminByEmail(actionBy).orElse(null), 
                "ADMIN_CREATED", 
                "Created new admin account: " + admin.getEmail());
        
        return savedAdmin;
    }
    
    public ActivityLog logAdminActivity(Admin admin, String action, String details) {
        ActivityLog log = new ActivityLog();
        log.setAdmin(admin);
        log.setAction(action);
        log.setDetails(details);
        
        return activityLogRepository.save(log);
    }
    
    public List<ActivityLog> getActivityLogsByAdmin(Admin admin) {
        return activityLogRepository.findByAdmin(admin);
    }
    
    public List<ActivityLog> getAllActivityLogs() {
        return activityLogRepository.findAll();
    }
}