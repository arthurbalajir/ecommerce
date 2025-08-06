import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import CartSummary from '../../components/sections/CartSummary';
import Button from '../../components/common/Button';

const CartPage = () => {
  const { items } = useSelector(state => state.cart);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <CartSummary />
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">
                  ${items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">Free</span>
              </div>
              
              <div className="flex justify-between font-bold text-lg mt-4">
                <span>Total</span>
                <span>
                  ${items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                </span>
              </div>
            </div>
            
            <div className="mt-6">
              {items.length > 0 ? (
                <Link to="/checkout">
                  <Button fullWidth size="lg">Proceed to Checkout</Button>
                </Link>
              ) : (
                <Link to="/products">
                  <Button fullWidth size="lg">Continue Shopping</Button>
                </Link>
              )}
            </div>
          </div>
          
          <div className="mt-4 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Need Help?</h2>
            <p className="text-gray-600 mb-4">
              Have questions about your order or our products? Our customer support team is here to help!
            </p>
            <div className="flex items-center space-x-2 text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>+1 234 567 8900</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600 mt-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>support@ecommerce.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;