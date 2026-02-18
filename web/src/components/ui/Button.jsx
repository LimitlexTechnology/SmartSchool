import React from 'react';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    className = '',
    ...props
}) => {
    const baseStyles = 'btn-base';

    const variants = {
        primary: 'bg-primary-teal text-white hover:bg-secondary-teal',
        secondary: 'bg-soft-teal text-white hover:bg-primary-teal',
        outline: 'border-2 border-primary-teal text-primary-teal bg-transparent hover:bg-primary-teal hover:text-white',
        ghost: 'text-primary-teal bg-transparent hover:bg-light-bg',
    };

    const sizes = {
        sm: 'h-8 px-3 text-xs',
        md: 'h-[48px] px-6 text-base',
        lg: 'h-[56px] px-8 text-lg',
    };

    const widthStyles = fullWidth ? 'w-full' : '';

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyles} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
