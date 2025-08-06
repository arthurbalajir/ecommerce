package com.ecommerce.backend.service;


import com.ecommerce.backend.model.Category;
import com.ecommerce.backend.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private AdminService adminService;
    
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }
    
    public Optional<Category> getCategoryById(Long id) {
        return categoryRepository.findById(id);
    }
    
    public Optional<Category> getCategoryByName(String name) {
        return categoryRepository.findByName(name);
    }
    
    public Category createCategory(Category category, String adminEmail) {
        if (categoryRepository.existsByName(category.getName())) {
            throw new IllegalArgumentException("Category with this name already exists");
        }
        
        Category savedCategory = categoryRepository.save(category);
        
        // Log this activity
        adminService.getAdminByEmail(adminEmail).ifPresent(admin -> 
            adminService.logAdminActivity(admin, "CATEGORY_CREATED", 
                "Created category: " + category.getName()));
        
        return savedCategory;
    }
    
    public Category updateCategory(Category category, String adminEmail) {
        if (!categoryRepository.existsById(category.getId())) {
            throw new IllegalArgumentException("Category not found");
        }
        
        if (categoryRepository.findByName(category.getName())
                .filter(c -> !c.getId().equals(category.getId()))
                .isPresent()) {
            throw new IllegalArgumentException("Another category with this name already exists");
        }
        
        Category savedCategory = categoryRepository.save(category);
        
        // Log this activity
        adminService.getAdminByEmail(adminEmail).ifPresent(admin -> 
            adminService.logAdminActivity(admin, "CATEGORY_UPDATED", 
                "Updated category: " + category.getName()));
        
        return savedCategory;
    }
    
    public void deleteCategory(Long id, String adminEmail) {
        categoryRepository.findById(id).ifPresent(category -> {
            categoryRepository.deleteById(id);
            
            // Log this activity
            adminService.getAdminByEmail(adminEmail).ifPresent(admin -> 
                adminService.logAdminActivity(admin, "CATEGORY_DELETED", 
                    "Deleted category: " + category.getName()));
        });
    }
}