import React from 'react';

interface AestheticInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  error?: string;
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const AestheticInput: React.FC<AestheticInputProps> = ({
  label,
  value,
  onChange,
  placeholder = '',
  type = 'text',
  error,
  disabled = false,
  multiline = false,
  rows = 3,
  className = '',
  onKeyDown,
}) => {
  return (
    <div className={`relative w-full ${className}`}>
      {multiline ? (
        <textarea
          className={`peer block w-full rounded-lg border bg-white px-4 pt-5 pb-2 text-sm shadow-sm transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:opacity-60 ${
            error ? 'border-red-500 focus:ring-red-200' : 'border-gray-300'
          }`}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder || ' '}
          rows={rows}
          disabled={disabled}
          onKeyDown={onKeyDown}
        />
      ) : (
        <input
          type={type}
          className={`peer block w-full rounded-lg border bg-white px-4 pt-5 pb-2 text-sm shadow-sm transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:opacity-60 ${
            error ? 'border-red-500 focus:ring-red-200' : 'border-gray-300'
          }`}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder || ' '}
          disabled={disabled}
          onKeyDown={onKeyDown}
        />
      )}
      <label
        className={`pointer-events-none absolute left-4 top-2 text-xs text-gray-500 transition-all duration-200 origin-left scale-90 peer-focus:scale-90 peer-focus:-translate-y-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-5 peer-placeholder-shown:text-sm peer-focus:text-blue-500 ${
          error ? 'peer-focus:text-red-500 text-red-500' : ''
        }`}
      >
        {label}
      </label>
      {error && <span className="mt-1 text-xs text-red-500">{error}</span>}
    </div>
  );
};

export default AestheticInput; 