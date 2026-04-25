import React from 'react';

const IconBox = ({ icon, label, variant = 'default' }) => {
    const variants = {
        default: 'bg-slate-100 dark:bg-white/5 border border-primary/20',
        indigo: 'bg-deep-indigo text-white',
        teal: 'bg-soft-teal text-white',
    };

    const iconColors = {
        default: 'text-primary',
        indigo: 'text-soft-teal',
        teal: 'text-white',
    };

    return (
        <div className={`aspect-square rounded-xl p-4 flex flex-col justify-end ${variants[variant]}`}>
            <span className={`material-symbols-outlined text-4xl mb-auto ${iconColors[variant]}`}>
                {icon}
            </span>
            <p className="font-bold text-sm">{label}</p>
        </div>
    );
};

export default IconBox;
