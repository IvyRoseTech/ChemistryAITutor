import React, { useState } from 'react';
import { askQuestion } from '../../api/client';

const ChatBox = ({ onNewMessage }) => {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        const question = input.trim();
        if (!question || loading) return;

        // ─── Add student message immediately ───
        onNewMessage({
            content: question,
            time: new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
            }),
            avatar: 'You'
        }, false);

        setInput('');
        setLoading(true);

        try {
            // ─── Call FastAPI /rag/generate ───
            const response = await askQuestion(question);

            // ─── Build AI message from response ───
            const aiMessage = {
                title: "GCE Chemistry AI Tutor",
                content: response.answer
                    ? response.answer.replace(/\n/g, "<br/>")
                    : "I could not find a relevant answer in your syllabus.",
                time: new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                sources: response.context
                    ?.filter(chunk => chunk && (chunk.text || chunk.source))
                    ?.slice(0, 2)
                    ?.map(chunk => ({
                        type: chunk.topic || "GCE Chemistry Syllabus",
                        text: chunk.text
                            ? chunk.text.slice(0, 120) + "..."
                            : chunk.source || "Syllabus Reference"
                    })) || []
            };

            onNewMessage(aiMessage, true);

        } catch (error) {
            console.error('AI Error:', error);

            // ─── Show specific error messages ───
            let errorMessage = "Something went wrong. Please try again.";

            if (error.message?.includes('Network') ||
                error.message?.includes('fetch') ||
                error.message?.includes('connect')) {
                errorMessage = "⚠️ Cannot reach AI server. Make sure both Ollama and FastAPI are running.";
            } else if (error.status === 500) {
                errorMessage = "⚠️ AI server error. The model may still be loading — wait 10 seconds and try again.";
            } else if (error.status === 503) {
                errorMessage = "⚠️ AI index not ready. Run the ingestion script first.";
            } else if (error.message) {
                errorMessage = `⚠️ ${error.message}`;
            }

            onNewMessage({
                title: "System Notice",
                content: errorMessage,
                time: new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                sources: []
            }, true);

        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="p-4 sm:p-6 bg-white dark:bg-background-dark border-t 
                        border-gray-200 dark:border-gray-800">
            <div className="max-w-4xl mx-auto">

                {/* ── Loading Indicator ── */}
                {loading && (
                    <div className="flex items-center gap-3 mb-3 px-2">
                        <div className="flex gap-1">
                            <span className="w-2 h-2 bg-primary rounded-full 
                                           animate-bounce [animation-delay:0ms]">
                            </span>
                            <span className="w-2 h-2 bg-primary rounded-full 
                                           animate-bounce [animation-delay:150ms]">
                            </span>
                            <span className="w-2 h-2 bg-primary rounded-full 
                                           animate-bounce [animation-delay:300ms]">
                            </span>
                        </div>
                        <span className="text-xs text-slate-500 font-medium">
                            AI Tutor is thinking...
                        </span>
                    </div>
                )}

                {/* ── Input Area ── */}
                <div className="relative flex items-end gap-2 bg-gray-50 
                                dark:bg-gray-900 border border-gray-300 
                                dark:border-gray-700 rounded-xl p-2 
                                focus-within:ring-2 focus-within:ring-primary/20 
                                focus-within:border-primary transition-all shadow-inner">

                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={loading}
                        className="flex-1 bg-transparent border-none focus:ring-0 
                                   text-sm py-2 px-1 resize-none max-h-32 
                                   placeholder-gray-400 min-h-[40px] leading-relaxed
                                   disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder={loading
                            ? "Waiting for AI response..."
                            : "Ask your GCE Chemistry tutor anything..."
                        }
                        rows="1"
                    />

                    {/* ── Send Button ── */}
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || loading}
                        className="flex items-center justify-center size-10 
                                   bg-primary text-white rounded-lg 
                                   hover:bg-primary/90 shadow-sm transition-all 
                                   disabled:opacity-40 disabled:cursor-not-allowed
                                   hover:scale-105 active:scale-95"
                    >
                        {loading ? (
                            <svg className="animate-spin h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12"
                                    r="10" stroke="currentColor"
                                    strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        ) : (
                            <span className="material-symbols-outlined">send</span>
                        )}
                    </button>
                </div>

                {/* ── Footer Info ── */}
                <div className="mt-2 flex items-center justify-between px-2">
                    <p className="text-[10px] text-gray-400 font-medium">
                        AI answers are based on your GCE syllabus.
                        Verify with your teacher.
                    </p>
                    <div className="flex items-center gap-2">
                        <span className={`size-2 rounded-full ${loading ? 'bg-amber-500 animate-pulse' : 'bg-green-500'
                            }`}></span>
                        <span className="text-[10px] text-gray-500 font-bold 
                                         uppercase tracking-wider">
                            {loading ? 'Thinking...' : 'Tutor Online'}
                        </span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ChatBox;

