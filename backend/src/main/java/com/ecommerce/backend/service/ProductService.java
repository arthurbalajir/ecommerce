package com.ecommerce.backend.service;

import com.ecommerce.backend.model.Category;
import com.ecommerce.backend.model.Product;
import com.ecommerce.backend.model.ProductImage;
import com.ecommerce.backend.repository.ProductImageRepository;
import com.ecommerce.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class ProductService {
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private ProductImageRepository productImageRepository;
    
    @Autowired
    private AdminService adminService;
    
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }
    
    public Page<Product> getAllProducts(Pageable pageable) {
        return productRepository.findAll(pageable);
    }
    
public Page<Product> searchProducts(String keyword, Pageable pageable) {
    return productRepository.searchByKeywordPaged(keyword, pageable);
}


    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }
    
    public List<Product> getProductsByCategory(Category category) {
        return productRepository.findByCategory(category);
    }
    
    public Page<Product> getProductsByCategory(Category category, Pageable pageable) {
        return productRepository.findByCategory(category, pageable);
    }
    
    public List<Product> searchProducts(String keyword) {
        return productRepository.searchByKeyword(keyword);
    }
    
    public List<Product> getProductsByPriceRange(BigDecimal minPrice, BigDecimal maxPrice) {
        return productRepository.findByPriceRange(minPrice, maxPrice);
    }
    
    public List<Product> getLowStockProducts(int threshold) {
        return productRepository.findByStockLessThan(threshold);
    }
    
    @Transactional
    public Product createProduct(Product product, String adminEmail) {
        Product savedProduct = productRepository.save(product);
        
        // Log this activity
        adminService.getAdminByEmail(adminEmail).ifPresent(admin -> 
            adminService.logAdminActivity(admin, "PRODUCT_CREATED", 
                "Created product: " + product.getName()));
        
        return savedProduct;
    }
    
    @Transactional
    public Product updateProduct(Product product, String adminEmail) {
        if (!productRepository.existsById(product.getId())) {
            throw new IllegalArgumentException("Product not found");
        }
        
        Product savedProduct = productRepository.save(product);
        
        // Log this activity
        adminService.getAdminByEmail(adminEmail).ifPresent(admin -> 
            adminService.logAdminActivity(admin, "PRODUCT_UPDATED", 
                "Updated product: " + product.getName()));
        
        return savedProduct;
    }
    
    @Transactional
    public Product updateProductStock(Long id, Integer stock, String adminEmail) {
        return productRepository.findById(id)
                .map(product -> {
                    product.setStock(stock);
                    Product savedProduct = productRepository.save(product);
                    
                    // Log this activity
                    adminService.getAdminByEmail(adminEmail).ifPresent(admin -> 
                        adminService.logAdminActivity(admin, "PRODUCT_STOCK_UPDATED", 
                            "Updated stock for product: " + product.getName() + " to " + stock));
                    
                    return savedProduct;
                })
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));
    }
    
    @Transactional
    public void deleteProduct(Long id, String adminEmail) {
        productRepository.findById(id).ifPresent(product -> {
            productRepository.deleteById(id);
            
            // Log this activity
            adminService.getAdminByEmail(adminEmail).ifPresent(admin -> 
                adminService.logAdminActivity(admin, "PRODUCT_DELETED", 
                    "Deleted product: " + product.getName()));
        });
    }
    
    @Transactional
    public ProductImage addProductImage(Long productId, String imageUrl, String adminEmail) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));
        
        ProductImage image = new ProductImage();
        image.setProduct(product);
        image.setImageUrl(imageUrl);
        
        // If it's the first image, make it the main image
        if (productImageRepository.findByProduct(product).isEmpty()) {
            image.setIsMain(true);
        }
        
        ProductImage savedImage = productImageRepository.save(image);
        
        // Log this activity
        adminService.getAdminByEmail(adminEmail).ifPresent(admin -> 
            adminService.logAdminActivity(admin, "PRODUCT_IMAGE_ADDED", 
                "Added image for product: " + product.getName()));
        
        return savedImage;
    }
    
    @Transactional
    public void deleteProductImage(Long imageId, String adminEmail) {
        productImageRepository.findById(imageId).ifPresent(image -> {
            String productName = image.getProduct().getName();
            productImageRepository.deleteById(imageId);
            
            // Log this activity
            adminService.getAdminByEmail(adminEmail).ifPresent(admin -> 
                adminService.logAdminActivity(admin, "PRODUCT_IMAGE_DELETED", 
                    "Deleted image for product: " + productName));
        });
    }
    
    @Transactional
    public void setMainProductImage(Long imageId, String adminEmail) {
        ProductImage newMainImage = productImageRepository.findById(imageId)
                .orElseThrow(() -> new IllegalArgumentException("Image not found"));
        
        Product product = newMainImage.getProduct();
        
        // Reset all images for this product
        productImageRepository.findByProduct(product).forEach(image -> {
            image.setIsMain(false);
            productImageRepository.save(image);
        });
        
        // Set the new main image
        newMainImage.setIsMain(true);
        productImageRepository.save(newMainImage);
        
        // Log this activity
        adminService.getAdminByEmail(adminEmail).ifPresent(admin -> 
            adminService.logAdminActivity(admin, "PRODUCT_MAIN_IMAGE_UPDATED", 
                "Set main image for product: " + product.getName()));
    }
}