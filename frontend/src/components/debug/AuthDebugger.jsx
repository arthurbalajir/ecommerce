import React, { useState } from 'react';

const AuthDebugger = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  const getUserDetails = () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      
      return {
        token: token ? `${token.substring(0, 10)}...` : 'No token',
        user: user ? {
          id: user.id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          expiresAt: user.expiresAt
        } : 'No user data',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  };
  
  const handleToggle = () => {
    setIsVisible(!isVisible);
  };
  
  const handleRefreshToken = () => {
    // Force a page reload to see if that helps
    window.location.reload();
  };
  
  const handleClearAndRedirect = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/admin-login';
  };
  
  const details = getUserDetails();
  
  return (
    <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-700">Authentication Status</h3>
        <button 
          className="text-sm text-primary-600 hover:text-primary-800 focus:outline-none"
          onClick={handleToggle}
        >
          {isVisible ? 'Hide Details' : 'Show Details'}
        </button>
      </div>
      
      {isVisible && (
        <div className="mt-2">
          <div className="text-xs bg-gray-100 p-3 rounded-md whitespace-pre-wrap">
            <strong>Auth Details:</strong>
            <pre>{JSON.stringify(details, null, 2)}</pre>
          </div>
          <div className="mt-3 flex space-x-2">
            <button 
              className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
              onClick={handleRefreshToken}
            >
              Refresh Page
            </button>
            <button 
              className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
              onClick={handleClearAndRedirect}
            >
              Clear & Re-login
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthDebugger;