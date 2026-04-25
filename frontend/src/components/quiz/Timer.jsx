import React from 'react';

const Timer = ({ time = '00:24:55' }) => {
    return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#eae9f1] dark:bg-gray-800 rounded-lg text-sm font-semibold">
            <span className="material-symbols-outlined text-sm">schedule</span>
            <span>{time}</span>
        </div>
    );
};

export default Timer;
