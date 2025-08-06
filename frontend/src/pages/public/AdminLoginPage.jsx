import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { adminLogin, reset } from '../../store/slices/authSlice';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';
import adminService from '../../services/adminService';
import FirstAdminRegistration from '../../components/sections/FirstAdminRegistration';

const AdminLoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [adminExists, setAdminExists] = useState(null); // Changed to null initially
  const [checkingAdminExists, setCheckingAdminExists] = useState(true);
  const [checkError, setCheckError] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isLoading, isSuccess, isError, message } = useSelector(state => state.auth);

  useEffect(() => {
    // Check if any admin exists
    const checkIfAdminExists = async () => {
      try {
        console.log('Checking if admin exists...');
        const exists = await adminService.checkAdminExists();
        console.log('Admin exists check result:', exists);
        setAdminExists(exists);
        setCheckError(null);
      } catch (error) {
        console.error('Error checking if admin exists:', error);
        setCheckError(`Failed to check if admin exists: ${error.message}`);
        // Assume false if there's an error, as this likely means the backend isn't reachable
        // or there's another issue that needs addressing
        setAdminExists(false);
      } finally {
        setCheckingAdminExists(false);
      }
    };
    
    // Check if user is already logged in as admin
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.isAdmin) {
      navigate('/admin/dashboard');
    } else {
      checkIfAdminExists();
    }
  }, [navigate]);

  useEffect(() => {
    if (isSuccess && user?.isAdmin) {
      navigate('/admin/dashboard');
    } else if (user && !user.isAdmin) {
      navigate('/');
    }

    return () => {
      dispatch(reset());
    };
  }, [isSuccess, user, navigate, dispatch]);

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
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    dispatch(adminLogin(formData));
  };

  // Force show registration for troubleshooting
  const forceShowRegistration = () => {
    setAdminExists(false);
  };

  if (checkingAdminExists) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-4">Checking if admin exists...</div>
          <div className="flex justify-center py-4">
            <Loader size="lg" />
          </div>
        </div>
      </div>
    );
  }

  if (checkError) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
          <Alert type="error" message={checkError} className="mb-4" />
          <div className="flex justify-center mt-4">
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
            <Button onClick={forceShowRegistration} variant="secondary" className="ml-4">
              Register First Admin
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
        {adminExists === true ? (
          // Normal admin login flow
          <>
            <h1 className="text-2xl font-bold text-center mb-6">Admin Login</h1>
            
            {isError && <Alert type="error" message={message} className="mb-4" />}
            
            <form onSubmit={handleSubmit}>
              <Input
                label="Email"
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your admin email"
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
                placeholder="Enter your password"
                required
                error={errors.password}
              />
              
              <Button
                type="submit"
                fullWidth
                disabled={isLoading}
                className="mt-6"
              >
                {isLoading ? 'Loading...' : 'Login as Admin'}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <Link to="/login" className="text-primary-600 hover:text-primary-800">
                Back to Customer Login
              </Link>
            </div>
          </>
        ) : adminExists === false ? (
          // No admins exist, show registration form
          <FirstAdminRegistration />
        ) : (
          // This should not happen - fallback
          <div>
            <Alert type="error" message="Could not determine if admin exists. Please refresh the page." />
            <div className="flex justify-center mt-4">
              <Button onClick={() => window.location.reload()}>
                Refresh
              </Button>
              <Button onClick={forceShowRegistration} variant="secondary" className="ml-4">
                Register First Admin
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLoginPage;