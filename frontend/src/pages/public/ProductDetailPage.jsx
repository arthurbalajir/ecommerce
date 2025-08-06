import React, { useEffect, useState } from 'react'; 
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProductById, resetProduct } from '../../store/slices/productSlice';
import { addToCart } from '../../store/slices/cartSlice';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';
import RelatedProducts from '../../components/sections/RelatedProducts';

const ProductDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { product, isLoading, isError, message } = useSelector(state => state.products);
  
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState('');
const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    dispatch(getProductById(id));
    return () => {
      dispatch(resetProduct());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (product) {
      if (product.imageUrl) {
        setSelectedImage(product.imageUrl);
      } else if (product.images && product.images.length > 0) {
        const mainImage = product.images.find(img => img.isMain);
        setSelectedImage(mainImage ? mainImage.imageUrl : product.images[0].imageUrl);
      }
    }
  }, [product]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= (product?.stock || 1)) {
      setQuantity(value);
    }
  };

  const handleIncrement = () => {
    if (quantity < (product?.stock || 1)) {
      setQuantity(prev => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

 const handleAddToCart = () => {
  dispatch(addToCart({ product, quantity }));
  setShowToast(true);
  setTimeout(() => setShowToast(false), 2500);
};


  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-8">
        <Alert type="error" message={message || 'Failed to load product details'} />
        <div className="mt-4">
          <Link to="/products" className="text-primary-600 hover:underline">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert type="info" message="Product not found" />
        <div className="mt-4">
          <Link to="/products" className="text-primary-600 hover:underline">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/products" className="text-primary-600 hover:underline flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Products
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="md:flex items-start">
          {/* Product Images */}
          <div className="md:w-1/2 p-4">
            <div className="h-80 sm:h-[26rem] mb-4">
              <img 
                src={selectedImage || 'https://via.placeholder.com/600x600?text=No+Image'} 
                alt={product.name} 
                className="w-full h-full object-contain rounded-lg"
              />
            </div>

            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-5 gap-2 mt-4">
                {product.imageUrl && (
                  <button
                    onClick={() => setSelectedImage(product.imageUrl)}
                    className={`border rounded-md overflow-hidden ${
                      selectedImage === product.imageUrl ? 'border-primary-500 ring-2 ring-primary-500' : 'border-gray-200'
                    }`}
                  >
                    <img 
                      src={product.imageUrl} 
                      alt={`${product.name} main`} 
                      className="w-full h-12 object-cover sm:h-16"
                    />
                  </button>
                )}
                {product.images.map(image => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImage(image.imageUrl)}
                    className={`border rounded-md overflow-hidden ${
                      selectedImage === image.imageUrl ? 'border-primary-500 ring-2 ring-primary-500' : 'border-gray-200'
                    }`}
                  >
                    <img 
                      src={image.imageUrl} 
                      alt={`${product.name} thumbnail`} 
                      className="w-full h-16 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Product Details */}
          <div className="md:w-1/2 p-6">
            <div className="mb-2">
              <Link 
                to={`/products?category=${product.categoryId}`} 
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                {product.categoryName}
              </Link>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
            
            <div className="text-3xl font-bold text-primary-700 mb-4">
              ${parseFloat(product.price).toFixed(2)}
            </div>
            
            <div className="mb-6">
              <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                product.stock > 10 
                  ? 'bg-green-100 text-green-800' 
                  : product.stock > 0 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-red-100 text-red-800'
              }`}>
                {product.stock > 10 
                  ? 'In Stock' 
                  : product.stock > 0 
                    ? `Only ${product.stock} left` 
                    : 'Out of Stock'}
              </div>
            </div>
            
            <div className="border-t border-gray-200 py-4 mb-4">
              <p className="text-gray-700">
                {product.description || 'No description available'}
              </p>
            </div>
            
            {product.stock > 0 && (
              <div className="mb-6">
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex">
                  <button
                    type="button"
                    onClick={handleDecrement}
                    className="p-2 border border-gray-300 rounded-l-md bg-gray-50"
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                    </svg>
                  </button>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="w-16 border-t border-b border-gray-300 text-center"
                  />
                  <button
                    type="button"
                    onClick={handleIncrement}
                    className="p-2 border border-gray-300 rounded-r-md bg-gray-50"
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
              <Button 
  onClick={() => {
    const singleOrderItem = {
      product,
      quantity
    };
    localStorage.setItem('singleCheckoutItem', JSON.stringify(singleOrderItem));
    window.location.href = '/checkout?single=true';
  }}
  disabled={product.stock <= 0}
  size="md"
  fullWidth
>
  Buy Now
</Button>


              <Button 
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                size="md"
                fullWidth
              >
                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </Button>

              <Link to="/cart" className="w-full sm:w-auto">
                
              </Link>
            </div>
          </div>
        </div>
      </div>

      {product?.categoryId && (
        <RelatedProducts categoryId={product.categoryId} currentProductId={product.id} />
      )}
      {showToast && (
  <div className="fixed bottom-6 right-6 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50 animate-slide-in-out">
    ✅ Added to Cart
  </div>
)}
<style>
  {`
    @keyframes slideInOut {
      0% { transform: translateY(100%); opacity: 0; }
      10% { transform: translateY(0); opacity: 1; }
      90% { transform: translateY(0); opacity: 1; }
      100% { transform: translateY(100%); opacity: 0; }
    }

    .animate-slide-in-out {
      animation: slideInOut 2.5s ease-in-out forwards;
    }
  `}
</style>

    </div>
  );
};

export default ProductDetailPage;
