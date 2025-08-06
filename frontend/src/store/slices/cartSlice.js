import { createSlice } from '@reduxjs/toolkit';
import { logout, login, adminLogin } from './authSlice';

function getCartKey(user) {
  return user ? `cartItems_${user.id}` : 'cartItems_guest';
}

// Helper to load initial cart for the current user
function loadInitialCart() {
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('user'));
  } catch {}
  const cartKey = getCartKey(user);
  const cartItems = localStorage.getItem(cartKey)
    ? JSON.parse(localStorage.getItem(cartKey))
    : [];
  return {
    items: cartItems,
    totalQuantity: cartItems.reduce((total, item) => total + item.quantity, 0),
    totalAmount: cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    cartKey, // store for reference
  };
}

const initialState = loadInitialCart();

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity = 1 } = action.payload;
      const index = state.items.findIndex(item => item.id === product.id);

      if (index >= 0) {
        state.items[index].quantity += quantity;
      } else {
        state.items.push({
          id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          quantity,
        });
      }
      state.totalQuantity = state.items.reduce((sum, item) => sum + item.quantity, 0);
      state.totalAmount = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

      // Save cart for the current user
      localStorage.setItem(state.cartKey, JSON.stringify(state.items));
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      state.totalQuantity = state.items.reduce((sum, item) => sum + item.quantity, 0);
      state.totalAmount = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      localStorage.setItem(state.cartKey, JSON.stringify(state.items));
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const index = state.items.findIndex(item => item.id === id);
      if (index >= 0) state.items[index].quantity = quantity;
      state.totalQuantity = state.items.reduce((sum, item) => sum + item.quantity, 0);
      state.totalAmount = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      localStorage.setItem(state.cartKey, JSON.stringify(state.items));
    },
    clearCart: (state) => {
      state.items = [];
      state.totalQuantity = 0;
      state.totalAmount = 0;
      localStorage.removeItem(state.cartKey);
    },
    // NEW: load cart for a given user (after login/logout)
    loadUserCart: (state, action) => {
      const user = action.payload;
      const cartKey = getCartKey(user);
      const cartItems = localStorage.getItem(cartKey)
        ? JSON.parse(localStorage.getItem(cartKey))
        : [];
      state.items = cartItems;
      state.totalQuantity = cartItems.reduce((total, item) => total + item.quantity, 0);
      state.totalAmount = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
      state.cartKey = cartKey;
    }
  },
  extraReducers: (builder) => {
    // On login, load user cart from localStorage
    builder
      .addCase(login.fulfilled, (state, action) => {
        const user = action.payload && {
          id: action.payload.userId,
          name: action.payload.name,
          email: action.payload.email,
        };
        const cartKey = getCartKey(user);
        const cartItems = localStorage.getItem(cartKey)
          ? JSON.parse(localStorage.getItem(cartKey))
          : [];
        state.items = cartItems;
        state.totalQuantity = cartItems.reduce((total, item) => total + item.quantity, 0);
        state.totalAmount = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
        state.cartKey = cartKey;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        // Optionally, admins may not need a cart, but you can repeat the same logic if desired
        const user = action.payload && {
          id: action.payload.userId,
          name: action.payload.name,
          email: action.payload.email,
        };
        const cartKey = getCartKey(user);
        state.items = [];
        state.totalQuantity = 0;
        state.totalAmount = 0;
        state.cartKey = cartKey;
      })
      .addCase(logout.fulfilled, (state) => {
        // On logout, switch to guest cart
        const cartKey = getCartKey(null);
        const cartItems = localStorage.getItem(cartKey)
          ? JSON.parse(localStorage.getItem(cartKey))
          : [];
        state.items = cartItems;
        state.totalQuantity = cartItems.reduce((total, item) => total + item.quantity, 0);
        state.totalAmount = cartItems.reduce((total, item) => total + item.price * item.quantity, 0); // <-- FIXED HERE
        state.cartKey = cartKey;
      });
  }
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, loadUserCart } = cartSlice.actions;
export default cartSlice.reducer;