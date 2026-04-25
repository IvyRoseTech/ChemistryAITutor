import React from 'react';

const MessageBubble = ({ message, isAI = false }) => {
    if (isAI) {
        return (
            <div className="flex gap-4 max-w-3xl">
                <div className="flex-shrink-0">
                    <div className="size-10 rounded-full bg-primary flex items-center justify-center text-white shadow-md">
                        <span className="material-symbols-outlined">smart_toy</span>
                    </div>
                </div>
                <div className="flex flex-col items-start gap-4">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl rounded-tl-none shadow-sm border border-gray-200 dark:border-gray-700 w-full">
                        {message.title && <h3 className="text-primary font-bold text-base mb-3">{message.title}</h3>}
                        <div className="space-y-4 text-sm text-charcoal dark:text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: message.content }}></div>

                        {/* Source References Toggle Section */}
                        {message.sources && message.sources.length > 0 && (
                            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <details className="group">
                                    <summary className="flex items-center justify-between cursor-pointer text-xs font-bold text-primary hover:underline">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm">menu_book</span>
                                            SOURCE REFERENCES ({message.sources.length})
                                        </div>
                                        <span className="material-symbols-outlined text-sm transition-transform group-open:rotate-180">expand_more</span>
                                    </summary>
                                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {message.sources.map((source, index) => (
                                            <div key={index} className="p-3 bg-background-light dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                                                <p className="text-[10px] text-primary font-bold mb-1">{source.type}</p>
                                                <p className="text-[11px] text-charcoal dark:text-gray-400 font-medium">{source.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </details>
                            </div>
                        )}
                    </div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">{message.time}</span>
                </div>
            </div>
        );
    }

    // Student message
    return (
        <div className="flex gap-4 max-w-3xl ml-auto flex-row-reverse">
            <div className="flex-shrink-0">
                <div className="size-10 rounded-full bg-charcoal flex items-center justify-center text-white font-bold text-sm">{message.avatar || 'JD'}</div>
            </div>
            <div className="flex flex-col items-end gap-2">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl rounded-tr-none shadow-sm border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-charcoal dark:text-gray-200 leading-relaxed">{message.content}</p>
                </div>
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">{message.time}</span>
            </div>
        </div>
    );
};

export default MessageBubble;
