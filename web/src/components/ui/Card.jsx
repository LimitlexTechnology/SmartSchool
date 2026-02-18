import React from 'react';

const Card = ({
    children,
    variant = 'small',
    className = '',
    padding = 'medium',
    onClick
}) => {
    const baseStyles = 'bg-white shadow-soft transition-all duration-200';

    const radiusStyles = {
        small: 'rounded-card',
        large: 'rounded-card-lg',
    };

    const paddingStyles = {
        none: 'p-0',
        small: 'p-4',
        medium: 'p-6',
        large: 'p-8',
    };

    const interactionStyles = onClick ? 'cursor-pointer hover:shadow-lg active:scale-[0.99]' : '';

    return (
        <div
            className={`${baseStyles} ${radiusStyles[variant]} ${paddingStyles[padding]} ${interactionStyles} ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

export default Card;
