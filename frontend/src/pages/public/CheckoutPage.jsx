import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import CheckoutForm from '../../components/sections/CheckoutForm';
import Alert from '../../components/common/Alert';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const isSingleCheckout = query.get('single') === 'true';

  const cart = useSelector(state => state.cart);
  const [items, setItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    if (isSingleCheckout) {
      const singleItem = JSON.parse(localStorage.getItem('singleCheckoutItem'));
      if (singleItem && singleItem.product) {
        const item = {
          id: singleItem.product.id,
          name: singleItem.product.name,
          price: singleItem.product.price,
          quantity: singleItem.quantity,
        };
        setItems([item]);
        setTotalAmount(singleItem.product.price * singleItem.quantity);
      } else {
        navigate('/cart');
      }
    } else {
      if (cart.items.length === 0) {
        navigate('/cart');
      } else {
        setItems(cart.items);
        setTotalAmount(cart.totalAmount);
      }
    }
  }, [isSingleCheckout, cart, navigate]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <CheckoutForm items={items} totalAmount={totalAmount} />

        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

            <div className="mb-4">
              {items.map(item => (
                <div key={item.id} className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <span className="bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center text-xs mr-2">
                      {item.quantity}
                    </span>
                    <span className="text-gray-800 truncate" style={{ maxWidth: '180px' }}>
                      {item.name}
                    </span>
                  </div>
                  <span className="font-medium">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${totalAmount.toFixed(2)}</span>
              </div>

              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">Free</span>
              </div>

              <div className="flex justify-between font-bold text-lg mt-4">
                <span>Total</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <Alert
              type="info"
              message="Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our privacy policy."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
