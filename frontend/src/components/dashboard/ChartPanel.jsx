import React from 'react';

const ChartPanel = () => {
    return (
        <div className="bg-white dark:bg-background-dark p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm mt-2">
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Weekly Progress Activity</p>
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">Past 7 Days</span>
            </div>
            <div className="h-32 flex items-end justify-between gap-2 px-2">
                <div className="flex-1 bg-primary/20 rounded-t h-[40%]"></div>
                <div className="flex-1 bg-primary/20 rounded-t h-[60%]"></div>
                <div className="flex-1 bg-primary/20 rounded-t h-[35%]"></div>
                <div className="flex-1 bg-primary/20 rounded-t h-[80%]"></div>
                <div className="flex-1 bg-primary/20 rounded-t h-[55%]"></div>
                <div className="flex-1 bg-primary/40 rounded-t h-[90%]"></div>
                <div className="flex-1 bg-primary rounded-t h-[75%]"></div>
            </div>
        </div>
    );
};

export default ChartPanel;
