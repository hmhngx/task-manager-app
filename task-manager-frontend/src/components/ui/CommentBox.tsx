import React, { useState, useRef, useEffect } from 'react';

interface CommentBoxProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  loading?: boolean;
  rows?: number;
  className?: string;
  showCharacterCount?: boolean;
  maxLength?: number;
}

const CommentBox: React.FC<CommentBoxProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = "Write your comment here...",
  label = "Add Comment",
  disabled = false,
  loading = false,
  rows = 3,
  className = '',
  showCharacterCount = true,
  maxLength = 1000,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const characterCount = value.length;
  const isOverLimit = characterCount > maxLength;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (!disabled && !loading && value.trim()) {
        onSubmit();
      }
    }
  };

  const handleSubmit = () => {
    if (!disabled && !loading && value.trim() && !isOverLimit) {
      onSubmit();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  const containerClasses = `
    relative bg-white rounded-xl border-2 transition-all duration-300 ease-in-out
    ${isFocused 
      ? 'border-blue-500 shadow-lg shadow-blue-500/20' 
      : isHovered 
        ? 'border-gray-300 shadow-md' 
        : 'border-gray-200 shadow-sm'
    }
    ${className}
  `;

  const textareaClasses = `
    w-full px-4 py-3 bg-transparent border-none outline-none resize-none
    text-gray-800 placeholder-gray-500
    transition-all duration-200
    ${isFocused ? 'text-gray-900' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
  `;

  const buttonClasses = `
    relative inline-flex items-center justify-center px-6 py-2.5
    text-sm font-medium rounded-lg
    transition-all duration-200 ease-in-out
    transform hover:scale-105 active:scale-95
    shadow-sm hover:shadow-lg
    border border-transparent
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    ${value.trim() && !isOverLimit && !loading
      ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-blue-500/25 hover:shadow-blue-500/40'
      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
    }
  `;

  return (
    <div className="space-y-4">
      {/* Label */}
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>

      {/* Comment Box Container */}
      <div 
        className={containerClasses}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
          maxLength={maxLength}
          className={textareaClasses}
        />

        {/* Character Count */}
        {showCharacterCount && (
          <div className="absolute bottom-3 right-3 flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <span className={`text-xs font-medium ${
                isOverLimit ? 'text-red-500' : characterCount > maxLength * 0.8 ? 'text-yellow-500' : 'text-gray-400'
              }`}>
                {characterCount}
              </span>
              <span className="text-xs text-gray-400">/</span>
              <span className="text-xs text-gray-400">{maxLength}</span>
            </div>
          </div>
        )}

        {/* Focus indicator */}
        {isFocused && (
          <div className="absolute inset-0 rounded-xl border-2 border-blue-500 pointer-events-none animate-pulse" />
        )}
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSubmit}
            disabled={disabled || loading || !value.trim() || isOverLimit}
            className={buttonClasses}
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Posting...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <span>Post Comment</span>
              </>
            )}
          </button>

          {/* Keyboard shortcut hint */}
          <span className="text-xs text-gray-400 hidden sm:block">
            Press Ctrl+Enter to post
          </span>
        </div>

        {/* Error message */}
        {isOverLimit && (
          <div className="text-xs text-red-500 font-medium">
            Comment too long
          </div>
        )}
      </div>

      {/* Progress bar for character count */}
      {showCharacterCount && (
        <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${
              isOverLimit 
                ? 'bg-red-500' 
                : characterCount > maxLength * 0.8 
                  ? 'bg-yellow-500' 
                  : 'bg-blue-500'
            }`}
            style={{ width: `${Math.min((characterCount / maxLength) * 100, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default CommentBox; 