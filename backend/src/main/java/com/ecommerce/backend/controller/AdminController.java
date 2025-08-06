package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.AdminDTO;
import com.ecommerce.backend.dto.AdminRegistrationRequest;
import com.ecommerce.backend.dto.ActivityLogDTO;
import com.ecommerce.backend.model.ActivityLog;
import com.ecommerce.backend.model.Admin;
import com.ecommerce.backend.model.User;
import com.ecommerce.backend.service.AdminService;
import com.ecommerce.backend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    
    @Autowired
    private AdminService adminService;
    
    @Autowired
    private AuthService authService;
    
    /**
     * Check if any admin exists in the system
     * @return true if at least one admin exists, false otherwise
     */
    @GetMapping("/exists")
    public ResponseEntity<Boolean> checkAdminExists() {
        try {
            boolean exists = adminService.anyAdminExists();
            return ResponseEntity.ok(exists);
        } catch (Exception e) {
            // Log the error
            System.err.println("Error checking if admin exists: " + e.getMessage());
            e.printStackTrace();
            // Return 500 error with message
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(null);
        }
    }
    
    /**
     * Register the first admin when no admins exist in the system
     * @param request The admin registration request
     * @return The registered admin or error
     */
    @PostMapping("/register-first")
    public ResponseEntity<?> registerFirstAdmin(@Valid @RequestBody AdminRegistrationRequest request) {
        // Check if there are no admins
        if (adminService.anyAdminExists()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admin users already exist. First admin can only be created when there are no admins.");
        }
        
        Admin admin = new Admin();
        admin.setName(request.getName());
        admin.setEmail(request.getEmail());
        admin.setPassword(request.getPassword());
        
        Admin savedAdmin;
        try {
            savedAdmin = adminService.registerFirstAdmin(admin);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to register first admin: " + e.getMessage());
        }
        
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(savedAdmin));
    }
    
    @GetMapping("/profile")
    public ResponseEntity<?> getAdminProfile(@RequestHeader("Authorization") String tokenHeader) {
        String token = tokenHeader.replace("Bearer ", "");
        User user = authService.getUserFromToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired token"));
        
        if (!user.getIsAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not an admin user");
        }
        
        return adminService.getAdminByEmail(user.getEmail())
                .map(this::convertToDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }
    
    @GetMapping("/list")
    public ResponseEntity<List<AdminDTO>> getAllAdmins() {
        List<AdminDTO> admins = adminService.getAllAdmins().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(admins);
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> registerAdmin(
            @Valid @RequestBody AdminRegistrationRequest request,
            @RequestHeader("Authorization") String tokenHeader) {
        
        String token = tokenHeader.replace("Bearer ", "");
        User currentUser = authService.getUserFromToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired token"));
        
        if (!currentUser.getIsAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only admins can register new admins");
        }
        
        Admin admin = new Admin();
        admin.setName(request.getName());
        admin.setEmail(request.getEmail());
        admin.setPassword(request.getPassword());
        
        Admin savedAdmin;
        try {
            savedAdmin = adminService.registerAdmin(admin, currentUser.getEmail());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to register admin: " + e.getMessage());
        }
        
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(savedAdmin));
    }
    
    @GetMapping("/activity-logs")
    public ResponseEntity<List<ActivityLogDTO>> getAllActivityLogs() {
        List<ActivityLogDTO> logs = adminService.getAllActivityLogs().stream()
                .map(this::convertLogToDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(logs);
    }
    
    @GetMapping("/activity-logs/my")
    public ResponseEntity<?> getMyActivityLogs(@RequestHeader("Authorization") String tokenHeader) {
        String token = tokenHeader.replace("Bearer ", "");
        User user = authService.getUserFromToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired token"));
        
        return adminService.getAdminByEmail(user.getEmail())
                .map(admin -> {
                    List<ActivityLogDTO> logs = adminService.getActivityLogsByAdmin(admin).stream()
                            .map(this::convertLogToDTO)
                            .collect(Collectors.toList());
                    return ResponseEntity.ok(logs);
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }
    
    private AdminDTO convertToDTO(Admin admin) {
        AdminDTO dto = new AdminDTO();
        dto.setId(admin.getId());
        dto.setName(admin.getName());
        dto.setEmail(admin.getEmail());
        dto.setCreatedAt(admin.getCreatedAt());
        return dto;
    }
    
    private ActivityLogDTO convertLogToDTO(ActivityLog log) {
        ActivityLogDTO dto = new ActivityLogDTO();
        dto.setId(log.getId());
        dto.setAction(log.getAction());
        dto.setDetails(log.getDetails());
        dto.setTimestamp(log.getTimestamp());
        
        if (log.getAdmin() != null) {
            dto.setAdminId(log.getAdmin().getId());
            dto.setAdminName(log.getAdmin().getName());
        }
        
        return dto;
    }
}