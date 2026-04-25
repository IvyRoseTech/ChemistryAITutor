import React from 'react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
    const variants = {
        primary: 'bg-primary text-white hover:opacity-90',
        secondary: 'bg-soft-teal text-white hover:brightness-110',
        outline: 'border border-white/30 bg-white/10 text-white hover:bg-white/20',
        white: 'bg-white text-primary hover:shadow-xl',
        indigo: 'bg-deep-indigo text-white hover:bg-deep-indigo/90',
    };

    return (
        <button
            className={`flex min-w-[100px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-5 text-sm font-bold leading-normal tracking-[0.015em] transition-all ${variants[variant]} ${className}`}
            {...props}
        >
            <span className="truncate">{children}</span>
        </button>
    );
};

export default Button;
