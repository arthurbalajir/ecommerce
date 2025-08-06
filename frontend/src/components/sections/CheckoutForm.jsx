import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../../store/slices/orderSlice';
import { clearCart } from '../../store/slices/cartSlice';
import Input from '../common/Input';
import Button from '../common/Button';
import Alert from '../common/Alert';

const CheckoutForm = ({ items: propItems, totalAmount: propTotalAmount }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const defaultCart = useSelector(state => state.cart);

  const cartItems = propItems || defaultCart.items;
  const cartTotal = propTotalAmount || defaultCart.totalAmount;

  const { isLoading, isError, message } = useSelector(state => state.orders);

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerAddress: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.customerName.trim()) newErrors.customerName = 'Name is required';
    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = 'Phone number is required';
    } else if (!/^[0-9]{5,15}$/.test(formData.customerPhone.replace(/\D/g, ''))) {
      newErrors.customerPhone = 'Please enter a valid phone number';
    }
    if (formData.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Please enter a valid email address';
    }
    if (!formData.customerAddress.trim()) newErrors.customerAddress = 'Address is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const orderData = {
      ...formData,
      totalAmount: cartTotal,
      items: cartItems.map(item => ({
        productId: item.id,
        quantity: item.quantity
      }))
    };

    try {
      const response = await dispatch(createOrder(orderData)).unwrap();
      const trackingId = response?.trackingId || response?.id;
      if (trackingId) {
        // ⬇️ Navigate first, then clear cart (to avoid cart page redirect interfering)
        navigate(`/order-confirmation/${trackingId}`);
        setTimeout(() => {
          dispatch(clearCart());
        }, 300); // Give time for navigation before clearing cart
      } else {
        alert('Order placed, but tracking ID is missing.');
        navigate('/');
      }
    } catch (error) {
      console.error('Failed to place order:', error);
    }
  };

  if (!cartItems || cartItems.length === 0) {
    return <Alert type="info" message="Your cart is empty. Please add items before checkout." />;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Checkout Information</h2>

      {isError && <Alert type="error" message={message} className="mb-4" />}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            type="text"
            id="customerName"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            placeholder="John Doe"
            required
            error={errors.customerName}
          />
          <Input
            label="Phone Number"
            type="tel"
            id="customerPhone"
            name="customerPhone"
            value={formData.customerPhone}
            onChange={handleChange}
            placeholder="1234567890"
            required
            error={errors.customerPhone}
          />
        </div>

        <Input
          label="Email"
          type="email"
          id="customerEmail"
          name="customerEmail"
          value={formData.customerEmail}
          onChange={handleChange}
          placeholder="john@example.com"
          error={errors.customerEmail}
        />

        <Input
          label="Delivery Address"
          type="text"
          id="customerAddress"
          name="customerAddress"
          value={formData.customerAddress}
          onChange={handleChange}
          placeholder="123 Main St, City, Country"
          required
          error={errors.customerAddress}
        />

        <div className="border-t border-gray-200 mt-6 pt-4">
          <div className="flex justify-between mb-2">
            <span className="font-medium">Items Total:</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="font-medium">Shipping:</span>
            <span>Free</span>
          </div>
          <div className="flex justify-between text-lg font-bold mt-4">
            <span>Total:</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-6">
          <Button 
            type="submit" 
            fullWidth 
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Place Order'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CheckoutForm;