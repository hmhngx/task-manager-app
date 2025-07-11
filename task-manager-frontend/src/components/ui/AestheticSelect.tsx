import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';

interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface AestheticSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  loading?: boolean;
  error?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'outlined';
  showSearch?: boolean;
  multiple?: boolean;
  maxHeight?: string;
}

const AestheticSelect: React.FC<AestheticSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  label,
  disabled = false,
  loading = false,
  error,
  className = '',
  size = 'md',
  variant = 'default',
  showSearch = false,
  multiple = false,
  maxHeight = '300px',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const selectRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
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

  useEffect(() => {
    function updateDropdownPosition() {
      if (isOpen && selectRef.current) {
        const rect = selectRef.current.getBoundingClientRect();
        setDropdownStyle({
          position: 'fixed',
          top: rect.bottom,
          left: rect.left,
          minWidth: rect.width,
          zIndex: 9999,
        });
      }
    }
    if (isOpen) {
      updateDropdownPosition();
      window.addEventListener('scroll', updateDropdownPosition, true);
      window.addEventListener('resize', updateDropdownPosition);
    }
    return () => {
      window.removeEventListener('scroll', updateDropdownPosition, true);
      window.removeEventListener('resize', updateDropdownPosition);
    };
  }, [isOpen]);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!isOpen) return;

    switch (event.key) {
      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
        break;
      case 'ArrowDown':
        event.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        event.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleOptionSelect(filteredOptions[highlightedIndex].value);
        }
        break;
    }
  };

  const filteredOptions = options.filter(option =>
    showSearch && searchTerm
      ? option.label.toLowerCase().includes(searchTerm.toLowerCase())
      : true
  );

  const selectedOption = options.find(option => option.value === value);

  const sizeClasses = {
    sm: 'text-xs px-2 py-1.5',
    md: 'text-sm px-3 py-2',
    lg: 'text-base px-4 py-3',
  };

  const variantClasses = {
    default: 'bg-white border border-gray-300 hover:border-gray-400 focus:border-blue-500',
    filled: 'bg-gray-50 border border-gray-200 hover:bg-gray-100 focus:bg-white focus:border-blue-500',
    outlined: 'bg-transparent border-2 border-gray-300 hover:border-gray-400 focus:border-blue-500',
  };

  const baseClasses = `
    relative w-full rounded-lg transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'cursor-pointer'}
    ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
    ${className}
  `;

  const dropdownClasses = `
    absolute left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl
    z-100 overflow-hidden transform transition-all duration-200
    min-w-full w-max
    ${isOpen 
      ? 'opacity-100 scale-100 translate-y-0' 
      : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
    }
    ${className}
    text-sm max-w-xs
  `;

  const optionClasses = (index: number, option: SelectOption) => `
    w-full px-3 py-2 text-left transition-all duration-150
    hover:bg-blue-50 focus:outline-none focus:bg-blue-50
    flex items-center space-x-2 cursor-pointer
    ${highlightedIndex === index ? 'bg-blue-50' : ''}
    ${option.disabled ? 'opacity-50 cursor-not-allowed hover:bg-transparent' : ''}
    ${option.value === value ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700'}
    text-xs min-h-[32px]'
  `;

  const handleOptionSelect = (optionValue: string) => {
    if (!disabled) {
      onChange(optionValue);
      setIsOpen(false);
      setSearchTerm('');
      setHighlightedIndex(-1);
    }
  };

  const handleToggle = () => {
    if (!disabled && !loading) {
      setIsOpen(!isOpen);
      if (!isOpen && showSearch) {
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    }
  };

  return (
    <div className="relative" ref={selectRef}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      {/* Select Button */}
      <div
        className={baseClasses}
        onClick={handleToggle}
        tabIndex={0}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            {selectedOption?.icon && (
              <div className="flex-shrink-0 text-gray-500">
                {selectedOption.icon}
              </div>
            )}
            <span className={`truncate ${selectedOption ? 'text-gray-900' : 'text-gray-500'}`}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {loading && (
              <svg className="w-4 h-4 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            <svg 
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Hover effect */}
        <div className="absolute inset-0 bg-blue-500 opacity-0 hover:opacity-5 rounded-lg transition-opacity duration-200 pointer-events-none" />
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span>{error}</span>
        </p>
      )}

      {/* Dropdown rendered in portal */}
      {isOpen && ReactDOM.createPortal(
        <div>
          {/* Search input outside listbox for ARIA compliance */}
          {showSearch && (
            <div className="p-2 border-b border-gray-100 bg-gray-50">
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full px-2 py-1 rounded bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Search..."
                autoFocus
              />
            </div>
          )}
          <div
            className={dropdownClasses}
            style={dropdownStyle}
            role="listbox"
            tabIndex={-1}
          >
            <div style={{ maxHeight, overflowY: 'auto' }}>
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-2 text-gray-400 text-sm">No options</div>
              ) : (
                filteredOptions.map((option, idx) => (
                  <div
                    key={option.value}
                    className={optionClasses(idx, option)}
                    onClick={() => !option.disabled && handleOptionSelect(option.value)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    aria-selected={option.value === value ? true : false}
                    role="option"
                    tabIndex={-1}
                  >
                    {option.icon && <span className="mr-2">{option.icon}</span>}
                    <span>{option.label}</span>
                    {option.value === value && <span className="ml-auto text-blue-500">&#10003;</span>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Arrow indicator */}
      <div className={`
        absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-b-4
        border-l-transparent border-r-transparent border-b-gray-200
        transition-all duration-200
        ${isOpen ? 'opacity-100' : 'opacity-0'}
      `} />
    </div>
  );
};

export default AestheticSelect; 