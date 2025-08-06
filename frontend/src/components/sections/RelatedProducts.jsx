import React, { useEffect, useState } from 'react';
import productService from '../../services/productService';
import ProductCard from '../common/ProductCard';

const RelatedProducts = ({ categoryId, currentProductId }) => {
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const response = await productService.getAllProducts(0, 4, categoryId);
        const filtered = response.content?.filter(p => p.id !== currentProductId);
        setRelatedProducts(filtered);
      } catch (error) {
        console.error('Error fetching related products:', error);
      }
    };

    if (categoryId) fetchRelated();
  }, [categoryId, currentProductId]);

  if (!relatedProducts.length) return null;

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Related Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {relatedProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
