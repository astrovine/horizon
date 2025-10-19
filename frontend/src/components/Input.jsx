import React from 'react';

const Input = ({
  label,
  error,
  icon,
  type = 'text',
  fullWidth = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`flex flex-col gap-2 ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label className="text-sm font-medium text-primary ml-1">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-4 text-tertiary pointer-events-none">
            {icon}
          </span>
        )}
        <input
          className={`w-full px-4 py-3 ${icon ? 'pl-12' : ''} glass rounded-xl text-primary placeholder:text-tertiary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${error ? 'border-danger' : ''} ${className}`}
          type={type}
          {...props}
        />
      </div>
      {error && (
        <span className="text-sm text-danger ml-1">{error}</span>
      )}
    </div>
  );
};

export default Input;

