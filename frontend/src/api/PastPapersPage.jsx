import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const API_BASE = '';

// ─────────────────────────────────────────
// API CALLS
// ─────────────────────────────────────────
const fetchYears = async () => {
    const res = await fetch(`${API_BASE}/papers/years`);
    return res.json();
};

const fetchQuestions = async (year, paper, type) => {
    const res = await fetch(`${API_BASE}/papers/questions?year=${year}&paper=${paper}&question_type=${type}`);
    return res.json();
};

const gradeAnswer = async (payload) => {
    const res = await fetch(`${API_BASE}/papers/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    return res.json();
};

const saveProgress = async (payload) => {
    await fetch(`${API_BASE}/papers/progress/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
};

// ─────────────────────────────────────────
// GRADING RESULT PANEL
// ─────────────────────────────────────────
const GradingResult = ({ result, onAskTutor, onNext }) => {
    const gradeColor = {
        A: 'text-green-600', B: 'text-blue-600',
        C: 'text-amber-600', F: 'text-red-600'
    }[result.grade] || 'text-gray-600';

    return (
        <div className="mt-4 rounded-xl border-2 border-primary/20 bg-white dark:bg-gray-900 p-5 space-y-4">
            {/* Score */}
            <div className="flex items-center gap-4">
                <div className={`text-4xl font-black ${gradeColor}`}>{result.grade}</div>
                <div>
                    <p className="text-lg font-bold text-[#101019] dark:text-white">
                        {result.score}/{result.max_marks} marks ({result.percentage}%)
                    </p>
                    <p className="text-sm text-gray-500">{result.feedback}</p>
                </div>
            </div>

            {/* Correct points */}
            {result.correct_points?.length > 0 && (
                <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-green-600 mb-2">✓ What you got right</p>
                    {result.correct_points.map((p, i) => (
                        <p key={i} className="text-sm text-gray-700 dark:text-gray-300 mb-1">• {p}</p>
                    ))}
                </div>
            )}

            {/* Missing points */}
            {result.missing_points?.length > 0 && (
                <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-red-500 mb-2">✗ What was missing</p>
                    {result.missing_points.map((p, i) => (
                        <p key={i} className="text-sm text-gray-700 dark:text-gray-300 mb-1">• {p}</p>
                    ))}
                </div>
            )}

            {/* Model answer */}
            {result.model_answer && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Model Answer</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{result.model_answer}</p>
                </div>
            )}

            <div className="flex gap-3 pt-2">
                <button
                    onClick={onAskTutor}
                    className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary text-sm font-bold rounded-lg hover:bg-primary/20 transition-all"
                >
                    <span className="material-symbols-outlined text-sm">psychology</span>
                    Ask AI Tutor
                </button>
                <button
                    onClick={onNext}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-all"
                >
                    Next Question
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────
// STRUCTURED QUESTION CARD
// ─────────────────────────────────────────
const StructuredQuestion = ({ question, index, total, onGraded, onNext }) => {
    const [answer, setAnswer] = useState('');
    const [grading, setGrading] = useState(false);
    const [result, setResult] = useState(null);

    const handleGrade = async () => {
        if (!answer.trim()) return;
        setGrading(true);
        try {
            const data = await gradeAnswer({
                question: question.question,
                student_answer: answer,
                topic: question.topic,
                marks: question.marks || 10,
                year: question.year,
                paper: question.paper
            });
            setResult(data);
            onGraded(data);
        } catch (e) {
            console.error(e);
        } finally {
            setGrading(false);
        }
    };

    const navigate = useNavigate();

    return (
        <div className="max-w-[800px] mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Question {index + 1} of {total}
                </span>
                <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                    {question.marks || '?'} marks
                </span>
            </div>

            <div className="mb-6">
                <span className="text-xs font-semibold text-gray-400 uppercase mb-2 block">{question.topic}</span>
                <p className="text-lg font-semibold text-[#101019] dark:text-white leading-relaxed whitespace-pre-wrap">
                    {question.question}
                </p>
            </div>

            {!result && (
                <>
                    <textarea
                        value={answer}
                        onChange={e => setAnswer(e.target.value)}
                        disabled={grading}
                        rows={6}
                        placeholder="Write your answer here..."
                        className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-[#d4d4e3] dark:border-gray-700 rounded-xl p-4 text-sm focus:border-primary focus:ring-0 resize-none transition-colors"
                    />
                    <div className="flex justify-between items-center mt-4">
                        <span className="text-xs text-gray-400">{answer.length} characters</span>
                        <button
                            onClick={handleGrade}
                            disabled={!answer.trim() || grading}
                            className="flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-40 text-white font-bold px-8 py-3 rounded-xl transition-all"
                        >
                            {grading ? (
                                <>
                                    <span className="animate-spin material-symbols-outlined text-sm">refresh</span>
                                    Grading...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-sm">grade</span>
                                    Submit for Grading
                                </>
                            )}
                        </button>
                    </div>
                </>
            )}

            {result && (
                <GradingResult
                    result={result}
                    onAskTutor={() => navigate('/chat')}
                    onNext={onNext}
                />
            )}
        </div>
    );
};

// ─────────────────────────────────────────
// MCQ QUESTION CARD
// ─────────────────────────────────────────
const MCQQuestion = ({ question, index, total, onAnswer, onNext }) => {
    const [selected, setSelected] = useState(null);
    const [checked, setChecked] = useState(false);
    const navigate = useNavigate();

    const handleCheck = () => {
        if (selected === null) return;
        setChecked(true);
        onAnswer(selected);
    };

    const getStyle = (i) => {
        if (!checked) return selected === i
            ? 'border-primary bg-primary/5'
            : 'border-[#d4d4e3] dark:border-gray-700 hover:border-primary/50';
        if (i === question.correct_index) return 'border-green-500 bg-green-50 dark:bg-green-900/10';
        if (i === selected) return 'border-red-400 bg-red-50 dark:bg-red-900/10';
        return 'border-[#d4d4e3] dark:border-gray-700 opacity-40';
    };

    return (
        <div className="max-w-[800px] mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Question {index + 1} of {total}
                </span>
                <span className="text-xs font-semibold text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                    {question.topic}
                </span>
            </div>

            <p className="text-xl font-semibold text-[#101019] dark:text-white leading-snug mb-8">
                {question.question}
            </p>

            <div className="flex flex-col gap-3 mb-8">
                {question.options?.map((opt, i) => (
                    <button
                        key={i}
                        onClick={() => !checked && setSelected(i)}
                        className={`flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all ${getStyle(i)}`}
                        disabled={checked}
                    >
                        <span className="font-bold text-gray-400 w-6 shrink-0">
                            {String.fromCharCode(65 + i)}
                        </span>
                        <p className="text-base text-[#101019] dark:text-white">{opt}</p>
                    </button>
                ))}
            </div>

            {!checked ? (
                <div className="flex justify-center">
                    <button
                        onClick={handleCheck}
                        disabled={selected === null}
                        className="bg-primary disabled:opacity-40 hover:bg-primary/90 text-white font-bold px-12 py-4 rounded-xl shadow-lg shadow-primary/20 transition-all"
                    >
                        Check Answer
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className={`rounded-xl p-4 border-2 ${selected === question.correct_index ? 'border-green-400 bg-green-50 dark:bg-green-900/10' : 'border-amber-400 bg-amber-50 dark:bg-amber-900/10'}`}>
                        <p className={`font-bold text-lg ${selected === question.correct_index ? 'text-green-600' : 'text-amber-600'}`}>
                            {selected === question.correct_index ? '✓ Correct!' : '✗ Incorrect'}
                        </p>
                        {selected !== question.correct_index && question.correct_index !== null && (
                            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                                Correct answer: <span className="font-bold">{String.fromCharCode(65 + question.correct_index)}: {question.options?.[question.correct_index]}</span>
                            </p>
                        )}
                    </div>
                    <div className="flex justify-between">
                        <button
                            onClick={() => navigate('/chat')}
                            className="flex items-center gap-2 text-primary text-sm font-bold hover:underline"
                        >
                            <span className="material-symbols-outlined text-sm">psychology</span>
                            Ask AI Tutor
                        </button>
                        <button
                            onClick={onNext}
                            className="flex items-center gap-2 bg-primary text-white font-bold px-6 py-2 rounded-xl hover:bg-primary/90 transition-all"
                        >
                            Next
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─────────────────────────────────────────
// FULL PAPER VIEW
// ─────────────────────────────────────────
const FullPaperView = ({ questions, year, paper, onBack }) => {
    return (
        <div className="max-w-[800px] mx-auto px-4 py-8">
            <button onClick={onBack} className="flex items-center gap-2 text-primary font-bold mb-6 hover:underline">
                <span className="material-symbols-outlined">arrow_back</span>
                Back
            </button>
            <h2 className="text-2xl font-bold mb-8 text-[#101019] dark:text-white">
                {year} Chemistry Paper {paper} — Full Paper
            </h2>
            <div className="space-y-10">
                {questions.map((q, i) => (
                    <div key={q.id} className="border-b border-gray-200 dark:border-gray-800 pb-8">
                        <div className="flex items-center justify-between mb-3">
                            <span className="font-bold text-gray-500">Question {i + 1}</span>
                            {q.marks && (
                                <span className="text-xs text-primary font-bold bg-primary/10 px-2 py-1 rounded">
                                    [{q.marks} marks]
                                </span>
                            )}
                        </div>
                        <p className="text-base text-[#101019] dark:text-white leading-relaxed whitespace-pre-wrap mb-3">
                            {q.question}
                        </p>
                        {q.options && (
                            <div className="space-y-2 ml-4">
                                {q.options.map((opt, j) => (
                                    <p key={j} className="text-sm text-gray-600 dark:text-gray-400">
                                        {String.fromCharCode(65 + j)}. {opt}
                                    </p>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// ─────────────────────────────────────────
// RESULTS SCREEN
// ─────────────────────────────────────────
const ResultsScreen = ({ score, total, year, paper, onRetry, onNewPaper }) => {
    const percentage = Math.round((score / total) * 100);
    const grade = percentage >= 80 ? 'A' : percentage >= 65 ? 'B' : percentage >= 50 ? 'C' : 'F';
    const gradeColor = { A: 'text-green-600', B: 'text-blue-600', C: 'text-amber-600', F: 'text-red-600' }[grade];

    return (
        <div className="max-w-[500px] mx-auto px-4 py-16 text-center">
            <div className={`text-8xl font-black mb-2 ${gradeColor}`}>{grade}</div>
            <div className="text-4xl font-bold text-[#101019] dark:text-white mb-1">{percentage}%</div>
            <p className="text-gray-500 mb-8">{score} of {total} correct — {year} Paper {paper}</p>
            <div className="flex gap-3 justify-center">
                <button
                    onClick={onRetry}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all"
                >
                    <span className="material-symbols-outlined">refresh</span>
                    Retry
                </button>
                <button
                    onClick={onNewPaper}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-[#101019] dark:text-white font-bold rounded-xl hover:opacity-80 transition-all"
                >
                    <span className="material-symbols-outlined">description</span>
                    Choose Paper
                </button>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────
const PastPapersPage = () => {
    const { toggleSidebar } = useOutletContext() || {};
    const { currentUser } = useAuth() || {};

    const [phase, setPhase] = useState('select'); // select | loading | quiz | full | results
    const [years, setYears] = useState([]);
    const [yearSummary, setYearSummary] = useState({});
    const [selectedYear, setSelectedYear] = useState(null);
    const [selectedPaper, setSelectedPaper] = useState(1);
    const [selectedType, setSelectedType] = useState('mcq');
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [score, setScore] = useState(0);
    const [error, setError] = useState(null);
    const [loadingYears, setLoadingYears] = useState(true);
    const startTime = useRef(Date.now());

    // Load available years on mount
    useEffect(() => {
        fetchYears()
            .then(data => {
                setYears(data.years || []);
                setYearSummary(data.year_summary || {});
            })
            .catch(() => setError('Could not load papers. Make sure the ingestion script has been run.'))
            .finally(() => setLoadingYears(false));
    }, []);

    const handleStartQuiz = async () => {
        if (!selectedYear) return;
        setPhase('loading');
        setError(null);
        try {
            const data = await fetchQuestions(selectedYear, selectedPaper, selectedType);
            if (!data.questions?.length) {
                setError('No questions found for this paper. Try running the ingestion script.');
                setPhase('select');
                return;
            }
            setQuestions(data.questions);
            setCurrentIndex(0);
            setAnswers([]);
            setScore(0);
            startTime.current = Date.now();
            setPhase('quiz');
        } catch (e) {
            setError('Failed to load questions.');
            setPhase('select');
        }
    };

    const handleViewFull = async () => {
        if (!selectedYear) return;
        setPhase('loading');
        try {
            const data = await fetchQuestions(selectedYear, selectedPaper, 'all');
            setQuestions(data.questions || []);
            setPhase('full');
        } catch (e) {
            setError('Failed to load paper.');
            setPhase('select');
        }
    };

    const handleAnswer = (answerIndex) => {
        const q = questions[currentIndex];
        const isCorrect = answerIndex === q.correct_index;
        if (isCorrect) setScore(s => s + 1);
        setAnswers(prev => [...prev, { index: answerIndex, correct: isCorrect }]);
    };

    const handleGraded = (result) => {
        const isCorrect = result.percentage >= 50;
        if (isCorrect) setScore(s => s + 1);
    };

    const handleNext = async () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(i => i + 1);
        } else {
            // Save progress
            const timeTaken = Math.round((Date.now() - startTime.current) / 1000);
            const studentId = currentUser?.uid || 'anonymous';
            const topicBreakdown = {};
            questions.forEach((q, i) => {
                const t = q.topic || 'General';
                if (!topicBreakdown[t]) topicBreakdown[t] = { correct: 0, total: 0 };
                topicBreakdown[t].total += 1;
                if (answers[i]?.correct) topicBreakdown[t].correct += 1;
            });
            await saveProgress({
                student_id: studentId,
                year: selectedYear,
                paper: selectedPaper,
                question_type: selectedType,
                score,
                total: questions.length,
                time_taken: timeTaken,
                topic_breakdown: topicBreakdown
            });
            setPhase('results');
        }
    };

    const progressPercent = questions.length > 0
        ? Math.round(((currentIndex + 1) / questions.length) * 100)
        : 0;

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-full flex flex-col">

            {/* Progress bar */}
            {phase === 'quiz' && (
                <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 dark:bg-gray-800 z-50">
                    <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progressPercent}%` }} />
                </div>
            )}

            {/* Header */}
            <header className="sticky top-0 z-30 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 md:px-8 py-3">
                <div className="max-w-[960px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={toggleSidebar} className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100">
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-[#101019] dark:text-white">GCE Past Papers</h1>
                            <p className="text-xs text-gray-500">
                                {phase === 'quiz'
                                    ? `${selectedYear} Paper ${selectedPaper} — Q${currentIndex + 1} of ${questions.length}`
                                    : phase === 'full'
                                        ? `${selectedYear} Paper ${selectedPaper} — Full Paper`
                                        : 'Select a paper to begin'
                                }
                            </p>
                        </div>
                    </div>
                    {(phase === 'quiz' || phase === 'full') && (
                        <button
                            onClick={() => setPhase('select')}
                            className="flex items-center gap-1 text-sm text-gray-500 font-bold hover:text-primary transition-colors"
                        >
                            <span className="material-symbols-outlined text-sm">close</span>
                            Exit
                        </button>
                    )}
                </div>
            </header>

            {/* ── SELECT PAPER ── */}
            {phase === 'select' && (
                <div className="flex-1 p-4 md:p-8 max-w-[900px] mx-auto w-full">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-[#101019] dark:text-white mb-1">Choose a Paper</h2>
                        <p className="text-gray-500 text-sm">2015 – 2025 · AI-graded · Connected to AI Tutor</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-xl p-4 mb-6 text-red-700 dark:text-red-400 text-sm">
                            ⚠️ {error}
                        </div>
                    )}

                    {loadingYears ? (
                        <div className="flex items-center justify-center py-20 gap-3">
                            <div className="animate-spin size-6 border-2 border-primary border-t-transparent rounded-full" />
                            <span className="text-gray-500 text-sm">Loading papers...</span>
                        </div>
                    ) : years.length === 0 ? (
                        <div className="text-center py-20">
                            <span className="material-symbols-outlined text-5xl text-gray-300 mb-4 block">description</span>
                            <p className="text-gray-500 font-semibold mb-2">No papers ingested yet</p>
                            <p className="text-gray-400 text-sm">Run: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">python ingestion/ingest_papers.py</code></p>
                        </div>
                    ) : (
                        <>
                            {/* Year grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-8">
                                {years.map(yr => (
                                    <button
                                        key={yr}
                                        onClick={() => setSelectedYear(parseInt(yr))}
                                        className={`p-4 rounded-xl border-2 text-center transition-all ${selectedYear === parseInt(yr)
                                            ? 'border-primary bg-primary/5 text-primary'
                                            : 'border-[#d4d4e3] dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary/50'
                                            }`}
                                    >
                                        <p className="text-lg font-black">{yr}</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {yearSummary[yr]?.total_questions || 0} questions
                                        </p>
                                    </button>
                                ))}
                            </div>

                            {selectedYear && (
                                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-[#eae9f1] dark:border-gray-800 p-6 space-y-5">
                                    <h3 className="font-bold text-[#101019] dark:text-white">
                                        {selectedYear} Chemistry Options
                                    </h3>

                                    {/* Paper selector */}
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Paper</p>
                                        <div className="flex gap-3">
                                            {[1, 2].map(p => (
                                                <button
                                                    key={p}
                                                    onClick={() => setSelectedPaper(p)}
                                                    className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${selectedPaper === p
                                                        ? 'border-primary bg-primary/5 text-primary'
                                                        : 'border-[#d4d4e3] dark:border-gray-700 text-gray-500 hover:border-primary/50'
                                                        }`}
                                                >
                                                    Paper {p}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Question type */}
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Question Type</p>
                                        <div className="flex gap-3">
                                            {[
                                                { value: 'mcq', label: 'Multiple Choice' },
                                                { value: 'structured', label: 'Structured' }
                                            ].map(t => (
                                                <button
                                                    key={t.value}
                                                    onClick={() => setSelectedType(t.value)}
                                                    className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${selectedType === t.value
                                                        ? 'border-primary bg-primary/5 text-primary'
                                                        : 'border-[#d4d4e3] dark:border-gray-700 text-gray-500 hover:border-primary/50'
                                                        }`}
                                                >
                                                    {t.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex gap-3 pt-2">
                                        <button
                                            onClick={handleStartQuiz}
                                            className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary/20"
                                        >
                                            <span className="material-symbols-outlined">play_arrow</span>
                                            Start Quiz Mode
                                        </button>
                                        <button
                                            onClick={handleViewFull}
                                            className="flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-[#101019] dark:text-white font-bold py-3 px-5 rounded-xl transition-all"
                                        >
                                            <span className="material-symbols-outlined">description</span>
                                            Full Paper
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* ── LOADING ── */}
            {phase === 'loading' && (
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                    <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
                        <span className="material-symbols-outlined text-2xl text-primary">description</span>
                    </div>
                    <p className="text-sm text-gray-500 font-semibold">Loading paper...</p>
                </div>
            )}

            {/* ── QUIZ MODE ── */}
            {phase === 'quiz' && questions[currentIndex] && (
                selectedType === 'mcq' ? (
                    <MCQQuestion
                        question={questions[currentIndex]}
                        index={currentIndex}
                        total={questions.length}
                        onAnswer={handleAnswer}
                        onNext={handleNext}
                    />
                ) : (
                    <StructuredQuestion
                        question={questions[currentIndex]}
                        index={currentIndex}
                        total={questions.length}
                        onGraded={handleGraded}
                        onNext={handleNext}
                    />
                )
            )}

            {/* ── FULL PAPER VIEW ── */}
            {phase === 'full' && (
                <FullPaperView
                    questions={questions}
                    year={selectedYear}
                    paper={selectedPaper}
                    onBack={() => setPhase('select')}
                />
            )}

            {/* ── RESULTS ── */}
            {phase === 'results' && (
                <ResultsScreen
                    score={score}
                    total={questions.length}
                    year={selectedYear}
                    paper={selectedPaper}
                    onRetry={handleStartQuiz}
                    onNewPaper={() => setPhase('select')}
                />
            )}
        </div>
    );
};

export default PastPapersPage;
