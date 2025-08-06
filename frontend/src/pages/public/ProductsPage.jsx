import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getCategories } from '../../store/slices/categorySlice';
import ProductList from '../../components/sections/ProductList';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';

const ProductsPage = () => {
  const dispatch = useDispatch();
  const { categories, isLoading: categoriesLoading } = useSelector(state => state.categories);
  const [searchParams, setSearchParams] = useSearchParams();

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);

  useEffect(() => {
    const categoryId = searchParams.get('category');
    const search = searchParams.get('search');

    setSelectedCategory(categoryId ? Number(categoryId) : null);
    setSearchTerm(search || '');
    setCurrentPage(0);
  }, [searchParams]);

  const handleCategoryClick = (categoryId) => {
    const newParams = {};
    if (searchTerm) newParams.search = searchTerm;

    if (selectedCategory === categoryId) {
      setSearchParams({ ...newParams });
    } else {
      setSearchParams({ ...newParams, category: categoryId });
    }
    setCurrentPage(0);
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prevPage => prevPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Products</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar (hidden on mobile) */}
        <div className="hidden md:block md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="font-semibold text-lg mb-4">Categories</h2>

            {categoriesLoading ? (
              <Loader />
            ) : (
              <div className="space-y-2">
                <button
                  onClick={() => setSearchParams(searchTerm ? { search: searchTerm } : {})}
                  className={`w-full text-left px-3 py-2 rounded-md ${
                    selectedCategory === null ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100'
                  }`}
                >
                  All Products
                </button>
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-md ${
                      selectedCategory === category.id ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-3">
          <ProductList
            categoryId={selectedCategory}
            page={currentPage}
            setTotalPages={setTotalPages}
            search={searchTerm}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 0}
                >
                  Previous
                </Button>
                <div className="px-3 py-1 bg-white rounded-md border">
                  Page {currentPage + 1} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages - 1}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
