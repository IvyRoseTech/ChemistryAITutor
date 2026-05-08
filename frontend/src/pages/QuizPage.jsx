import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import Timer from '../components/quiz/Timer';
import QuestionCard from '../components/quiz/QuestionCard';
import useQuiz from '../hooks/useQuiz';

// ─────────────────────────────────────────
// TOPIC OPTIONS
// ─────────────────────────────────────────
const TOPICS = [
    { value: null, label: 'All Topics' },
    { value: 'atomic structure', label: 'Atomic Structure' },
    { value: 'chemical bonding', label: 'Chemical Bonding' },
    { value: 'thermochemistry', label: 'Thermochemistry' },
    { value: 'kinetics', label: 'Chemical Kinetics' },
    { value: 'equilibrium', label: 'Equilibrium' },
    { value: 'electrochemistry', label: 'Electrochemistry' },
    { value: 'organic chemistry', label: 'Organic Chemistry' },
];

const COUNTS = [3, 5, 10];


// ─────────────────────────────────────────
// RESULTS SCREEN
// ─────────────────────────────────────────
const ResultsScreen = ({ results, questions, answers, onRetry, onNewQuiz }) => {
    const [expanded, setExpanded] = useState(null);
    const navigate = useNavigate();

    if (!results) return null;

    const gradeColor = {
        A: 'text-green-600',
        B: 'text-blue-600',
        C: 'text-amber-600',
        F: 'text-red-600',
    }[results.grade] || 'text-gray-600';

    return (
        <div className="max-w-[800px] w-full mx-auto px-4 md:px-6 py-8">
            {/* Score Card */}
            <div className="rounded-2xl border border-[#eae9f1] dark:border-gray-800 bg-white dark:bg-gray-900 p-8 text-center mb-8 shadow-sm">
                <div className={`text-7xl font-black mb-2 ${gradeColor}`}>
                    {results.grade}
                </div>
                <div className="text-4xl font-bold text-[#101019] dark:text-white mb-1">
                    {results.percentage}%
                </div>
                <p className="text-gray-500 mb-2">
                    {results.score} out of {results.total} correct
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    {results.feedback}
                </p>
            </div>

            {/* Per-Question Breakdown */}
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">
                Question Breakdown
            </h3>
            <div className="space-y-3 mb-8">
                {results.results.map((r, i) => (
                    <div
                        key={i}
                        className={`rounded-xl border-2 ${r.is_correct
                            ? 'border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-800'
                            : 'border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800'
                            } p-4`}
                    >
                        <div
                            className="flex items-start gap-3 cursor-pointer"
                            onClick={() => setExpanded(expanded === i ? null : i)}
                        >
                            <span className={`material-symbols-outlined text-xl shrink-0 mt-0.5 ${r.is_correct ? 'text-green-600' : 'text-red-500'}`}>
                                {r.is_correct ? 'check_circle' : 'cancel'}
                            </span>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-[#101019] dark:text-white">
                                    Q{i + 1}. {r.question}
                                </p>
                                {!r.is_correct && (
                                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                        Your answer: {r.student_answer !== null ? r.options[r.student_answer] : 'Not answered'} →
                                        Correct: <span className="font-bold">{r.options[r.correct_index]}</span>
                                    </p>
                                )}
                            </div>
                            <span className="material-symbols-outlined text-gray-400 shrink-0">
                                {expanded === i ? 'expand_less' : 'expand_more'}
                            </span>
                        </div>

                        {expanded === i && (
                            <div className="mt-3 pt-3 border-t border-current/10 ml-8">
                                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {r.explanation}
                                </p>
                                <button
                                    onClick={() => navigate('/chat')}
                                    className="mt-3 text-xs text-primary font-bold hover:underline flex items-center gap-1"
                                >
                                    <span className="material-symbols-outlined text-sm">psychology</span>
                                    Ask AI Tutor about this
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-center">
                <button
                    onClick={onRetry}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all"
                >
                    <span className="material-symbols-outlined">refresh</span>
                    Try Again
                </button>
                <button
                    onClick={onNewQuiz}
                    className="flex items-center gap-2 px-6 py-3 bg-[#eae9f1] dark:bg-gray-800 text-[#101019] dark:text-white font-bold rounded-xl hover:opacity-80 transition-all"
                >
                    <span className="material-symbols-outlined">quiz</span>
                    New Quiz
                </button>
            </div>
        </div>
    );
};


// ─────────────────────────────────────────
// SETUP SCREEN
// ─────────────────────────────────────────
const SetupScreen = ({ onStart }) => {
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [selectedCount, setSelectedCount] = useState(5);

    return (
        <div className="flex flex-col items-center justify-center flex-1 px-4 py-16">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-3xl text-primary">quiz</span>
                    </div>
                    <h2 className="text-2xl font-bold text-[#101019] dark:text-white">Practice Quiz</h2>
                    <p className="text-gray-500 text-sm mt-1">AI-generated from your GCE Chemistry syllabus</p>
                </div>

                {/* Topic Selection */}
                <div className="mb-6">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3 block">
                        Select Topic
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {TOPICS.map(t => (
                            <button
                                key={t.label}
                                onClick={() => setSelectedTopic(t.value)}
                                className={`px-3 py-2.5 rounded-xl text-sm font-semibold text-left transition-all border-2 ${selectedTopic === t.value
                                        ? 'border-primary bg-primary/5 text-primary'
                                        : 'border-[#d4d4e3] dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary/50'
                                    }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Question Count */}
                <div className="mb-8">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3 block">
                        Number of Questions
                    </label>
                    <div className="flex gap-3">
                        {COUNTS.map(c => (
                            <button
                                key={c}
                                onClick={() => setSelectedCount(c)}
                                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${selectedCount === c
                                        ? 'border-primary bg-primary/5 text-primary'
                                        : 'border-[#d4d4e3] dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary/50'
                                    }`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={() => onStart(selectedTopic, selectedCount)}
                    className="w-full bg-primary hover:bg-primary/90 text-white text-base font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all"
                >
                    Generate Quiz
                </button>
            </div>
        </div>
    );
};


// ─────────────────────────────────────────
// MAIN QUIZ PAGE
// ─────────────────────────────────────────
const QuizPage = () => {
    const { toggleSidebar } = useOutletContext() || {};
    const [quizConfig, setQuizConfig] = useState({ topic: null, count: 5 });

    const quiz = useQuiz(quizConfig.topic, quizConfig.count);

    const handleStart = (topic, count) => {
        setQuizConfig({ topic, count });
        quiz.loadQuestions();
    };

    // Sync config before loading
    const handleStartWithConfig = (topic, count) => {
        setQuizConfig({ topic, count });
        setTimeout(() => quiz.loadQuestions(), 0);
    };

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-full text-[#101019] dark:text-[#f9f9fb] transition-colors duration-200 flex flex-col">

            {/* Progress Bar */}
            <div className="sticky top-0 left-0 w-full h-1 bg-[#d4d4e3] dark:bg-gray-800 z-40">
                <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${quiz.progressPercent}%` }}
                />
            </div>

            {/* Header */}
            <header className="sticky top-1 z-30 w-full border-b border-[#eae9f1] dark:border-gray-800 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-4 md:px-6 py-3">
                <div className="max-w-[960px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleSidebar}
                            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <div className="bg-primary/10 p-2 rounded-lg hidden sm:block">
                            <span className="material-symbols-outlined text-primary">quiz</span>
                        </div>
                        <div>
                            <h2 className="text-[#101019] dark:text-[#f9f9fb] text-sm md:text-lg font-bold leading-tight">
                                GCE Chemistry Quiz
                            </h2>
                            <p className="text-xs text-gray-500">
                                {quiz.phase === 'active'
                                    ? `Question ${quiz.currentIndex + 1} of ${quiz.questions.length}`
                                    : quiz.phase === 'results'
                                        ? 'Results'
                                        : 'Practice Mode'
                                }
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        {quiz.phase === 'active' && (
                            <>
                                <Timer formattedTime={quiz.formattedTime} timeLeft={quiz.timeLeft} />
                                <button
                                    onClick={quiz.handleSubmit}
                                    className="bg-primary hover:bg-primary/90 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-sm font-bold transition-all"
                                >
                                    Finish
                                </button>
                            </>
                        )}
                        {(quiz.phase === 'results' || quiz.phase === 'idle') && (
                            <button
                                onClick={quiz.resetQuiz}
                                className="flex items-center gap-1 text-sm text-primary font-bold hover:underline"
                            >
                                <span className="material-symbols-outlined text-sm">refresh</span>
                                Reset
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* ── IDLE: Setup Screen ── */}
            {quiz.phase === 'idle' && (
                <SetupScreen onStart={handleStartWithConfig} />
            )}

            {/* ── LOADING ── */}
            {quiz.phase === 'loading' && (
                <div className="flex flex-col items-center justify-center flex-1 gap-4">
                    <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
                        <span className="material-symbols-outlined text-3xl text-primary">psychology</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                        Generating questions from your syllabus...
                    </p>
                </div>
            )}

            {/* ── ACTIVE: Quiz ── */}
            {quiz.phase === 'active' && quiz.currentQuestion && (
                <main className="flex-1 max-w-[800px] w-full mx-auto px-4 md:px-6 py-8 md:py-12 pb-24">

                    <QuestionCard
                        question={quiz.currentQuestion.question}
                        options={quiz.currentQuestion.options}
                        selectedOption={quiz.selectedAnswer}
                        correctOption={quiz.checked ? quiz.currentQuestion.correct_index : null}
                        onSelect={quiz.selectAnswer}
                        disabled={quiz.checked}
                    />

                    {/* Confidence */}
                    {!quiz.checked && (
                        <div className="mb-8">
                            <h3 className="text-sm font-bold uppercase tracking-widest mb-3 text-gray-500">
                                How confident are you?
                            </h3>
                            <div className="flex p-1 bg-[#eae9f1] dark:bg-gray-800 rounded-xl w-full max-w-sm">
                                {['low', 'medium', 'high'].map(level => (
                                    <button
                                        key={level}
                                        onClick={() => quiz.setConfidenceLevel(level)}
                                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold capitalize transition-all ${quiz.confidence[quiz.currentIndex] === level
                                                ? 'bg-white dark:bg-gray-700 text-primary shadow-sm'
                                                : 'text-gray-500 hover:bg-white/50 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Check / Next Button */}
                    {!quiz.checked ? (
                        <div className="flex justify-center mb-12">
                            <button
                                onClick={quiz.checkAnswer}
                                disabled={quiz.selectedAnswer === null}
                                className="bg-primary hover:bg-primary/90 disabled:opacity-40 text-white text-lg font-bold px-12 py-4 rounded-xl shadow-lg shadow-primary/20 transition-all"
                            >
                                Check Answer
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6 mb-12">
                            {/* Feedback Card */}
                            <div className={`rounded-xl border-2 p-6 ${quiz.isCorrect
                                    ? 'border-green-400 bg-green-50 dark:bg-green-900/10'
                                    : 'border-amber-400 bg-amber-50 dark:bg-amber-900/10'
                                }`}>
                                <div className="flex items-start gap-4 mb-4">
                                    <div className={`p-2 rounded-full ${quiz.isCorrect ? 'bg-green-100' : 'bg-amber-100'}`}>
                                        <span className={`material-symbols-outlined font-bold ${quiz.isCorrect ? 'text-green-600' : 'text-amber-600'}`}>
                                            {quiz.isCorrect ? 'check' : 'close'}
                                        </span>
                                    </div>
                                    <div>
                                        <h4 className={`text-xl font-bold ${quiz.isCorrect ? 'text-green-600' : 'text-amber-600'}`}>
                                            {quiz.isCorrect ? 'Correct!' : 'Incorrect'}
                                        </h4>
                                        {!quiz.isCorrect && (
                                            <p className="text-[#101019] dark:text-[#f9f9fb] font-medium">
                                                The correct answer is{' '}
                                                <span className="font-bold">
                                                    {String.fromCharCode(65 + quiz.currentQuestion.correct_index)}:{' '}
                                                    {quiz.currentQuestion.options[quiz.currentQuestion.correct_index]}
                                                </span>
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Explanation */}
                                <div className="border-t border-current/10 pt-4 mt-2">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="material-symbols-outlined text-sm text-primary">menu_book</span>
                                        <h5 className="text-xs font-bold uppercase tracking-wider text-primary">Syllabus Explanation</h5>
                                    </div>
                                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                                        {quiz.currentQuestion.explanation}
                                    </p>
                                </div>
                            </div>

                            {/* Next Button */}
                            <div className="flex justify-between items-center">
                                {quiz.currentIndex > 0 && (
                                    <button
                                        onClick={quiz.prevQuestion}
                                        className="flex items-center gap-1 text-gray-500 font-bold hover:text-primary transition-colors"
                                    >
                                        <span className="material-symbols-outlined">arrow_back</span>
                                        Previous
                                    </button>
                                )}
                                <div className="ml-auto">
                                    <button
                                        onClick={quiz.isLastQuestion ? quiz.handleSubmit : quiz.nextQuestion}
                                        className="flex items-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition-all"
                                    >
                                        {quiz.isLastQuestion ? 'See Results' : 'Next Question'}
                                        <span className="material-symbols-outlined">arrow_forward</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            )}

            {/* ── RESULTS ── */}
            {quiz.phase === 'results' && (
                <ResultsScreen
                    results={quiz.results}
                    questions={quiz.questions}
                    answers={quiz.answers}
                    onRetry={() => quiz.loadQuestions()}
                    onNewQuiz={quiz.resetQuiz}
                />
            )}

            {/* Error */}
            {quiz.error && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-xl shadow-lg text-sm font-semibold z-50">
                    ⚠️ {quiz.error}
                </div>
            )}

            {/* Keyboard Shortcuts Footer */}
            {quiz.phase === 'active' && (
                <footer className="fixed bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-white/50 dark:bg-black/20 backdrop-blur rounded-full border border-gray-200 dark:border-gray-800 hidden md:block z-30">
                    <div className="flex gap-4 text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700">1-4</kbd> Select
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700">Enter</kbd> Submit / Next
                        </span>
                    </div>
                </footer>
            )}
        </div>
    );
};

export default QuizPage;

