package com.ecommerce.backend.repository;


import com.ecommerce.backend.model.Product;
import com.ecommerce.backend.model.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {
    
    List<ProductImage> findByProduct(Product product);
    
    Optional<ProductImage> findByProductAndIsMainTrue(Product product);
    
    void deleteByProduct(Product product);
}