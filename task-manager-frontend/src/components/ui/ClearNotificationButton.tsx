import React, { useState, useRef, useEffect } from 'react';

interface ClearNotificationButtonProps {
  onClearRead: () => void;
  onClearAll: () => void;
  hasNotifications: boolean;
}

const ClearNotificationButton: React.FC<ClearNotificationButtonProps> = ({
  onClearRead,
  onClearAll,
  hasNotifications,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  const handleClearRead = async () => {
    if (isClearing) return;
    setIsClearing(true);
    try {
      await onClearRead();
    } finally {
      setIsClearing(false);
      setIsOpen(false);
    }
  };

  const handleClearAll = async () => {
    if (isClearing) return;
    setIsClearing(true);
    try {
      await onClearAll();
    } finally {
      setIsClearing(false);
      setIsOpen(false);
    }
  };

  const buttonClasses = `
    relative p-2 rounded-lg transition-all duration-200
    transform hover:scale-110 active:scale-95
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500
    ${hasNotifications 
      ? 'text-gray-600 hover:text-red-600 hover:bg-red-50' 
      : 'text-gray-400 cursor-not-allowed'
    }
  `;

  const dropdownClasses = `
    absolute right-0 top-10 bg-white border border-gray-200 rounded-xl shadow-xl
    z-50 min-w-48 overflow-hidden transform transition-all duration-200
    ${isOpen 
      ? 'opacity-100 scale-100 translate-y-0' 
      : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
    }
  `;

  const menuItemClasses = `
    w-full px-4 py-3 text-left text-sm font-medium transition-all duration-200
    hover:bg-gray-50 focus:outline-none focus:bg-gray-50
    flex items-center space-x-2
  `;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (hasNotifications) {
            setIsOpen(!isOpen);
          }
        }}
        disabled={!hasNotifications || isClearing}
        className={buttonClasses}
        title="Clear options"
      >
        {isClearing ? (
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        )}
        
        {/* Hover effect */}
        <div className="absolute inset-0 bg-red-500 opacity-0 hover:opacity-10 rounded-lg transition-opacity duration-200" />
      </button>

      {/* Dropdown Menu */}
      <div className={dropdownClasses}>
        {/* Header */}
        <div className="px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Clear Options
          </p>
        </div>

        {/* Menu Items */}
        <div className="py-1">
          <button
            onClick={handleClearRead}
            disabled={isClearing}
            className={`${menuItemClasses} text-gray-700 hover:text-blue-600`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Clear Read</span>
          </button>

          <button
            onClick={handleClearAll}
            disabled={isClearing}
            className={`${menuItemClasses} text-red-600 hover:text-red-700 hover:bg-red-50`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Clear All</span>
          </button>
        </div>

        {/* Loading overlay */}
        {isClearing && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-sm text-gray-600">Clearing...</span>
            </div>
          </div>
        )}
      </div>

      {/* Arrow indicator */}
      <div className={`
        absolute top-8 right-2 w-0 h-0 border-l-4 border-r-4 border-b-4
        border-l-transparent border-r-transparent border-b-gray-200
        transition-all duration-200
        ${isOpen ? 'opacity-100' : 'opacity-0'}
      `} />
    </div>
  );
};

export default ClearNotificationButton; 