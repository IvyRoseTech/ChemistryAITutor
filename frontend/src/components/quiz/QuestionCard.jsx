import React from 'react';

const QuestionCard = ({ question, options, selectedOption }) => {
    return (
        <div className="mb-10">
            <h1 className="text-[#101019] dark:text-[#f9f9fb] text-[28px] font-bold leading-snug mb-8">
                {question}
            </h1>
            {/* Answer Options */}
            <div className="flex flex-col gap-3" style={{ "--radio-dot-svg": "url('data:image/svg+xml,%3csvg viewBox=%270 0 16 16%27 fill=%27rgb(47,45,143)%27 xmlns=%27http://www.w3.org/2000/svg%27%3e%3ccircle cx=%278%27 cy=%278%27 r=%273%27/%3e%3c/svg%3e')" }}>
                {options.map((option, index) => {
                    const isSelected = selectedOption === index;
                    const letter = String.fromCharCode(65 + index); // A, B, C, D

                    return (
                        <label
                            key={index}
                            className={`group flex items-center gap-4 rounded-xl border-2 p-5 cursor-pointer transition-all ${isSelected
                                    ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                    : 'border-[#d4d4e3] dark:border-gray-700 hover:border-primary/50'
                                }`}
                        >
                            <input
                                className="h-5 w-5 border-2 border-[#d4d4e3] dark:border-gray-600 bg-transparent text-transparent checked:border-primary checked:bg-[image:--radio-dot-svg] focus:outline-none focus:ring-0 focus:ring-offset-0"
                                name="quiz-option"
                                type="radio"
                                checked={isSelected}
                                readOnly
                            />
                            <div className="flex grow flex-col">
                                <p className="text-[#101019] dark:text-[#f9f9fb] text-lg font-medium">{option}</p>
                            </div>
                            <span className={`font-bold transition-colors ${isSelected
                                    ? 'text-primary'
                                    : 'text-gray-400 group-hover:text-primary'
                                }`}>
                                {letter}
                            </span>
                        </label>
                    );
                })}
            </div>
        </div>
    );
};

export default QuestionCard;
