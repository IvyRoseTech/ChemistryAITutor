import React from 'react';

const StatCard = ({ icon, title, status, variant = 'critical' }) => {
    const variants = {
        critical: {
            border: 'border-accent-amber/30',
            bg: 'bg-accent-amber/10',
            iconColor: 'text-accent-amber',
            statusColor: 'text-accent-amber'
        },
        moderate: {
            border: 'border-teal-500/30',
            bg: 'bg-teal-500/10',
            iconColor: 'text-teal-600',
            statusColor: 'text-teal-600'
        },
        strong: {
            border: 'border-primary/30',
            bg: 'bg-primary/10',
            iconColor: 'text-primary',
            statusColor: 'text-primary'
        }
    };

    const style = variants[variant];

    return (
        <div className={`p-5 rounded-xl border ${style.border} ${style.bg} flex flex-col gap-3 transition-transform hover:scale-[1.02]`}>
            <span className={`material-symbols-outlined ${style.iconColor}`}>{icon}</span>
            <div>
                <h4 className="font-bold text-charcoal dark:text-white text-sm">{title}</h4>
                <p className={`text-xs ${style.statusColor} font-medium`}>{status}</p>
            </div>
        </div>
    );
};

export default StatCard;
