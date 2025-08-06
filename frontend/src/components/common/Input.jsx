import React from 'react';

const Input = ({
  label,
  type = 'text',
  id,
  name,
  value,
  onChange,
  placeholder = '',
  required = false,
  error = '',
  className = '',
  disabled = false
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`block w-full px-3 py-2 border ${
          error ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
          : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
        } rounded-md shadow-sm placeholder-gray-400 
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
        `}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Input;