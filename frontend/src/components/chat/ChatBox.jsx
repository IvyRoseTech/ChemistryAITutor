import React, { useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { askQuestion } from '../../api/client';

const ChatBox = forwardRef(({ onNewMessage, sessionId }, ref) => {
    // ✅ Removed: sessionId = 'default' fallback — 'default' silently collapses
    // all users into one session, breaking the turn counter.
    // ChatPage always passes a real sessionId so no default is needed.

    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    // ✅ Wrapped in useCallback so the imperative handle always gets
    // the latest version of sendMessage (avoids stale closure on loading state)
    const sendMessage = useCallback(async (question) => {
        if (!question || loading) return;

        setInput('');
        onNewMessage({
            content: question,
            time: new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
            }),
            avatar: 'You'
        }, false);

        setLoading(true);

        try {
            // ✅ sessionId always comes from ChatPage — never falls back to 'default'
            const response = await askQuestion(question, null, sessionId);

            onNewMessage({
                title: "ChemAI Tutor",
                content: response.answer
                    ? response.answer.replace(/\n/g, "<br/>")
                    : "Let me think about that...",
                time: new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                sources: response.context
                    ?.slice(0, 2)
                    ?.map(chunk => ({
                        type: chunk.topic || "GCE Syllabus",
                        text: chunk.text
                            ? chunk.text.slice(0, 100) + "..."
                            : "Syllabus Reference"
                    })) || []
            }, true);

        } catch (error) {
            console.error('AI Error:', error);
            onNewMessage({
                title: "System Notice",
                content: error.message?.includes('Network')
                    ? "⚠️ Cannot reach AI server. Check your connection."
                    : `⚠️ ${error.message || 'Something went wrong'}`,
                time: new Date().toLocaleTimeString(),
                sources: []
            }, true);
        } finally {
            setLoading(false);
        }
    }, [loading, sessionId, onNewMessage]);
    // ✅ sendMessage depends on loading, sessionId, and onNewMessage.
    // Adding them to deps ensures the latest values are always used.

    // ✅ useImperativeHandle now depends on sendMessage (which is stable via useCallback)
    // This prevents suggestion chip clicks from using a stale sendMessage closure
    useImperativeHandle(ref, () => ({
        send: (text) => {
            setInput(text);
            sendMessage(text);
        }
    }), [sendMessage]);

    const handleSend = () => {
        const question = input.trim();
        if (!question || loading) return;
        sendMessage(question);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="p-4 sm:p-6 bg-white dark:bg-background-dark border-t border-gray-200 dark:border-gray-800">
            <div className="max-w-4xl mx-auto">

                {/* Loading dots */}
                {loading && (
                    <div className="flex items-center gap-2 mb-3">
                        <div className="flex gap-1">
                            {[0, 150, 300].map((delay, i) => (
                                <span
                                    key={i}
                                    className="w-2 h-2 bg-primary rounded-full animate-bounce"
                                    style={{ animationDelay: `${delay}ms` }}
                                />
                            ))}
                        </div>
                        <span className="text-xs text-slate-500">
                            ChemAI is thinking...
                        </span>
                    </div>
                )}

                {/* Input box */}
                <div className="flex items-end gap-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl p-2 focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-inner">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={loading}
                        rows="1"
                        placeholder={loading
                            ? "Waiting for ChemAI..."
                            : "Ask ChemAI anything about GCE Chemistry..."
                        }
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-1 resize-none max-h-32 min-h-[40px] placeholder-gray-400 disabled:opacity-50"
                    />

                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || loading}
                        className="size-10 rounded-lg bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-all disabled:opacity-40 hover:scale-105 active:scale-95"
                    >
                        <span className="material-symbols-outlined text-xl">
                            {loading ? 'hourglass_empty' : 'send'}
                        </span>
                    </button>
                </div>

                {/* Footer */}
                <div className="mt-2 flex items-center justify-between px-1">
                    <p className="text-[10px] text-gray-400">
                        ChemAI guides you to discover answers yourself
                    </p>
                    <div className="flex items-center gap-1">
                        <span className={`size-2 rounded-full ${loading ? 'bg-amber-400 animate-pulse' : 'bg-green-500'}`} />
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                            {loading ? 'Thinking' : 'Online'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default ChatBox;
