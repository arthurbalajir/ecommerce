package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.ProductDTO;
import com.ecommerce.backend.dto.ProductImageDTO;
import com.ecommerce.backend.dto.StockUpdateRequest;
import com.ecommerce.backend.model.Category;
import com.ecommerce.backend.model.Product;
import com.ecommerce.backend.model.ProductImage;
import com.ecommerce.backend.model.User;
import com.ecommerce.backend.service.AuthService;
import com.ecommerce.backend.service.CategoryService;
import com.ecommerce.backend.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class ProductController {
    
    @Autowired
    private ProductService productService;
    
    @Autowired
    private CategoryService categoryService;
    
    @Autowired
    private AuthService authService;
    
    @GetMapping("/products")
public ResponseEntity<?> getAllProducts(
        @RequestParam(required = false) Long categoryId,
        @RequestParam(required = false) String search,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size) {

    Page<Product> products;

    if (search != null && !search.isEmpty()) {
        products = productService.searchProducts(search, PageRequest.of(page, size));
        return ResponseEntity.ok(products.map(this::convertToDTO));
    }

    if (categoryId != null) {
        return categoryService.getCategoryById(categoryId)
                .map(category -> {
                    Page<Product> categoryProducts = productService.getProductsByCategory(category, PageRequest.of(page, size));
                    return ResponseEntity.ok(categoryProducts.map(this::convertToDTO));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    products = productService.getAllProducts(PageRequest.of(page, size));
    return ResponseEntity.ok(products.map(this::convertToDTO));
}

    
    @GetMapping("/products/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        return productService.getProductById(id)
                .map(this::convertToDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping("/admin/products")
    public ResponseEntity<?> createProduct(
            @Valid @RequestBody ProductDTO productDTO,
            @RequestHeader("Authorization") String tokenHeader) {
        
        String token = tokenHeader.replace("Bearer ", "");
        User admin = authService.getUserFromToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired token"));
        
        Category category = categoryService.getCategoryById(productDTO.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));
        
        Product product = new Product();
        product.setName(productDTO.getName());
        product.setDescription(productDTO.getDescription());
        product.setPrice(productDTO.getPrice());
        product.setStock(productDTO.getStock());
        product.setImageUrl(productDTO.getImageUrl());
        product.setCategory(category);
        
        Product savedProduct = productService.createProduct(product, admin.getEmail());
        
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(savedProduct));
    }
    
    @PutMapping("/admin/products/{id}")
    public ResponseEntity<?> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductDTO productDTO,
            @RequestHeader("Authorization") String tokenHeader) {
        
        String token = tokenHeader.replace("Bearer ", "");
        User admin = authService.getUserFromToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired token"));
        
        return productService.getProductById(id)
                .map(existingProduct -> {
                    Category category = categoryService.getCategoryById(productDTO.getCategoryId())
                            .orElseThrow(() -> new IllegalArgumentException("Category not found"));
                    
                    existingProduct.setName(productDTO.getName());
                    existingProduct.setDescription(productDTO.getDescription());
                    existingProduct.setPrice(productDTO.getPrice());
                    existingProduct.setStock(productDTO.getStock());
                    existingProduct.setImageUrl(productDTO.getImageUrl());
                    existingProduct.setCategory(category);
                    
                    Product updatedProduct = productService.updateProduct(existingProduct, admin.getEmail());
                    return ResponseEntity.ok(convertToDTO(updatedProduct));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PatchMapping("/admin/products/{id}/stock")
    public ResponseEntity<?> updateProductStock(
            @PathVariable Long id,
            @Valid @RequestBody StockUpdateRequest request,
            @RequestHeader("Authorization") String tokenHeader) {
        
        String token = tokenHeader.replace("Bearer ", "");
        User admin = authService.getUserFromToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired token"));
        
        try {
            Product updatedProduct = productService.updateProductStock(id, request.getStock(), admin.getEmail());
            return ResponseEntity.ok(convertToDTO(updatedProduct));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/admin/products/{id}")
    public ResponseEntity<?> deleteProduct(
            @PathVariable Long id,
            @RequestHeader("Authorization") String tokenHeader) {
        
        String token = tokenHeader.replace("Bearer ", "");
        User admin = authService.getUserFromToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired token"));
        
        if (!productService.getProductById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        productService.deleteProduct(id, admin.getEmail());
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/admin/products/{productId}/images")
    public ResponseEntity<?> addProductImage(
            @PathVariable Long productId,
            @Valid @RequestBody ProductImageDTO imageDTO,
            @RequestHeader("Authorization") String tokenHeader) {
        
        String token = tokenHeader.replace("Bearer ", "");
        User admin = authService.getUserFromToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired token"));
        
        try {
            ProductImage savedImage = productService.addProductImage(
                    productId, imageDTO.getImageUrl(), admin.getEmail());
            
            ProductImageDTO responseDTO = new ProductImageDTO();
            responseDTO.setId(savedImage.getId());
            responseDTO.setProductId(productId);
            responseDTO.setImageUrl(savedImage.getImageUrl());
            responseDTO.setIsMain(savedImage.getIsMain());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/admin/products/images/{imageId}")
    public ResponseEntity<?> deleteProductImage(
            @PathVariable Long imageId,
            @RequestHeader("Authorization") String tokenHeader) {
        
        String token = tokenHeader.replace("Bearer ", "");
        User admin = authService.getUserFromToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired token"));
        
        productService.deleteProductImage(imageId, admin.getEmail());
        return ResponseEntity.ok().build();
    }
    
    @PatchMapping("/admin/products/images/{imageId}/main")
    public ResponseEntity<?> setMainProductImage(
            @PathVariable Long imageId,
            @RequestHeader("Authorization") String tokenHeader) {
        
        String token = tokenHeader.replace("Bearer ", "");
        User admin = authService.getUserFromToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired token"));
        
        try {
            productService.setMainProductImage(imageId, admin.getEmail());
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    private ProductDTO convertToDTO(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setStock(product.getStock());
        dto.setImageUrl(product.getImageUrl());
        
        if (product.getCategory() != null) {
            dto.setCategoryId(product.getCategory().getId());
            dto.setCategoryName(product.getCategory().getName());
        }
        
        dto.setCreatedAt(product.getCreatedAt());
        dto.setUpdatedAt(product.getUpdatedAt());
        
        // Include product images
        List<ProductImageDTO> imageDTOs = product.getImages().stream()
                .map(image -> {
                    ProductImageDTO imageDTO = new ProductImageDTO();
                    imageDTO.setId(image.getId());
                    imageDTO.setProductId(product.getId());
                    imageDTO.setImageUrl(image.getImageUrl());
                    imageDTO.setIsMain(image.getIsMain());
                    return imageDTO;
                })
                .collect(Collectors.toList());
        dto.setImages(imageDTOs);
        
        return dto;
    }
}