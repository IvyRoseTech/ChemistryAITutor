import React, { useState, useRef, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import MessageBubble from '../components/chat/MessageBubble';
import ChatBox from '../components/chat/ChatBox';
import { auth } from '../firebase';
import {
    startSession,
    endSession,
    saveMessage,
    listenToSessions
} from '../services/databaseService';

//  Helper — generates a unique session ID
const generateSessionId = () =>
    `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const ChatPage = () => {
    const { toggleSidebar } = useOutletContext() || {};
    const [messages, setMessages] = useState([]);
    const [recentSessions, setRecentSessions] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const messagesEndRef = useRef(null);
    const chatBoxRef = useRef(null);

    // Unique session ID per chat tab
    const sessionId = useRef(generateSessionId());

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    //  Firebase — start session and listen for updates
    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        // Start this session in Firebase
        startSession(user.uid, sessionId.current);

        // Listen to all sessions in real time
        const unsubscribe = listenToSessions(
            user.uid,
            (sessions) => setRecentSessions(sessions)
        );

        // Cleanup on unmount
        return () => {
            unsubscribe();
            endSession(user.uid, sessionId.current);
        };
    }, []);

    //  Add message to UI AND save to Firebase
    const addMessage = async (message, isAI) => {
        setMessages(prev => [...prev, { ...message, isAI }]);

        const user = auth.currentUser;
        if (user) {
            setIsSaving(true);
            try {
                await saveMessage(
                    user.uid,
                    sessionId.current,
                    isAI ? 'assistant' : 'user',
                    message.content
                );
            } catch (error) {
                console.error('Error saving message:', error);
            } finally {
                setIsSaving(false);
            }
        }
    };

    //  New chat — end old session, start fresh one
    const handleNewChat = async () => {
        const user = auth.currentUser;

        if (user) {
            await endSession(user.uid, sessionId.current);
        }

        // Generate fresh session ID
        sessionId.current = generateSessionId();
        setMessages([]);

        if (user) {
            await startSession(user.uid, sessionId.current);
        }
    };

    //  Count only student messages
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

                        {/*  Active session info */}
                        <div className="px-3 py-2 bg-primary/10 rounded-lg mb-4">
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-primary font-semibold">
                                    Active Session
                                </p>
                                {/* Firebase saving indicator */}
                                {isSaving && (
                                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                        Saving...
                                    </span>
                                )}
                                {!isSaving && studentMessageCount > 0 && (
                                    <span className="text-[10px] text-green-600 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                        Saved ✓
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                {studentMessageCount === 0
                                    ? "No messages yet"
                                    : `${studentMessageCount} question${studentMessageCount !== 1 ? 's' : ''} asked`
                                }
                            </p>
                            {studentMessageCount > 0 && (
                                <p className="text-xs text-primary/70 mt-0.5 font-medium">
                                    Turn {Math.min(studentMessageCount, 3)}
                                    {studentMessageCount >= 3
                                        ? " — Answer phase"
                                        : " — Guided phase"
                                    }
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Past sessions from Firebase — real data */}
                    <div className="flex-1 overflow-y-auto space-y-1">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider px-2 mb-2 font-semibold">
                            {recentSessions.length > 0
                                ? `${recentSessions.length} Past Sessions`
                                : 'Recent Sessions'
                            }
                        </p>

                        {recentSessions.length === 0 ? (
                            <p className="text-xs text-gray-400 px-3 py-2">
                                Your sessions will appear here
                            </p>
                        ) : (
                            recentSessions.slice(0, 8).map((session) => (
                                <div
                                    key={session.id}
                                    className={`px-3 py-2 flex items-start gap-2 rounded-lg transition-colors cursor-default ${
                                        session.sessionId === sessionId.current
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-base shrink-0 mt-0.5">
                                        chat_bubble
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-medium truncate">
                                            {session.lastMessage
                                                ? session.lastMessage.substring(0, 35) + '...'
                                                : 'New session'
                                            }
                                        </p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">
                                            {session.messageCount || 0} messages
                                            {session.status === 'active' && (
                                                <span className="ml-1 text-green-500">● Active</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/*  Firebase sync status */}
                    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2 px-3 py-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            <span className="text-[10px] text-slate-500 font-medium">
                                Firebase Connected
                            </span>
                        </div>
                        <p className="text-[10px] text-slate-400 px-3">
                            All conversations saved securely
                        </p>
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
                                    yourself through questions. Your conversations
                                    are saved automatically to your account.
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

                {/* ChatBox */}
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