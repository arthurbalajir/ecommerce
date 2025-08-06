import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { trackOrder, clearTrackedOrder } from '../../store/slices/orderSlice';
import Input from '../common/Input';
import Button from '../common/Button';
import Alert from '../common/Alert';
import Loader from '../common/Loader';

const OrderTracker = ({ initialTrackingId = '' }) => {
  const dispatch = useDispatch();
  const { trackedOrder, isLoading, isError, message } = useSelector(state => state.orders);
  
  const [trackingId, setTrackingId] = useState(initialTrackingId);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialTrackingId) {
      dispatch(trackOrder(initialTrackingId));
    }
  }, [dispatch, initialTrackingId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!trackingId.trim()) {
      setError('Please enter a tracking ID');
      return;
    }
    
    setError('');
    dispatch(clearTrackedOrder());
    dispatch(trackOrder(trackingId));
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Shipped':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Track Your Order</h2>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-grow">
            <Input
              placeholder="Enter your tracking ID"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              error={error}
              className="mb-0"
            />
          </div>
          <Button 
            type="submit"
            disabled={isLoading}
            className="whitespace-nowrap"
          >
            Track Order
          </Button>
        </div>
      </form>
      
      {isLoading && <Loader />}
      
      {isError && <Alert type="error" message={message || 'Failed to track order'} />}
      
      {trackedOrder && (
        <div className="mt-6">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <div className="flex flex-wrap justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-gray-800">Order #{trackedOrder.trackingId}</h3>
                  <p className="text-sm text-gray-600">
                    Placed on {new Date(trackedOrder.orderDate).toLocaleDateString()}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full border ${getStatusClass(trackedOrder.status)}`}>
                  {trackedOrder.status}
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <h4 className="font-medium text-gray-700 mb-2">Shipping Details</h4>
              <p className="text-gray-600 mb-1">{trackedOrder.customerName}</p>
              <p className="text-gray-600 mb-1">{trackedOrder.customerPhone}</p>
              {trackedOrder.customerEmail && <p className="text-gray-600 mb-1">{trackedOrder.customerEmail}</p>}
              <p className="text-gray-600">{trackedOrder.customerAddress}</p>
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-700 mb-2">Order Items</h4>
              <div className="divide-y divide-gray-100">
                {trackedOrder.items.map((item) => (
                  <div key={item.id} className="py-2 flex items-center">
                    <div className="w-12 h-12 flex-shrink-0">
                      {item.productImage ? (
                        <img 
                          src={item.productImage}
                          alt={item.productName}
                          className="w-full h-full object-cover object-center rounded"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No image</span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4 flex-grow">
                      <p className="text-sm font-medium text-gray-800">{item.productName}</p>
                      <p className="text-xs text-gray-500">
                        {item.quantity} x ${parseFloat(item.price).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-sm font-medium text-gray-800">
                      ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${parseFloat(trackedOrder.totalAmount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">Free</span>
              </div>
              <div className="flex justify-between text-base font-bold mt-2">
                <span>Total</span>
                <span>${parseFloat(trackedOrder.totalAmount).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTracker;