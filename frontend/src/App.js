import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { store } from './store';
import { setUser } from './store/slices/authSlice';
// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Sidebar from './components/layout/Sidebar';

// Public Pages
import Home from './pages/public/Home';
import ProductsPage from './pages/public/ProductsPage';
import ProductDetailPage from './pages/public/ProductDetailPage';
import CartPage from './pages/public/CartPage';
import CheckoutPage from './pages/public/CheckoutPage';
import OrderConfirmationPage from './pages/public/OrderConfirmationPage';
import TrackOrderPage from './pages/public/TrackOrderPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import AdminLoginPage from './pages/public/AdminLoginPage';
import MyOrdersPage from './pages/public/MyOrdersPage';
// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import ProductManagement from './pages/admin/ProductManagement';
import CategoryManagement from './pages/admin/CategoryManagement';
import OrderManagement from './pages/admin/OrderManagement';
import AdminManagement from './pages/admin/AdminManagement';
import ActivityLogs from './pages/admin/ActivityLogs';

// Auth State Provider
const AuthStateProvider = ({ children }) => {
  const dispatch = useDispatch();
  
  useEffect(() => {
    // Check for user in localStorage and update Redux store
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) {
        dispatch(setUser(user));
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
    }
  }, [dispatch]);
  
  return children;
};

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  // Get auth state from Redux instead of direct localStorage access
  const { user } = useSelector(state => state.auth);
  const isAuth = !!user;
  const isAdmin = user && user.isAdmin === true;
  
  console.log('ProtectedRoute - User:', user);
  console.log('ProtectedRoute - isAuth:', isAuth);
  console.log('ProtectedRoute - isAdmin:', isAdmin);
  console.log('ProtectedRoute - adminOnly:', adminOnly);
  
  if (!isAuth) {
    return <Navigate to="/login" />;
  }
  
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" />;
  }
  
  return children;
};

// Admin Layout Component
const AdminLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <Sidebar />
        </div>
      </div>
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="md:hidden">
          <Sidebar />
        </div>
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
};

// Public Layout Component
const PublicLayout = ({ children }) => {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
    </>
  );
};

function AppContent() {
  return (
    <AuthStateProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={
            <PublicLayout>
              <Home />
            </PublicLayout>
          } />
          <Route path="/products" element={
            <PublicLayout>
              <ProductsPage />
            </PublicLayout>
          } />
          <Route path="/products/:id" element={
            <PublicLayout>
              <ProductDetailPage />
            </PublicLayout>
          } />
           <Route path="/my-orders" element={
            <PublicLayout>
              <MyOrdersPage />
            </PublicLayout>
          } />
          <Route path="/cart" element={
            <PublicLayout>
              <CartPage />
            </PublicLayout>
          } />
          <Route path="/checkout" element={
            <PublicLayout>
              <CheckoutPage />
            </PublicLayout>
          } />
          <Route path="/order-confirmation/:trackingId" element={
            <PublicLayout>
              <OrderConfirmationPage />
            </PublicLayout>
          } />
          <Route path="/track-order" element={
            <PublicLayout>
              <TrackOrderPage />
            </PublicLayout>
          } />
          <Route path="/login" element={
            <PublicLayout>
              <LoginPage />
            </PublicLayout>
          } />
          <Route path="/register" element={
            <PublicLayout>
              <RegisterPage />
            </PublicLayout>
          } />
          <Route path="/admin-login" element={
            <PublicLayout>
              <AdminLoginPage />
            </PublicLayout>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute adminOnly={true}>
              <AdminLayout>
                <Dashboard />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/products" element={
            <ProtectedRoute adminOnly={true}>
              <AdminLayout>
                <ProductManagement />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/categories" element={
            <ProtectedRoute adminOnly={true}>
              <AdminLayout>
                <CategoryManagement />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/orders" element={
            <ProtectedRoute adminOnly={true}>
              <AdminLayout>
                <OrderManagement />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/admins" element={
            <ProtectedRoute adminOnly={true}>
              <AdminLayout>
                <AdminManagement />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/activity-logs" element={
            <ProtectedRoute adminOnly={true}>
              <AdminLayout>
                <ActivityLogs />
              </AdminLayout>
            </ProtectedRoute>
          } />
          
          {/* Catch-all route */}
          <Route path="*" element={
            <PublicLayout>
              <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
                <p className="mb-6">The page you are looking for doesn't exist or has been moved.</p>
                <button 
                  onClick={() => window.history.back()} 
                  className="btn btn-primary mr-4"
                >
                  Go Back
                </button>
                <a href="/" className="btn btn-outline">Go Home</a>
              </div>
            </PublicLayout>
          } />
        </Routes>
      </Router>
    </AuthStateProvider>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;