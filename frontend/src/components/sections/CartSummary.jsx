import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, updateQuantity } from '../../store/slices/cartSlice';
import Button from '../common/Button';
import { Link } from 'react-router-dom';

const CartSummary = () => {
  const dispatch = useDispatch();
  const { items, totalAmount } = useSelector(state => state.cart);

  const handleRemoveItem = (id) => {
    dispatch(removeFromCart(id));
  };

  const handleQuantityChange = (id, quantity) => {
    if (quantity < 1) return;
    dispatch(updateQuantity({ id, quantity }));
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Looks like you haven't added anything to your cart yet.</p>
       <Link to="/products">
  <Button>Browse Products</Button>
</Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Cart Summary</h2>
        <div className="divide-y divide-gray-200">
          {items.map((item) => (
            <div key={item.id} className="py-4 flex items-center">
              <div className="w-16 h-16 flex-shrink-0">
                <img 
                  src={item.imageUrl || 'https://via.placeholder.com/80'} 
                  alt={item.name} 
                  className="w-full h-full object-cover object-center rounded"
                />
              </div>
              <div className="ml-4 flex-grow">
                <h3 className="text-sm font-medium text-gray-800">{item.name}</h3>
                <p className="text-sm text-gray-600">${parseFloat(item.price).toFixed(2)}</p>
                <div className="flex items-center mt-1">
                  <button 
                    className="p-1 rounded-md bg-gray-100 hover:bg-gray-200 focus:outline-none"
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="mx-2 text-gray-700 w-8 text-center">{item.quantity}</span>
                  <button 
                    className="p-1 rounded-md bg-gray-100 hover:bg-gray-200 focus:outline-none"
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-800">
                  ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                </p>
                <button 
                  className="mt-1 text-sm text-red-600 hover:text-red-800 focus:outline-none"
                  onClick={() => handleRemoveItem(item.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-gray-50 p-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">${totalAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Shipping</span>
          <span className="font-medium">Free</span>
        </div>
        <div className="flex justify-between text-base font-medium mt-4">
          <span>Total</span>
          <span>${totalAmount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;