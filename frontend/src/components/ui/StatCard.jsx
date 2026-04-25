import React from 'react';

const StatCard = ({ label, value, description }) => {
    return (
        <div className="flex min-w-[200px] flex-1 flex-col gap-2 rounded-xl p-8 border border-[#eae9f1] dark:border-white/10 bg-background-light dark:bg-background-dark">
            <p className="text-primary text-sm font-bold uppercase tracking-wider">{label}</p>
            <p className="text-[#101910] dark:text-white tracking-light text-3xl font-black leading-tight">{value}</p>
            <p className="text-[#5b5b8b] dark:text-white/60 text-sm">{description}</p>
        </div>
    );
};

export default StatCard;
