import React from 'react';

interface AttachmentButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant: 'download' | 'delete';
  children: React.ReactNode;
  className?: string;
}

const AttachmentButton: React.FC<AttachmentButtonProps> = ({
  onClick,
  disabled = false,
  loading = false,
  variant,
  children,
  className = '',
}) => {
  const baseClasses = `
    relative inline-flex items-center justify-center px-4 py-2.5
    text-sm font-medium rounded-lg
    transition-all duration-200 ease-in-out
    transform hover:scale-105 active:scale-95
    shadow-sm hover:shadow-lg
    border border-transparent
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    ${className}
  `;

  const variantClasses = {
    download: `
      bg-gradient-to-r from-blue-500 to-blue-600
      hover:from-blue-600 hover:to-blue-700
      text-white
      focus:ring-blue-500
      shadow-blue-500/25 hover:shadow-blue-500/40
    `,
    delete: `
      bg-gradient-to-r from-red-500 to-red-600
      hover:from-red-600 hover:to-red-700
      text-white
      focus:ring-red-500
      shadow-red-500/25 hover:shadow-red-500/40
    `,
  };

  const iconClasses = `
    w-4 h-4 mr-2 transition-transform duration-200
    ${loading ? 'animate-spin' : ''}
  `;

  const getIcon = () => {
    if (loading) {
      return (
        <svg className={iconClasses} fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      );
    }

    if (variant === 'download') {
      return (
        <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    }

    return (
      <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    );
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]}`}
    >
      {getIcon()}
      <span className="relative z-10">{children}</span>
      
      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-white opacity-0 hover:opacity-10 rounded-lg transition-opacity duration-200" />
      
      {/* Ripple effect */}
      <div className="absolute inset-0 rounded-lg overflow-hidden">
        <div className="absolute inset-0 bg-white opacity-0 hover:opacity-5 transition-opacity duration-300" />
      </div>
    </button>
  );
};

export default AttachmentButton; 