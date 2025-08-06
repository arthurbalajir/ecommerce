import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';
import Button from './Button';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();

  const handleAddToCart = () => {
    dispatch(addToCart({ product, quantity: 1 }));
  };

  return (
   <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 w-full max-w-xs mx-auto">
      <Link to={`/products/${product.id}`}>
        <div className="h-48 overflow-hidden rounded-t-xl">
          <img 
            src={product.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'} 
            alt={product.name} 
            className="w-full h-full object-cover object-center transition-transform duration-300 hover:scale-105"
          />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate">{product.name}</h3>
          <p className="text-gray-500 text-sm mb-1 truncate">{product.categoryName}</p>
          <p className="text-xl font-bold text-primary-700 mb-2">${parseFloat(product.price).toFixed(2)}</p>
        </div>
      </Link>
      <div className="px-4 pb-4">
        <Button 
          onClick={handleAddToCart}
          fullWidth
          disabled={product.stock <= 0}
        >
          {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
