import React from 'react';

const FeatureCard = ({ icon, title, description }) => {
    return (
        <div className="flex flex-col gap-5 rounded-xl border border-[#eae9f1] dark:border-white/10 bg-white dark:bg-background-dark/30 p-8 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-3xl">{icon}</span>
            </div>
            <div className="flex flex-col gap-2">
                <h3 className="text-[#101019] dark:text-white text-xl font-bold leading-tight">{title}</h3>
                <p className="text-[#5b5b8b] dark:text-white/70 text-base font-normal leading-relaxed">
                    {description}
                </p>
            </div>
        </div>
    );
};

export default FeatureCard;
