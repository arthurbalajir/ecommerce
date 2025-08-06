import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import orderService from '../../services/orderService';

const initialState = {
  orders: [],
  order: null,
  trackedOrder: null,
  totalPages: 0,
  currentPage: 0,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: ''
};

export const createOrder = createAsyncThunk(
  'orders/create',
  async (orderData, thunkAPI) => {
    try {
      
      return await orderService.createOrder(orderData);
    } catch (error) {

      const message = error.response?.data?.message || error.message || error.toString();
      
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const trackOrder = createAsyncThunk(
  'orders/track',
  async (trackingId, thunkAPI) => {
    try {
      return await orderService.trackOrder(trackingId);
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getAllOrders = createAsyncThunk(
  'orders/getAll',
  async ({ page = 0, size = 10, status = null }, thunkAPI) => {
    try {
      return await orderService.getAllOrders(page, size, status);
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getOrderDetails = createAsyncThunk(
  'orders/getById',
  async (id, thunkAPI) => {
    try {
      return await orderService.getOrderDetails(id);
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateStatus',
  async ({ id, status }, thunkAPI) => {
    try {
      return await orderService.updateOrderStatus(id, status);
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearOrder: (state) => {
      state.order = null;
    },
    clearTrackedOrder: (state) => {
      state.trackedOrder = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.order = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(trackOrder.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(trackOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.trackedOrder = action.payload;
      })
      .addCase(trackOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getAllOrders.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.content;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.number;
      })
      .addCase(getAllOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getOrderDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getOrderDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.order = action.payload;
      })
      .addCase(getOrderDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateOrderStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.order = action.payload;
        if (state.orders.length > 0) {
          state.orders = state.orders.map(order =>
            order.id === action.payload.id ? action.payload : order
          );
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  }
});

export const { reset, clearOrder, clearTrackedOrder } = orderSlice.actions;
export default orderSlice.reducer;