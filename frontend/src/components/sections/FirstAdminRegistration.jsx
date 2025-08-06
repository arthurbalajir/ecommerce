import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../../store/slices/authSlice';
import Input from '../common/Input';
import Button from '../common/Button';
import Alert from '../common/Alert';
import Loader from '../common/Loader';
import adminService from '../../services/adminService';

const FirstAdminRegistration = () => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field changes
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const { name, email, password } = formData;
      // Register first admin
      const response = await adminService.registerFirstAdmin({ name, email, password });
      
      console.log('First admin registered successfully:', response);
      setSuccess('Registration successful! Redirecting to admin dashboard...');
      
      // If we get a token in the response
      if (response.token) {
        // Store it in localStorage
        localStorage.setItem('token', response.token);
        
        // Create user object for Redux and localStorage
        const userData = {
          id: response.userId || response.id,
          name: response.name,
          email: response.email,
          isAdmin: true, // Force this to be true for admin registration
          expiresAt: response.expiresAt || new Date(Date.now() + 7*24*60*60*1000).toISOString()
        };
        
        // Store in localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Update Redux state
        dispatch(setUser(userData));
        
        // Redirect after a short delay
        setTimeout(() => {
          window.location.href = '/admin/dashboard';
        }, 1500);
      } else {
        // If no token in response, manually redirect to login
        setTimeout(() => {
          navigate('/admin-login');
        }, 1500);
      }
      
    } catch (err) {
      console.error('Error registering first admin:', err);
      setError(err.response?.data?.message || 'Failed to register admin');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-center mb-6">First Admin Registration</h1>
      <p className="text-center text-gray-600 mb-6">
        No admin users exist in the system. Please create the first admin account.
      </p>
      
      {error && <Alert type="error" message={error} className="mb-4" />}
      {success && <Alert type="success" message={success} className="mb-4" />}
      
      <form onSubmit={handleSubmit}>
        <Input
          label="Name"
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter admin name"
          required
          error={errors.name}
        />
        
        <Input
          label="Email"
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter admin email"
          required
          error={errors.email}
        />
        
        <Input
          label="Password"
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter password"
          required
          error={errors.password}
        />
        
        <Input
          label="Confirm Password"
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm password"
          required
          error={errors.confirmPassword}
        />
        
        <Button
          type="submit"
          fullWidth
          disabled={isLoading}
          className="mt-6"
        >
          {isLoading ? <Loader size="sm" color="white" /> : 'Register as First Admin'}
        </Button>
      </form>
    </div>
  );
};

export default FirstAdminRegistration;