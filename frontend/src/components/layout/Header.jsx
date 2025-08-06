import React, { useState, useEffect } from 'react'; 
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import categoryService from '../../services/categoryService';
import Button from '../common/Button';

// Utility to truncate names longer than maxLen (default 16)
const getShortName = (name, maxLen = 16) => {
  if (!name) return '';
  return name.length > maxLen ? name.slice(0, maxLen - 2) + '…' : name;
};

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { totalQuantity } = useSelector((state) => state.cart);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getAllCategories();
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories', error);
      }
    };
    fetchCategories();
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className={`sticky top-0 z-30 w-full transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-white'}`}>
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left: Logo and Mobile Hamburger */}
        <div className="flex items-center space-x-4 flex-shrink-0">
          <button className="md:hidden focus:outline-none" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <svg className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link to="/" className="text-xl font-bold text-primary-700 whitespace-nowrap">E-Commerce</Link>
        </div>

        {/* Center: Desktop Navigation */}
        <div className="hidden md:flex space-x-6">
          <Link to="/" className="text-gray-700 hover:text-primary-700 font-medium">Home</Link>
          <Link to="/products" className="text-gray-700 hover:text-primary-700 font-medium">Products</Link>
          <div className="relative">
            <button
              onClick={() => setIsCatDropdownOpen(!isCatDropdownOpen)}
              className="text-gray-700 hover:text-primary-700 font-medium focus:outline-none flex items-center"
            >
              Categories
              <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isCatDropdownOpen && (
              <div className="absolute top-full mt-2 bg-white shadow-lg rounded-md w-48 z-20 border">
                {categories.map((cat) => (
                  <Link
                    key={cat._id}
                    to={`/products?category=${encodeURIComponent(cat.name)}`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsCatDropdownOpen(false)}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search bar - Desktop only */}
        <div className="flex-1 mx-4 max-w-lg hidden md:block">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearch}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>
        </div>

        {/* Right: Cart and Auth */}
        <div className="flex items-center space-x-4">
          <Link to="/cart" className="text-gray-600 hover:text-primary-700 relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {totalQuantity > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {totalQuantity}
              </span>
            )}
          </Link>

          {!user && (
            <div className="hidden md:flex space-x-2">
              <Link to="/login"><Button variant="outline" size="sm">Login</Button></Link>
              <Link to="/register"><Button size="sm">Register</Button></Link>
            </div>
          )}

          {user && (
            <div className="relative hidden md:block">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-1 text-gray-700 focus:outline-none"
              >
                <span className="font-medium max-w-[120px] truncate" title={user.name}>
                  {getShortName(user.name)}
                </span>
                <svg className={`h-5 w-5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border">
                  {user.isAdmin && (
                    <Link to="/admin/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsDropdownOpen(false)}>Admin Dashboard</Link>
                  )}
                  <Link to="/my-orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsDropdownOpen(false)}>My Orders</Link>
                  <Link to="/track-order" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsDropdownOpen(false)}>Track Order</Link>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Logout</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ✅ Mobile Search Bar */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
            </svg>
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearch}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg border-t border-gray-200">
          <div className="px-4 py-3 space-y-3">
            <Link to="/" className="block text-gray-700" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
            <Link to="/products" className="block text-gray-700" onClick={() => setIsMobileMenuOpen(false)}>Products</Link>

            <div>
              <button className="w-full text-left text-gray-700" onClick={() => setIsCatDropdownOpen(!isCatDropdownOpen)}>
                Categories
              </button>
              {isCatDropdownOpen && (
                <div className="mt-2 space-y-1">
                  {categories.map(cat => (
                    <Link
                      key={cat._id}
                      to={`/products?category=${encodeURIComponent(cat.name)}`}
                      className="block text-sm text-gray-600 ml-4"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {!user ? (
              <>
                <Link to="/login" className="block text-gray-700" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
                <Link to="/register" className="block text-gray-700" onClick={() => setIsMobileMenuOpen(false)}>Register</Link>
              </>
            ) : (
              <>
                {user.isAdmin && (
                  <Link to="/admin/dashboard" className="block text-gray-700" onClick={() => setIsMobileMenuOpen(false)}>Admin Dashboard</Link>
                )}
                <Link to="/my-orders" className="block text-gray-700" onClick={() => setIsMobileMenuOpen(false)}>My Orders</Link>
                <Link to="/track-order" className="block text-gray-700" onClick={() => setIsMobileMenuOpen(false)}>Track Order</Link>
                <button onClick={handleLogout} className="block text-left text-gray-700 w-full">Logout</button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;