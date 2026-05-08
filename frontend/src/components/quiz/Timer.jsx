import React from 'react';

const Timer = ({ formattedTime, timeLeft }) => {
    // Turn red when under 5 minutes
    const isUrgent = timeLeft !== undefined && timeLeft < 300;

    return (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${isUrgent
                ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                : 'bg-[#eae9f1] dark:bg-gray-800 text-[#101019] dark:text-white'
            }`}>
            <span className={`material-symbols-outlined text-sm ${isUrgent ? 'animate-pulse' : ''}`}>
                schedule
            </span>
            <span>{formattedTime}</span>
        </div>
    );
};

export default Timer;
