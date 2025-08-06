package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.UserDTO;
import com.ecommerce.backend.model.User;
import com.ecommerce.backend.service.AuthService;
import com.ecommerce.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private AuthService authService;
    
    @GetMapping("/users/profile")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String tokenHeader) {
        String token = tokenHeader.replace("Bearer ", "");
        User user = authService.getUserFromToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired token"));
        
        UserDTO userDTO = convertToDTO(user);
        
        return ResponseEntity.ok(userDTO);
    }
    
    @GetMapping("/admin/users")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<UserDTO> users = userService.getAllUsers().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(users);
    }
    
    @GetMapping("/admin/users/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(this::convertToDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }
    
    @DeleteMapping("/admin/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (!userService.getUserById(id).isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        
        userService.deleteUser(id);
        return ResponseEntity.ok().build();
    }
    
    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setIsAdmin(user.getIsAdmin());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }
}