import React, { useState, useRef, useEffect } from 'react';

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
    z-50 overflow-hidden transform transition-all duration-200
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

      {/* Dropdown Menu */}
      <div className={dropdownClasses} style={{ maxWidth: '320px', minWidth: '100%' }}>
        {/* Search Input */}
        {showSearch && (
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                placeholder="Search options..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onClick={(e) => e.stopPropagation()}
              />
              <svg className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        )}

        {/* Options List */}
        <div className="py-1 max-h-60 overflow-y-auto">
          {filteredOptions.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              {showSearch && searchTerm ? 'No options found' : 'No options available'}
            </div>
          ) : (
            filteredOptions.map((option, index) => (
              option.value === '__label__' ? null : (
                <div
                  key={option.value}
                  className={optionClasses(index, option)}
                  onClick={() => !option.disabled && handleOptionSelect(option.value)}
                >
                  {option.icon && (
                    <div className="flex-shrink-0 text-gray-500">
                      {option.icon}
                    </div>
                  )}
                  <span className="flex-1">{option.label}</span>
                  {option.value === value && (
                    <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              )
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
        absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-b-4
        border-l-transparent border-r-transparent border-b-gray-200
        transition-all duration-200
        ${isOpen ? 'opacity-100' : 'opacity-0'}
      `} />
    </div>
  );
};

export default AestheticSelect; 