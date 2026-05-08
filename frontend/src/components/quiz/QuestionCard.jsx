import React from 'react';

const QuestionCard = ({
    question,
    options,
    selectedOption,
    correctOption = null,  // only set after checking
    onSelect,
    disabled = false
}) => {
    const getOptionStyle = (index) => {
        // After checking answer
        if (correctOption !== null) {
            if (index === correctOption) {
                return 'border-green-500 bg-green-50 dark:bg-green-900/20'; // correct answer
            }
            if (index === selectedOption && index !== correctOption) {
                return 'border-red-400 bg-red-50 dark:bg-red-900/20'; // wrong selection
            }
            return 'border-[#d4d4e3] dark:border-gray-700 opacity-50'; // other options
        }

        // Before checking
        if (index === selectedOption) {
            return 'border-primary bg-primary/5 dark:bg-primary/10';
        }
        return 'border-[#d4d4e3] dark:border-gray-700 hover:border-primary/50';
    };

    const getLetterStyle = (index) => {
        if (correctOption !== null) {
            if (index === correctOption) return 'text-green-600';
            if (index === selectedOption && index !== correctOption) return 'text-red-500';
            return 'text-gray-300';
        }
        return index === selectedOption ? 'text-primary' : 'text-gray-400 group-hover:text-primary';
    };

    const getIcon = (index) => {
        if (correctOption === null) return null;
        if (index === correctOption) {
            return <span className="material-symbols-outlined text-green-600 text-lg">check_circle</span>;
        }
        if (index === selectedOption) {
            return <span className="material-symbols-outlined text-red-500 text-lg">cancel</span>;
        }
        return null;
    };

    return (
        <div className="mb-10">
            <h1 className="text-[#101019] dark:text-[#f9f9fb] text-[22px] md:text-[28px] font-bold leading-snug mb-8">
                {question}
            </h1>

            <div className="flex flex-col gap-3">
                {options.map((option, index) => {
                    const letter = String.fromCharCode(65 + index);

                    return (
                        <button
                            key={index}
                            onClick={() => !disabled && onSelect(index)}
                            disabled={disabled}
                            className={`group flex items-center gap-4 rounded-xl border-2 p-5 text-left transition-all w-full ${getOptionStyle(index)} ${!disabled ? 'cursor-pointer' : 'cursor-default'}`}
                        >
                            <div className="flex grow flex-col">
                                <p className="text-[#101019] dark:text-[#f9f9fb] text-base md:text-lg font-medium">
                                    {option}
                                </p>
                            </div>
                            <div className="shrink-0">
                                {getIcon(index) || (
                                    <span className={`font-bold transition-colors ${getLetterStyle(index)}`}>
                                        {letter}
                                    </span>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default QuestionCard;

