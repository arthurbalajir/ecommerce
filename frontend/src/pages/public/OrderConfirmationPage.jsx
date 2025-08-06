import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { trackOrder, clearTrackedOrder } from '../../store/slices/orderSlice';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';

const OrderConfirmationPage = () => {
  const { trackingId } = useParams();
  const dispatch = useDispatch();
  const { trackedOrder, isLoading, isError, message } = useSelector(state => state.orders);

  useEffect(() => {
    if (trackingId) {
      dispatch(trackOrder(trackingId));
    }

    return () => {
      dispatch(clearTrackedOrder());
    };
  }, [dispatch, trackingId]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert type="error" message={message || 'Failed to retrieve order details'} />
        <div className="mt-4 text-center">
          <Link to="/">
            <Button>Return to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!trackedOrder) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert type="info" message="Order not found" />
        <div className="mt-4 text-center">
          <Link to="/">
            <Button>Return to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-4">
            <svg className="h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Order Confirmed!</h1>
          <p className="text-gray-600 mt-2">
            Thank you for your purchase. Your order has been received.
          </p>
        </div>

        <div className="border rounded-lg p-6 mb-6">
          <div className="flex justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600">Order Number</p>
              <p className="font-medium">{trackedOrder.trackingId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Date</p>
              <p className="font-medium">
                {new Date(trackedOrder.orderDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="font-medium">${parseFloat(trackedOrder.totalAmount).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="font-medium">
                <span className="inline-block px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                  {trackedOrder.status}
                </span>
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h2 className="font-medium mb-2">Order Details</h2>
            <div className="space-y-3">
              {trackedOrder.items.map((item) => (
                <div key={item.id} className="flex items-center">
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                    <img
                      src={item.productImage || 'https://via.placeholder.com/150'}
                      alt={item.productName}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-sm font-medium text-gray-900">{item.productName}</h3>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-6 mb-6">
          <h2 className="font-medium mb-2">Customer Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Contact Information</p>
              <p className="font-medium">{trackedOrder.customerName}</p>
              <p className="text-sm">{trackedOrder.customerPhone}</p>
              {trackedOrder.customerEmail && <p className="text-sm">{trackedOrder.customerEmail}</p>}
            </div>
            <div>
              <p className="text-sm text-gray-600">Shipping Address</p>
              <p className="text-sm">{trackedOrder.customerAddress}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <Link to="/">
            <Button>Continue Shopping</Button>
          </Link>
          <Link to={`/track-order?id=${trackedOrder.trackingId}`}>
            <Button variant="outline">Track Order</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;