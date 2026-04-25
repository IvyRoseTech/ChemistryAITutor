import React from 'react';
import { useOutletContext } from 'react-router-dom';
import Timer from '../components/quiz/Timer';
import QuestionCard from '../components/quiz/QuestionCard';

const QuizPage = () => {
    const { toggleSidebar } = useOutletContext() || {};

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-full text-[#101019] dark:text-[#f9f9fb] transition-colors duration-200 flex flex-col">
            {/* Progress Bar at the very top */}
            <div className="sticky top-0 left-0 w-full h-1 bg-[#d4d4e3] dark:bg-gray-800 z-40">
                <div className="h-full bg-primary" style={{ width: '45%' }}></div>
            </div>

            {/* Top Navigation Bar */}
            <header className="sticky top-1 z-30 w-full border-b border-[#eae9f1] dark:border-gray-800 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-4 md:px-6 py-3">
                <div className="max-w-[960px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Toggle Button for Mobile */}
                        <button
                            onClick={toggleSidebar}
                            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            aria-label="Toggle Menu"
                        >
                            <span className="material-symbols-outlined">menu</span>
                        </button>

                        <div className="bg-primary/10 p-2 rounded-lg hidden sm:block">
                            <span className="material-symbols-outlined text-primary">science</span>
                        </div>
                        <div>
                            <h2 className="text-[#101019] dark:text-[#f9f9fb] text-sm md:text-lg font-bold leading-tight tracking-tight line-clamp-1">GCE 2023 Chemistry Paper 1</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Question 18 of 40</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4">
                        <Timer time="00:24:55" />
                        <button className="bg-primary hover:bg-primary/90 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap">
                            Finish Session
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Question Area */}
            <main className="flex-1 max-w-[800px] w-full mx-auto px-4 md:px-6 py-8 md:py-12 pb-24">
                {/* Question Content */}
                <QuestionCard
                    question="Which of the following elements has the highest electronegativity?"
                    options={['Fluorine', 'Oxygen', 'Chlorine', 'Nitrogen']}
                    selectedOption={1}
                />

                {/* Confidence Level Toggle */}
                <div className="mb-10">
                    <h3 className="text-[#101019] dark:text-[#f9f9fb] text-sm font-bold uppercase tracking-widest mb-4">How confident are you?</h3>
                    <div className="flex p-1 bg-[#eae9f1] dark:bg-gray-800 rounded-xl w-full max-w-sm">
                        <div className="flex-1">
                            <input className="hidden confidence-btn" id="conf-low" name="confidence" type="radio" />
                            <label className="flex items-center justify-center py-2 px-4 rounded-lg cursor-pointer text-sm font-semibold text-gray-600 dark:text-gray-400 transition-all hover:bg-white/50 dark:hover:bg-gray-700" htmlFor="conf-low">
                                Low
                            </label>
                        </div>
                        <div className="flex-1">
                            <input className="hidden confidence-btn" id="conf-med" name="confidence" type="radio" />
                            <label className="flex items-center justify-center py-2 px-4 rounded-lg cursor-pointer text-sm font-semibold text-gray-600 dark:text-gray-400 transition-all hover:bg-white/50 dark:hover:bg-gray-700" htmlFor="conf-med">
                                Medium
                            </label>
                        </div>
                        <div className="flex-1">
                            <input defaultChecked className="hidden confidence-btn" id="conf-high" name="confidence" type="radio" />
                            <label className="flex items-center justify-center py-2 px-4 rounded-lg cursor-pointer text-sm font-semibold text-gray-600 dark:text-gray-400 transition-all hover:bg-white/50 dark:hover:bg-gray-700" htmlFor="conf-high">
                                High
                            </label>
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                <div className="flex justify-center mb-12">
                    <button className="bg-primary hover:bg-primary/90 text-white text-lg font-bold px-12 py-4 rounded-xl shadow-lg shadow-primary/20 transition-all">
                        Check Answer
                    </button>
                </div>

                {/* Feedback Area (Post-submission view variant) */}
                <div className="space-y-6">
                    {/* Incorrect Feedback Card */}
                    <div className="rounded-xl border-2 border-incorrect-amber bg-incorrect-amber/5 p-6 animate-fade-in">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="p-2 bg-incorrect-amber/20 rounded-full">
                                <span className="material-symbols-outlined text-incorrect-amber font-bold">close</span>
                            </div>
                            <div>
                                <h4 className="text-incorrect-amber text-xl font-bold">Incorrect</h4>
                                <p className="text-[#101019] dark:text-[#f9f9fb] font-medium">The correct answer is <span className="font-bold">A: Fluorine</span>.</p>
                            </div>
                        </div>

                        {/* Explanation Box */}
                        <div className="mt-6 border-t border-incorrect-amber/20 pt-6">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="material-symbols-outlined text-sm text-primary">menu_book</span>
                                <h5 className="text-sm font-bold uppercase tracking-wider text-primary">Syllabus-Aligned Explanation</h5>
                            </div>
                            <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed">
                                <p className="mb-3">According to the <span className="font-semibold italic">GCE Syllabus Module 2.1 (Periodic Trends)</span>, electronegativity increases as you move from left to right across a period and decreases as you move down a group.</p>
                                <p>Fluorine is located in the top-right corner (excluding noble gases), making it the most electronegative element with a Pauling value of 4.0. Oxygen (3.5) is second, followed by Chlorine (3.0) and Nitrogen (3.0).</p>
                            </div>

                            {/* AI Tutor Call to Action */}
                            <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white dark:bg-gray-900/50 p-4 rounded-lg border border-[#eae9f1] dark:border-gray-800 gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white shrink-0">
                                        <span className="material-symbols-outlined">psychology</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">Still confused about Periodic Trends?</p>
                                        <p className="text-xs text-gray-500">Ask the AI Tutor to explain like you're 5.</p>
                                    </div>
                                </div>
                                <button className="bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap self-end sm:self-auto">
                                    Ask AI Tutor
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Navigation for next question */}
                    <div className="flex justify-end">
                        <button className="flex items-center gap-2 text-primary font-bold hover:underline">
                            Next Question
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </button>
                    </div>
                </div>
            </main>

            {/* Footer for keyboard shortcuts */}
            <footer className="fixed bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-white/50 dark:bg-black/20 backdrop-blur rounded-full border border-gray-200 dark:border-gray-800 hidden md:block z-30">
                <div className="flex gap-4 text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                    <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700">1-4</kbd> Select</span>
                    <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700">Enter</kbd> Submit</span>
                    <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700">H</kbd> Hint</span>
                </div>
            </footer>
        </div>
    );
};

export default QuizPage;
