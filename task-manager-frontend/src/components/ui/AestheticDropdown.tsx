import React, { useState, useRef, useEffect } from 'react';

interface DropdownOption {
  label: string;
  value?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  divider?: boolean;
  danger?: boolean;
}

interface AestheticDropdownProps {
  trigger: React.ReactNode;
  options: DropdownOption[];
  placement?: 'top' | 'bottom' | 'left' | 'right';
  width?: string;
  maxHeight?: string;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
}

const AestheticDropdown: React.FC<AestheticDropdownProps> = ({
  trigger,
  options,
  placement = 'bottom',
  width = 'w-48',
  maxHeight = 'max-h-60',
  className = '',
  disabled = false,
  loading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleOptionClick = (option: DropdownOption) => {
    if (!option.disabled && option.onClick) {
      option.onClick();
      setIsOpen(false);
    }
  };

  const placementClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2',
  };

  const arrowPlacementClasses = {
    top: 'top-full left-4 border-t-gray-200 border-t-4 border-l-4 border-r-4 border-l-transparent border-r-transparent',
    bottom: 'bottom-full left-4 border-b-gray-200 border-b-4 border-l-4 border-r-4 border-l-transparent border-r-transparent',
    left: 'left-full top-4 border-l-gray-200 border-l-4 border-t-4 border-b-4 border-t-transparent border-b-transparent',
    right: 'right-full top-4 border-r-gray-200 border-r-4 border-t-4 border-b-4 border-t-transparent border-b-transparent',
  };

  const dropdownClasses = `
    absolute ${placementClasses[placement]} ${width} bg-white border border-gray-200 rounded-xl shadow-xl
    z-50 overflow-hidden transform transition-all duration-200
    ${isOpen 
      ? 'opacity-100 scale-100 translate-y-0' 
      : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
    }
    ${className}
  `;

  const optionClasses = (option: DropdownOption) => `
    w-full px-4 py-3 text-left transition-all duration-150
    hover:bg-gray-50 focus:outline-none focus:bg-gray-50
    flex items-center space-x-3 cursor-pointer
    ${option.disabled ? 'opacity-50 cursor-not-allowed hover:bg-transparent' : ''}
    ${option.danger ? 'text-red-600 hover:text-red-700 hover:bg-red-50' : 'text-gray-700'}
  `;

  const dividerClasses = `
    w-full h-px bg-gray-200 my-1
  `;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger */}
      <div
        onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
        className={`${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {trigger}
      </div>

      {/* Dropdown Menu */}
      <div className={dropdownClasses} style={{ maxHeight }}>
        {/* Header with gradient */}
        <div className="px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Options
          </p>
        </div>

        {/* Options List */}
        <div className={`py-1 ${maxHeight} overflow-y-auto`}>
          {loading ? (
            <div className="px-4 py-3 flex items-center justify-center">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-sm text-gray-600">Loading...</span>
              </div>
            </div>
          ) : options.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              No options available
            </div>
          ) : (
            options.map((option, index) => (
              <React.Fragment key={index}>
                {option.divider ? (
                  <div className={dividerClasses} />
                ) : (
                  <div
                    className={optionClasses(option)}
                    onClick={() => handleOptionClick(option)}
                  >
                    {option.icon && (
                      <div className="flex-shrink-0 text-gray-500">
                        {option.icon}
                      </div>
                    )}
                    <span className="flex-1">{option.label}</span>
                    {option.danger && (
                      <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    )}
                  </div>
                )}
              </React.Fragment>
            ))
          )}
        </div>

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-sm text-gray-600">Loading...</span>
            </div>
          </div>
        )}
      </div>

      {/* Arrow indicator */}
      <div className={`
        absolute ${arrowPlacementClasses[placement]}
        transition-all duration-200
        ${isOpen ? 'opacity-100' : 'opacity-0'}
      `} />
    </div>
  );
};

export default AestheticDropdown; 