import React, { useState, useRef, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import MessageBubble from '../components/chat/MessageBubble';
import ChatBox from '../components/chat/ChatBox';

// ✅ Helper — generates a unique session ID
const generateSessionId = () =>
    `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const ChatPage = () => {
    const { toggleSidebar } = useOutletContext() || {};
    const [messages, setMessages] = useState([]);
    const messagesEndRef = useRef(null);
    const chatBoxRef = useRef(null);

    // ✅ Unique session ID per chat tab — lives in useRef so it never triggers re-render
    const sessionId = useRef(generateSessionId());

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const addMessage = (message, isAI) => {
        setMessages(prev => [...prev, { ...message, isAI }]);
    };

    // ✅ New chat — fresh session ID + cleared messages
    const handleNewChat = () => {
        sessionId.current = generateSessionId();
        setMessages([]);
    };

    // ✅ Count only student messages for display (not AI responses)
    const studentMessageCount = messages.filter(m => !m.isAI).length;

    const suggestionChips = [
        "What is ionic bonding?",
        "Explain Le Chatelier's principle",
        "What is oxidation and reduction?",
        "How does electrolysis work?"
    ];

    return (
        <div className="flex h-full bg-background-light dark:bg-background-dark">

            {/* Sidebar */}
            <aside className="w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-background-dark hidden lg:flex flex-col">
                <div className="p-4 flex flex-col h-full">
                    <div className="flex flex-col mb-6">
                        <h1 className="text-charcoal dark:text-white text-xs font-bold uppercase tracking-widest mb-4">
                            ChemAI Tutor
                        </h1>

                        {/* New Chat Button */}
                        <button
                            onClick={handleNewChat}
                            className="flex items-center justify-center gap-2 w-full py-2.5 bg-primary text-white rounded-lg text-sm font-bold shadow-sm hover:bg-primary/90 transition-all mb-4"
                        >
                            <span className="material-symbols-outlined text-lg">add</span>
                            <span>New Chat</span>
                        </button>

                        {/* ✅ Session info — shows real student exchange count */}
                        <div className="px-3 py-2 bg-primary/10 rounded-lg mb-4">
                            <p className="text-xs text-primary font-semibold">
                                Active Session
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                                {studentMessageCount === 0
                                    ? "No messages yet"
                                    : `${studentMessageCount} question${studentMessageCount !== 1 ? 's' : ''} asked`
                                }
                            </p>
                            {/* ✅ Show Socratic turn indicator */}
                            {studentMessageCount > 0 && (
                                <p className="text-xs text-primary/70 mt-0.5 font-medium">
                                    Turn {Math.min(studentMessageCount, 3)}
                                    {studentMessageCount >= 3 ? " — Answer phase" : " — Guided phase"}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* ✅ REMOVED: hardcoded recentSessions — replaced with live message topics */}
                    <div className="flex-1 overflow-y-auto space-y-1">
                        {messages.filter(m => !m.isAI).length === 0 ? (
                            <p className="text-xs text-gray-400 px-3 py-2">
                                Your questions will appear here
                            </p>
                        ) : (
                            messages
                                .filter(m => !m.isAI)
                                .slice(-6) // show last 6 questions
                                .map((msg, index) => (
                                    <div
                                        key={index}
                                        className="px-3 py-2 flex items-center gap-3 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-lg shrink-0">
                                            chat_bubble
                                        </span>
                                        <span className="text-sm truncate font-medium">
                                            {msg.content?.replace(/<br\/>/g, ' ').slice(0, 40)}...
                                        </span>
                                    </div>
                                ))
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Chat */}
            <main className="flex-1 flex flex-col relative w-full">

                {/* Header */}
                <header className="bg-white dark:bg-background-dark border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between gap-4 sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleSidebar}
                            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <div>
                            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">
                                <span>Chemistry</span>
                                <span>/</span>
                                <span className="text-primary">Advanced Level</span>
                            </div>
                            <h2 className="text-charcoal dark:text-white text-lg sm:text-xl font-bold flex items-center gap-2">
                                ChemAI Socratic Tutor
                                <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                                    Live
                                </span>
                            </h2>
                        </div>
                    </div>

                    {/* New chat on mobile */}
                    <button
                        onClick={handleNewChat}
                        className="lg:hidden flex items-center gap-1 px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg"
                    >
                        <span className="material-symbols-outlined text-sm">add</span>
                        New
                    </button>
                </header>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">

                    {/* Welcome screen */}
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center gap-6 mt-12">
                            <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-4xl text-primary">
                                    science
                                </span>
                            </div>
                            <div className="text-center">
                                <h3 className="text-xl font-bold mb-2 text-slate-800 dark:text-white">
                                    Welcome to ChemAI
                                </h3>
                                <p className="text-sm text-slate-500 max-w-md">
                                    I guide you to discover Chemistry answers
                                    yourself through questions. Ask me anything
                                    from your GCE syllabus!
                                </p>
                            </div>

                            {/* Suggestion chips */}
                            <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                                {suggestionChips.map((chip, index) => (
                                    <button
                                        key={index}
                                        onClick={() => chatBoxRef.current?.send(chip)}
                                        className="px-4 py-2 bg-white dark:bg-gray-800 border border-primary/30 text-primary text-xs font-semibold rounded-full hover:bg-primary hover:text-white transition-all shadow-sm"
                                    >
                                        {chip}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Chat messages */}
                    {messages.map((message, index) => (
                        <MessageBubble
                            key={index}
                            message={message}
                            isAI={message.isAI}
                        />
                    ))}

                    <div ref={messagesEndRef} />
                </div>

                {/* ✅ sessionId.current passed explicitly — ChatBox never uses 'default' fallback */}
                <ChatBox
                    ref={chatBoxRef}
                    onNewMessage={addMessage}
                    sessionId={sessionId.current}
                />
            </main>
        </div>
    );
};

export default ChatPage;
