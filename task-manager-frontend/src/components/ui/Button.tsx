import React from 'react';

type ButtonOwnProps = {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  as?: React.ElementType;
};

type ButtonProps<C extends React.ElementType = 'button'> = ButtonOwnProps &
  Omit<React.ComponentPropsWithoutRef<C>, keyof ButtonOwnProps> & {
    as?: C;
  };

const base =
  'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-150';

const variants = {
  primary:
    'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
  secondary:
    'bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-50 focus:ring-indigo-500',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  outline:
    'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-indigo-500',
  ghost:
    'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-indigo-500',
};

const sizes = {
  md: 'px-4 py-2 text-sm',
  sm: 'px-3 py-1 text-xs',
  lg: 'px-6 py-3 text-base',
};

export const Button = React.forwardRef(
  <C extends React.ElementType = 'button'>(
    {
      as,
      variant = 'primary',
      loading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      className,
      children,
      ...props
    }: ButtonProps<C>,
    ref: React.Ref<any>
  ) => {
    const Component = as || 'button';
    return React.createElement(
      Component,
      {
        ref,
        className: [
          base,
          variants[variant],
          sizes.md,
          fullWidth ? 'w-full' : '',
          loading ? 'opacity-75 cursor-not-allowed' : '',
          className || '',
        ].join(' '),
        disabled: loading || (props as any).disabled,
        ...props,
      },
      <>
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="ml-2">{rightIcon}</span>}
      </>
    );
  }
) as <C extends React.ElementType = 'button'>(
  props: ButtonProps<C> & { ref?: React.Ref<any> }
) => React.ReactElement | null;

export default Button; 