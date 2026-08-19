import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  className = '',
  type = 'button'
}) => {
  // Variant styles
  const variantStyles = {
    primary: 'bg-solarise-green text-white hover:bg-solarise-green/90',
    outline: 'border border-solarise-green text-solarise-green hover:bg-solarise-green/10',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-solarise-red text-white hover:bg-solarise-red/90',
  };

  // Size styles
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${variantStyles[variant] || variantStyles.primary} ${sizeStyles[size] || sizeStyles.md} rounded-lg font-medium transition-all cursor-pointer ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;