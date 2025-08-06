import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getAllOrders } from '../../store/slices/orderSlice';
import { getProducts } from '../../store/slices/productSlice';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';
import Button from '../../components/common/Button';
import AuthDebugger from '../../components/debug/AuthDebugger';

import Header from '../../components/layout/Header';
const Dashboard = () => {
  const dispatch = useDispatch();
  const { orders, isLoading: ordersLoading, isError: ordersError } = useSelector(state => state.orders);
  const { products, isLoading: productsLoading } = useSelector(state => state.products);
  const [error, setError] = useState(null);
  
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load products first since they're public
        await dispatch(getProducts({ page: 0, size: 100 })).unwrap();
        
        // Then try to load orders which require admin access
        try {
          await dispatch(getAllOrders({ page: 0, size: 100 })).unwrap();
        } catch (orderError) {
          console.error('Error loading orders:', orderError);
          setError(`Failed to load orders: ${orderError.message || 'Access denied'}. This may indicate an authentication issue.`);
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data. Please check your connection and try again.');
      }
    };
    
    loadData();
  }, [dispatch]);

  useEffect(() => {
    if (orders && orders.length > 0) {
      const pendingOrders = orders.filter(order => order.status === 'Pending').length;
      const totalRevenue = orders
        .filter(order => order.status !== 'Cancelled')
        .reduce((sum, order) => sum + parseFloat(order.totalAmount || 0), 0);
      
      setStats(prev => ({
        ...prev,
        totalOrders: orders.length,
        pendingOrders,
        totalRevenue
      }));
    }
  }, [orders]);

  useEffect(() => {
    if (products && products.length > 0) {
      const lowStockProducts = products.filter(product => product.stock < 10).length;
      
      setStats(prev => ({
        ...prev,
        totalProducts: products.length,
        lowStockProducts
      }));
    }
  }, [products]);

  const handleRelogin = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/admin-login';
  };

  const isLoading = ordersLoading && productsLoading;

  // Create error message component that doesn't nest incorrectly
  const errorMessage = (
    <>
      {error}
      {error && error.includes('authentication') && (
        <div className="mt-2">
          <Button 
            size="sm"
            onClick={handleRelogin}
          >
            Re-login as Admin
          </Button>
        </div>
      )}
    </>
  );

  return (
    <>
     
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {/* Auth debugger */}
      <AuthDebugger />
      
      {error && (
        <Alert 
          type="error" 
          message={errorMessage}
          className="mb-6" 
        />
      )}
      
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader size="lg" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-gray-500">Total Orders</p>
                  <p className="text-2xl font-semibold">{stats.totalOrders}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-gray-500">Pending Orders</p>
                  <p className="text-2xl font-semibold">{stats.pendingOrders}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-semibold">${stats.totalRevenue.toFixed(2)}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-red-100 text-red-600">
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-gray-500">Low Stock Products</p>
                  <p className="text-2xl font-semibold">{stats.lowStockProducts}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Products section - will show even if orders fail */}
          <div className="bg-white rounded-lg shadow-md mb-8">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Products Overview</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700">Total products in inventory: <strong>{products.length}</strong></p>
              <p className="text-gray-700">Low stock products: <strong>{products.filter(p => p.stock < 10).length}</strong></p>
              <p className="text-gray-700">Out of stock products: <strong>{products.filter(p => p.stock === 0).length}</strong></p>
            </div>
          </div>

          {/* Only show orders section if we successfully loaded orders */}
          {orders && orders.length > 0 && (
            <div className="bg-white rounded-lg shadow-md mb-8">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold">Recent Orders</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.slice(0, 5).map(order => (
                      <tr key={order.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {order.trackingId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.customerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.orderDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${parseFloat(order.totalAmount).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                              order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' : 
                                order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                                  'bg-red-100 text-red-800'}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
    </>
  );
};

export default Dashboard;