import React, { useState, useEffect, forwardRef } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  success?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
}

const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ 
    label, 
    error, 
    success, 
    leftIcon, 
    rightIcon, 
    showPasswordToggle = false,
    className = '',
    type = 'text',
    value,
    defaultValue,
    ...props 
  }, ref) => {
    // Determine if input has value (for controlled and uncontrolled)
    const getInitialValue = () => {
      if (typeof value === 'string') return value.length > 0;
      if (typeof defaultValue === 'string') return defaultValue.length > 0;
      return false;
    };
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(getInitialValue());
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
      // Update hasValue if value prop changes (for controlled components)
      if (typeof value === 'string') {
        setHasValue(value.length > 0);
      }
    }, [value]);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      if (typeof e.target.value === 'string') {
        setHasValue(e.target.value.length > 0);
      }
      props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (typeof e.target.value === 'string') {
        setHasValue(e.target.value.length > 0);
      }
      props.onChange?.(e);
    };

    const inputType = showPasswordToggle && type === 'password' 
      ? (showPassword ? 'text' : 'password') 
      : type;

    const isActive = isFocused || hasValue;

    return (
      <div className="relative">
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            type={inputType}
            value={value}
            defaultValue={defaultValue}
            className={`
              w-full px-4 py-4 pt-6 pb-2
              ${leftIcon ? 'pl-12' : ''}
              ${rightIcon || showPasswordToggle ? 'pr-12' : ''}
              bg-white border-2 rounded-xl
              transition-all duration-300 ease-out
              focus:outline-none focus:ring-0
              ${isActive 
                ? 'border-purple-500 shadow-lg shadow-purple-500/20' 
                : 'border-gray-200 hover:border-gray-300'
              }
              ${error 
                ? 'border-red-500 shadow-lg shadow-red-500/20' 
                : ''
              }
              ${success 
                ? 'border-green-500 shadow-lg shadow-green-500/20' 
                : ''
              }
              ${className}
            `}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            /* No placeholder */
            {...props}
          />
          
          {/* lable name for each box */}
          <label
            className={`
              absolute left-12 top-1/2 transform -translate-y-1/2
              transition-all duration-300 ease-out pointer-events-none
              ${leftIcon ? 'left-12' : ''}
              ${isActive 
                ? 'text-xs text-purple-600 -translate-y-6' 
                : 'text-sm text-gray-500'
              }
              ${error ? 'text-red-500' : ''}
              ${success ? 'text-green-500' : ''}
            `}
          >
            {label}
          </label>

          {rightIcon && !showPasswordToggle && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}

          {showPasswordToggle && type === 'password' && (
            <button
              type="button"
              tabIndex={-1}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          )}

          {error && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-red-500">
              <AlertCircle size={20} />
            </div>
          )}

          {success && !error && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-500">
              <CheckCircle size={20} />
            </div>
          )}
        </div>

        {error && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle size={16} />
            {error}
          </p>
        )}
      </div>
    );
  }
);

FloatingInput.displayName = 'FloatingInput';

export default FloatingInput; 