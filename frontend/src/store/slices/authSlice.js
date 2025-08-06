import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';

// Get user from localStorage safely
let user = null;
try {
  const storedUser = localStorage.getItem('user');
  user = storedUser ? JSON.parse(storedUser) : null;
} catch (error) {
  console.error('Error parsing user from localStorage:', error);
}

const initialState = {
  user: user || null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: ''
};

// Register user
export const register = createAsyncThunk(
  'auth/register',
  async (userData, thunkAPI) => {
    try {
      return await authService.register(userData);
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Login user
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, thunkAPI) => {
    try {
      return await authService.login(credentials);
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Admin login
export const adminLogin = createAsyncThunk(
  'auth/adminLogin',
  async (credentials, thunkAPI) => {
    try {
      return await authService.adminLogin(credentials);
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Logout user
export const logout = createAsyncThunk('auth/logout', async () => {
  await authService.logout();
});

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isSuccess = true;
    }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = {
          id: action.payload.userId,
          name: action.payload.name,
          email: action.payload.email,
          isAdmin: action.payload.isAdmin || false,
          expiresAt: action.payload.expiresAt
        };
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })

      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = {
          id: action.payload.userId,
          name: action.payload.name,
          email: action.payload.email,
          isAdmin: action.payload.isAdmin || false,
          expiresAt: action.payload.expiresAt
        };
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })

      // Admin Login
      .addCase(adminLogin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = {
          id: action.payload.userId,
          name: action.payload.name,
          email: action.payload.email,
          isAdmin: true, // force admin true
          expiresAt: action.payload.expiresAt
        };
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })

      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = false;
        state.message = '';
      });
  }
});

export const { reset, setUser } = authSlice.actions;
export default authSlice.reducer;