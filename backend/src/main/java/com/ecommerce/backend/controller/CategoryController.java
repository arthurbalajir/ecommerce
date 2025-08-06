package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.CategoryDTO;
import com.ecommerce.backend.model.Category;
import com.ecommerce.backend.model.User;
import com.ecommerce.backend.service.AuthService;
import com.ecommerce.backend.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class CategoryController {
    
    @Autowired
    private CategoryService categoryService;
    
    @Autowired
    private AuthService authService;
    
    @GetMapping("/categories")
    public ResponseEntity<List<CategoryDTO>> getAllCategories() {
        List<CategoryDTO> categories = categoryService.getAllCategories().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(categories);
    }
    
    @PostMapping("/admin/categories")
    public ResponseEntity<?> createCategory(
            @Valid @RequestBody CategoryDTO categoryDTO,
            @RequestHeader("Authorization") String tokenHeader) {
        
        String token = tokenHeader.replace("Bearer ", "");
        User admin = authService.getUserFromToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired token"));
        
        Category category = new Category();
        category.setName(categoryDTO.getName());
        category.setDescription(categoryDTO.getDescription());
        
        Category savedCategory = categoryService.createCategory(category, admin.getEmail());
        
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(savedCategory));
    }
    
    @PutMapping("/admin/categories/{id}")
    public ResponseEntity<?> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryDTO categoryDTO,
            @RequestHeader("Authorization") String tokenHeader) {
        
        String token = tokenHeader.replace("Bearer ", "");
        User admin = authService.getUserFromToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired token"));
        
        return categoryService.getCategoryById(id)
                .map(existingCategory -> {
                    existingCategory.setName(categoryDTO.getName());
                    existingCategory.setDescription(categoryDTO.getDescription());
                    
                    Category updatedCategory = categoryService.updateCategory(existingCategory, admin.getEmail());
                    return ResponseEntity.ok(convertToDTO(updatedCategory));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/admin/categories/{id}")
    public ResponseEntity<?> deleteCategory(
            @PathVariable Long id,
            @RequestHeader("Authorization") String tokenHeader) {
        
        String token = tokenHeader.replace("Bearer ", "");
        User admin = authService.getUserFromToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired token"));
        
        if (!categoryService.getCategoryById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        categoryService.deleteCategory(id, admin.getEmail());
        return ResponseEntity.ok().build();
    }
    
    private CategoryDTO convertToDTO(Category category) {
        CategoryDTO dto = new CategoryDTO();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setDescription(category.getDescription());
        dto.setCreatedAt(category.getCreatedAt());
        return dto;
    }
}