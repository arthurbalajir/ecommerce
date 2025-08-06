import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProducts } from '../../store/slices/productSlice';
import { getCategories } from '../../store/slices/categorySlice';
import ProductCard from '../../components/common/ProductCard';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import ProductRoller from './ProductRoller';

const Home = () => {
  const dispatch = useDispatch();
  const { products, isLoading } = useSelector(state => state.products);
  const { categories } = useSelector(state => state.categories);

  useEffect(() => {
    dispatch(getProducts({ page: 0, size: 8 }));
    dispatch(getCategories());
  }, [dispatch]);

  return (
    <div>
      {/* Hero Section */}
      <div className="relative bg-gray-900 text-white overflow-hidden min-h-[500px]">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1607082352121-fa243f3dde32?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
            alt="Hero"
            className="w-full h-full object-cover object-center opacity-50"
          />
        </div>

        <div className="relative container mx-auto px-4 py-32 sm:px-6 sm:py-40 lg:px-8">
          <div className="max-w-xl">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Shop with Confidence
            </h1>
            <p className="mt-4 text-xl">
              Discover quality products at unbeatable prices. Free shipping on all orders.
            </p>
            <div className="mt-10">
              <Link to="/products">
                <Button size="lg">Shop Now</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* ✅ Adjusted Product Roller Position (moved upward) */}
        {!isLoading && products.length > 0 && (
          <div className="absolute top-1 right-4 transform -translate-y-1/2 z-20 hidden lg:block">
            <ProductRoller products={products.slice(0, 6)} />
          </div>
        )}
      </div>

      {/* Featured Products */}
      <div className="bg-gray-100 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900">Featured Products</h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Check out our latest and most popular items
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center">
              <Loader size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.slice(0, 8).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
