import React from 'react';
import { Loader2 } from 'lucide-react';

interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const GradientButton: React.FC<GradientButtonProps> = ({
  children,
  loading = false,
  leftIcon,
  rightIcon,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = `
    relative inline-flex items-center justify-center font-semibold
    rounded-xl transition-all duration-300 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    transform hover:scale-[1.02] active:scale-[0.98]
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
  `;

  const variantClasses = {
    primary: `
      bg-gradient-to-r from-purple-600 to-purple-700
      hover:from-purple-700 hover:to-purple-800
      focus:ring-purple-500
      text-white shadow-lg shadow-purple-500/25
      hover:shadow-xl hover:shadow-purple-500/40
    `,
    secondary: `
      bg-gradient-to-r from-gray-600 to-gray-700
      hover:from-gray-700 hover:to-gray-800
      focus:ring-gray-500
      text-white shadow-lg shadow-gray-500/25
      hover:shadow-xl hover:shadow-gray-500/40
    `,
    success: `
      bg-gradient-to-r from-green-600 to-green-700
      hover:from-green-700 hover:to-green-800
      focus:ring-green-500
      text-white shadow-lg shadow-green-500/25
      hover:shadow-xl hover:shadow-green-500/40
    `,
    danger: `
      bg-gradient-to-r from-red-600 to-red-700
      hover:from-red-700 hover:to-red-800
      focus:ring-red-500
      text-white shadow-lg shadow-red-500/25
      hover:shadow-xl hover:shadow-red-500/40
    `
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  return (
    <button
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
      )}
      
      {!loading && leftIcon && (
        <span className="mr-2">{leftIcon}</span>
      )}
      
      {children}
      
      {!loading && rightIcon && (
        <span className="ml-2">{rightIcon}</span>
      )}
    </button>
  );
};

export default GradientButton; 