import { useState, useEffect, useCallback, useRef } from 'react';
import { getQuizQuestions, submitQuiz } from '../api/client';

const QUIZ_DURATION = 30 * 60; // 30 minutes in seconds

const useQuiz = (topic = null, questionCount = 5) => {
    // ─── Quiz lifecycle state ───
    const [phase, setPhase] = useState('idle');
    // idle → loading → active → submitted → results

    // ─── Question state ───
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState([]);         // student's selected indices
    const [confidence, setConfidence] = useState([]);   // 'low' | 'medium' | 'high'
    const [checked, setChecked] = useState(false);      // has student checked current answer

    // ─── Results state ───
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);

    // ─── Timer state ───
    const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION);
    const timerRef = useRef(null);
    const startTimeRef = useRef(null);

    // ─────────────────────────────────────────
    // TIMER
    // ─────────────────────────────────────────
    const startTimer = useCallback(() => {
        startTimeRef.current = Date.now();
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    handleTimeUp();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, []);

    const stopTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
    }, []);

    const handleTimeUp = useCallback(() => {
        setPhase('submitted');
    }, []);

    // Format seconds to MM:SS
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    // ─────────────────────────────────────────
    // LOAD QUESTIONS
    // ─────────────────────────────────────────
    const loadQuestions = useCallback(async () => {
        setPhase('loading');
        setError(null);
        setCurrentIndex(0);
        setAnswers([]);
        setConfidence([]);
        setChecked(false);
        setTimeLeft(QUIZ_DURATION);

        try {
            const data = await getQuizQuestions(topic, questionCount);
            setQuestions(data.questions);
            setAnswers(new Array(data.questions.length).fill(null));
            setConfidence(new Array(data.questions.length).fill('high'));
            setPhase('active');
            startTimer();
        } catch (err) {
            setError(err.message || 'Failed to load questions. Please try again.');
            setPhase('idle');
        }
    }, [topic, questionCount, startTimer]);

    // ─────────────────────────────────────────
    // ANSWER SELECTION
    // ─────────────────────────────────────────
    const selectAnswer = useCallback((optionIndex) => {
        if (checked) return; // can't change after checking
        setAnswers(prev => {
            const updated = [...prev];
            updated[currentIndex] = optionIndex;
            return updated;
        });
    }, [currentIndex, checked]);

    const setConfidenceLevel = useCallback((level) => {
        setConfidence(prev => {
            const updated = [...prev];
            updated[currentIndex] = level;
            return updated;
        });
    }, [currentIndex]);

    // ─────────────────────────────────────────
    // CHECK ANSWER
    // ─────────────────────────────────────────
    const checkAnswer = useCallback(() => {
        if (answers[currentIndex] === null) return; // must select first
        setChecked(true);
    }, [answers, currentIndex]);

    // ─────────────────────────────────────────
    // NAVIGATION
    // ─────────────────────────────────────────
    const nextQuestion = useCallback(() => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setChecked(false);
        } else {
            // Last question — auto submit
            handleSubmit();
        }
    }, [currentIndex, questions.length]);

    const prevQuestion = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            setChecked(false);
        }
    }, [currentIndex]);

    // ─────────────────────────────────────────
    // SUBMIT QUIZ
    // ─────────────────────────────────────────
    const handleSubmit = useCallback(async () => {
        stopTimer();
        setPhase('submitted');

        const timeTaken = QUIZ_DURATION - timeLeft;

        try {
            const data = await submitQuiz({
                questions,
                answers,
                time_taken: timeTaken
            });
            setResults(data);
            setPhase('results');
        } catch (err) {
            setError(err.message || 'Failed to submit quiz.');
            setPhase('results');
        }
    }, [questions, answers, timeLeft, stopTimer]);

    // ─────────────────────────────────────────
    // RESET / RETRY
    // ─────────────────────────────────────────
    const resetQuiz = useCallback(() => {
        stopTimer();
        setPhase('idle');
        setQuestions([]);
        setCurrentIndex(0);
        setAnswers([]);
        setConfidence([]);
        setChecked(false);
        setResults(null);
        setError(null);
        setTimeLeft(QUIZ_DURATION);
    }, [stopTimer]);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => stopTimer();
    }, [stopTimer]);

    // ─────────────────────────────────────────
    // KEYBOARD SHORTCUTS
    // ─────────────────────────────────────────
    useEffect(() => {
        if (phase !== 'active') return;

        const handleKey = (e) => {
            if (['1', '2', '3', '4'].includes(e.key)) {
                selectAnswer(parseInt(e.key) - 1);
            }
            if (e.key === 'Enter') {
                if (!checked) checkAnswer();
                else nextQuestion();
            }
        };

        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [phase, checked, selectAnswer, checkAnswer, nextQuestion]);

    // ─────────────────────────────────────────
    // DERIVED VALUES
    // ─────────────────────────────────────────
    const currentQuestion = questions[currentIndex] || null;
    const selectedAnswer = answers[currentIndex] ?? null;
    const isLastQuestion = currentIndex === questions.length - 1;
    const isCorrect = checked && currentQuestion
        ? selectedAnswer === currentQuestion.correct_index
        : null;
    const progressPercent = questions.length > 0
        ? Math.round(((currentIndex + 1) / questions.length) * 100)
        : 0;
    const answeredCount = answers.filter(a => a !== null).length;

    return {
        // State
        phase,
        questions,
        currentIndex,
        currentQuestion,
        selectedAnswer,
        answers,
        confidence,
        checked,
        results,
        error,

        // Timer
        timeLeft,
        formattedTime: formatTime(timeLeft),

        // Derived
        isLastQuestion,
        isCorrect,
        progressPercent,
        answeredCount,

        // Actions
        loadQuestions,
        selectAnswer,
        setConfidenceLevel,
        checkAnswer,
        nextQuestion,
        prevQuestion,
        handleSubmit,
        resetQuiz,
    };
};

export default useQuiz;