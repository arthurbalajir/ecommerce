import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getProducts, searchProducts } from '../../store/slices/productSlice';
import { getCategories } from '../../store/slices/categorySlice';
import ProductCard from '../common/ProductCard';
import Loader from '../common/Loader';
import Alert from '../common/Alert';

const ProductList = ({ categoryId = null, page = 0, setTotalPages, search = '' }) => {
  const dispatch = useDispatch();
  const { products, isLoading, isError, message, totalPages } = useSelector(state => state.products);

  useEffect(() => {
    if (search) {
      dispatch(searchProducts({ keyword: search, page, size: 12 }));
    } else {
      dispatch(getProducts({ page, size: 12, categoryId }));
    }
  }, [dispatch, page, categoryId, search]);

  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);

  useEffect(() => {
    if (setTotalPages) {
      setTotalPages(totalPages);
    }
  }, [totalPages, setTotalPages]);

  if (isLoading) {
    return (
      <div className="py-10">
        <Loader size="lg" />
      </div>
    );
  }

  if (isError) {
    return <Alert type="error" message={message || 'Failed to load products'} />;
  }

  if (products.length === 0) {
    return <Alert type="info" message="No products found" />;
  }

  return (
  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 px-2 sm:px-0">

      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductList;
