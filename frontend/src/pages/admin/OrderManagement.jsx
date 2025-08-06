import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllOrders, getOrderDetails, updateOrderStatus } from '../../store/slices/orderSlice';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';

const OrderManagement = () => {
  const dispatch = useDispatch();
  const { orders, order, isLoading, isError, message, totalPages, currentPage } = useSelector(state => state.orders);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  
  useEffect(() => {
    dispatch(getAllOrders({ page, size: 10, status: statusFilter || null }));
  }, [dispatch, page, statusFilter]);
  
  const viewOrderDetails = (id) => {
    dispatch(getOrderDetails(id))
      .unwrap()
      .then(() => setIsModalOpen(true));
  };
  
  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
  };
  
  const handleUpdateStatus = () => {
    if (selectedStatus && order) {
      dispatch(updateOrderStatus({ id: order.id, status: selectedStatus }))
        .unwrap()
        .then(() => {
          // Refresh the orders list
          dispatch(getAllOrders({ page, size: 10, status: statusFilter || null }));
        });
    }
  };
  
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(0); // Reset to first page when filter changes
  };
  
  const handlePrevPage = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };
  
  const handleNextPage = () => {
    if (page < totalPages - 1) {
      setPage(page + 1);
    }
  };

  // Helper function to get status badge color
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Shipped':
        return 'bg-blue-100 text-blue-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <div className="flex items-center">
          <label htmlFor="statusFilter" className="mr-2 text-sm font-medium text-gray-700">
            Filter by Status:
          </label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Orders</option>
            <option value="Pending">Pending</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>
      
      {isError && <Alert type="error" message={message} className="mb-6" />}
      
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader size="lg" />
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                        No orders found
                      </td>
                    </tr>
                  ) : (
                    orders.map(order => (
                      <tr key={order.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {order.trackingId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {order.customerName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.customerPhone}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.orderDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${parseFloat(order.totalAmount).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => viewOrderDetails(order.id)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  onClick={handlePrevPage}
                  disabled={page === 0}
                >
                  Previous
                </Button>
                <div className="px-3 py-1 bg-white rounded-md border">
                  Page {page + 1} of {totalPages}
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleNextPage}
                  disabled={page === totalPages - 1}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
      
      {/* Order Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Order Details"
        size="lg"
      >
        {order && (
          <div>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-medium">Order #{order.trackingId}</h3>
                  <p className="text-sm text-gray-500">
                    Placed on {new Date(order.orderDate).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                  {order.status}
                </span>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-md font-medium mb-2">Customer Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Contact Information</p>
                    <p className="text-sm">{order.customerName}</p>
                    <p className="text-sm">{order.customerPhone}</p>
                    {order.customerEmail && <p className="text-sm">{order.customerEmail}</p>}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Shipping Address</p>
                    <p className="text-sm">{order.customerAddress}</p>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h4 className="text-md font-medium mb-2">Order Items</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {order.items.map(item => (
                        <tr key={item.id}>
                          <td className="px-4 py-2 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                {item.productImage ? (
                                  <img 
                                    src={item.productImage} 
                                    alt={item.productName} 
                                    className="h-10 w-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-gray-500 text-xs">No img</span>
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {item.productName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  ID: {item.productId}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            ${parseFloat(item.price).toFixed(2)}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-4 flex justify-end">
                  <div className="w-64">
                    <div className="flex justify-between py-1">
                      <span className="text-sm text-gray-500">Subtotal</span>
                      <span className="text-sm font-medium">${parseFloat(order.totalAmount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-sm text-gray-500">Shipping</span>
                      <span className="text-sm font-medium">Free</span>
                    </div>
                    <div className="flex justify-between py-2 border-t border-gray-200">
                      <span className="text-base font-medium">Total</span>
                      <span className="text-base font-bold">${parseFloat(order.totalAmount).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h4 className="text-md font-medium mb-2">Update Order Status</h4>
                <div className="flex space-x-4">
                  <select
                    value={selectedStatus}
                    onChange={handleStatusChange}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  <Button
                    onClick={handleUpdateStatus}
                    disabled={!selectedStatus || selectedStatus === order.status}
                  >
                    Update Status
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrderManagement;