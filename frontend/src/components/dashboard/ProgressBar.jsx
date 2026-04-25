import React from 'react';

const ProgressBar = ({ percentage, label, goal, variant = 'primary' }) => {
    const variants = {
        primary: 'bg-primary',
        emerald: 'bg-emerald-500',
        amber: 'bg-amber-500',
        rose: 'bg-rose-500'
    };

    return (
        <div className="space-y-3">
            {(label || goal) && (
                <div className="flex justify-between items-end">
                    {label && <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>}
                    {goal && <span className="text-xs text-slate-500 italic">{goal}</span>}
                </div>
            )}
            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full ${variants[variant]}`} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};

export default ProgressBar;
