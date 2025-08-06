import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import orderService from '../../services/orderService';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';
import { Link } from 'react-router-dom';

const statusBadge = (status) => {
  const map = {
    Pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    Shipped: 'bg-blue-100 text-blue-700 border-blue-200',
    Delivered: 'bg-green-100 text-green-700 border-green-200',
    Cancelled: 'bg-red-100 text-red-700 border-red-200',
  };
  return map[status] || 'bg-gray-100 text-gray-700 border-gray-200';
};

const MyOrdersPage = () => {
  const { user } = useSelector(state => state.auth);
  const [orders, setOrders] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      setIsLoading(true);
      setIsError(false);
      setMessage('');
      try {
        let data = null;
        try {
          data = await orderService.getMyOrders();
        } catch (err) {
          data = await orderService.getOrdersByUserId(user.id);
        }
        setOrders(Array.isArray(data) ? data : data.orders || data.content || []);
      } catch (error) {
        setIsError(true);
        setMessage(error.response?.data?.message || 'Failed to load your orders');
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const toggleExpand = (orderId) => {
    setExpanded(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  if (!user) {
    return <Alert type="warning" message="You must be logged in to view your orders." />;
  }

  if (isLoading) return <Loader />;
  if (isError) return <Alert type="error" message={message} />;

  if (!orders.length) {
    return (
      <div className="max-w-2xl mx-auto mt-10">
        <Alert type="info" message="You have not placed any orders yet." />
        <div className="mt-6 text-center">
          <Link to="/products" className="btn btn-primary">Shop Now</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-2 py-8">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th></th>
              <th className="py-3 px-4 text-left">Order #</th>
              <th className="py-3 px-4 text-left">Date</th>
              <th className="py-3 px-4 text-left">Total</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Items</th>
              <th className="py-3 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => {
              const show = expanded[order.id || order.trackingId];
              return (
                <React.Fragment key={order.id || order.trackingId}>
                  <tr className="border-t hover:bg-gray-50 transition">
                    <td className="py-2 px-2 align-top">
                      <button
                        onClick={() => toggleExpand(order.id || order.trackingId)}
                        className="focus:outline-none"
                        aria-label={show ? "Hide order details" : "Show order details"}
                      >
                        <svg
                          className={`w-5 h-5 transform transition-transform duration-200 ${show ? "rotate-90" : ""}`}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </td>
                    <td className="py-2 px-4 font-mono">{order.trackingId || order.id}</td>
                    <td className="py-2 px-4">{order.orderDate ? new Date(order.orderDate).toLocaleDateString() : '-'}</td>
                    <td className="py-2 px-4 font-bold text-primary-700">${order.totalAmount ? parseFloat(order.totalAmount).toFixed(2) : '0.00'}</td>
                    <td className="py-2 px-4">
                      <span className={`inline-block border px-2 py-1 rounded-full text-xs font-medium ${statusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-2 px-4">
                      {order.items && order.items.length}&nbsp;
                      <span className="hidden md:inline">item{order.items && order.items.length !== 1 ? 's' : ''}</span>
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex gap-2">
                        <Link to={`/order-confirmation/${order.trackingId || order.id}`} className="btn btn-secondary btn-sm">
                          View
                        </Link>
                        <Link to={`/track-order?tracking=${encodeURIComponent(order.trackingId || order.id)}`} className="btn btn-primary btn-sm">
                          Track
                        </Link>
                      </div>
                    </td>
                  </tr>
                  {/* Expandable Row */}
                  {show && (
                    <tr>
                      <td colSpan={7} className="bg-gray-50 px-8 pt-4 pb-6 border-t animate-fade-in">
                        <div className="flex flex-col md:flex-row gap-6">
                          {/* Order Items */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold mb-2 text-gray-700">Order Items:</h4>
                            <ul className="divide-y divide-gray-200">
                              {order.items && order.items.map(item => (
                                <li key={item.id} className="flex items-center py-2">
                                  <img
                                    src={item.productImage || 'https://via.placeholder.com/60'}
                                    alt={item.productName}
                                    className="w-12 h-12 rounded object-cover border mr-3"
                                  />
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-800">{item.productName}</p>
                                    <p className="text-xs text-gray-500">Qty: {item.quantity} x ${parseFloat(item.price).toFixed(2)}</p>
                                  </div>
                                  <div className="font-semibold text-gray-700">
                                    ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                          {/* Shipping & Info */}
                          <div className="md:w-72">
                            <h4 className="font-semibold mb-2 text-gray-700">Shipping To:</h4>
                            <div className="text-gray-700 text-sm mb-2">
                              <div>{order.customerName}</div>
                              <div>{order.customerPhone}</div>
                              <div>{order.customerEmail}</div>
                              <div className="text-xs text-gray-500">{order.customerAddress}</div>
                            </div>
                            <div className="mb-2">
                              <span className="font-semibold text-gray-700">Order Placed:</span>
                              <span className="ml-2">{order.orderDate ? new Date(order.orderDate).toLocaleString() : '-'}</span>
                            </div>
                            <hr className="my-2" />
                            <div>
                              <span className="font-semibold text-gray-700">Order Total:</span>
                              <span className="ml-2 text-primary-700">${order.totalAmount ? parseFloat(order.totalAmount).toFixed(2) : '0.00'}</span>
                            </div>
                            <div className="mt-2">
                              <span className="font-semibold text-gray-700">Status:</span>
                              <span className={`ml-2 inline-block border px-2 py-1 rounded-full text-xs font-medium ${statusBadge(order.status)}`}>
                                {order.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      <style>{`
        .animate-fade-in { animation: fadeIn 0.25s; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  );
};

export default MyOrdersPage;