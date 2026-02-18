import React from 'react';

const Input = ({
    label,
    error,
    className = '',
    ...props
}) => {
    return (
        <div className="flex flex-col gap-2 w-full">
            {label && (
                <label className="text-dark-text font-medium text-sm">
                    {label}
                </label>
            )}
            <input
                className={`
          h-[48px] px-4 rounded-input border border-gray-200 
          bg-white text-dark-text text-base
          focus:outline-none focus:border-primary-teal focus:ring-1 focus:ring-primary-teal
          transition-all duration-200
          ${error ? 'border-error' : ''}
          ${className}
        `}
                {...props}
            />
            {error && (
                <span className="text-error text-xs">
                    {error}
                </span>
            )}
        </div>
    );
};

export default Input;
