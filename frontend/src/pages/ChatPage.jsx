// import React, { useState } from 'react';
// import { useOutletContext } from 'react-router-dom';
// import MessageBubble from '../components/chat/MessageBubble';
// import ChatBox from '../components/chat/ChatBox';

// const ChatPage = () => {
//     const { toggleSidebar } = useOutletContext() || {};
//     // Sample messages for demonstration
//     const messages = [
//         {
//             isAI: false,
//             avatar: 'JD',
//             content: "Can you explain how the equilibrium constant (Kc) is affected when we change the temperature of the system? I'm getting confused with exothermic and endothermic reactions.",
//             time: '10:42 AM'
//         },
//         {
//             isAI: true,
//             title: 'Temperature and Kc',
//             content: `<p>This is a fundamental concept in the <strong>GCE Chemistry Syllabus</strong>. Unlike pressure or concentration changes, <strong>temperature is the only factor that changes the value of Kc.</strong></p>
//                 <ul class="list-none space-y-3">
//                     <li class="flex gap-3">
//                         <span class="material-symbols-outlined text-primary text-sm mt-0.5">trending_up</span>
//                         <span><strong>Endothermic Reactions (ΔH > 0):</strong> Increasing temperature shifts the equilibrium to the right (products). Thus, <strong>Kc increases</strong>.</span>
//                     </li>
//                     <li class="flex gap-3">
//                         <span class="material-symbols-outlined text-red-500 text-sm mt-0.5">trending_down</span>
//                         <span><strong>Exothermic Reactions (ΔH < 0):</strong> Increasing temperature shifts the equilibrium to the left (reactants). Thus, <strong>Kc decreases</strong>.</span>
//                     </li>
//                 </ul>
//                 <div class="bg-primary/5 border-l-4 border-primary p-4 my-4 italic">
//                     "Think of heat as a reactant in endothermic reactions and a product in exothermic reactions. Le Chatelier's Principle then applies naturally!"
//                 </div>`,
//             time: '10:43 AM',
//             sources: [
//                 {
//                     type: 'Syllabus Code',
//                     text: 'GCE-CHEM-715-1.1: Effects of temperature on the equilibrium position.'
//                 },
//                 {
//                     type: 'Recommended Text',
//                     text: 'Ababio: New School Chemistry, Page 214 - Physical Chemistry.'
//                 }
//             ]
//         }
//     ];

//     const suggestionChips = [
//         "Explain Le Chatelier's principle again?",
//         "Give me a practice problem",
//         "Show the Kc formula"
//     ];

//     const recentSessions = [
//         { title: 'Chemical Equilibrium', active: true },
//         { title: 'Acid-Base Titration', active: false },
//         { title: 'Newtonian Physics', active: false },
//         { title: 'The Carbon Cycle', active: false },
//         { title: 'Calculus: Integration', active: false }
//     ];

//     return (
//         <div className="flex h-full bg-background-light dark:bg-background-dark">
//             {/* Internal Sidebar: Recent Topics */}
//             {/* Hidden on mobile, handled by logic or just hidden for now to simplify. 
//                 The original had it as `hidden lg:flex`. We will keep that.
//             */}
//             <aside className="w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-background-dark hidden lg:flex flex-col">
//                 <div className="p-4 flex flex-col h-full">
//                     <div className="flex flex-col mb-6">
//                         <h1 className="text-charcoal dark:text-white text-xs font-bold uppercase tracking-widest mb-4">Recent Sessions</h1>
//                         <button className="flex items-center justify-center gap-2 w-full py-2.5 bg-primary text-white rounded-lg text-sm font-bold shadow-sm hover:bg-primary/90 transition-all mb-4">
//                             <span className="material-symbols-outlined text-lg">add</span>
//                             <span>Start New Session</span>
//                         </button>
//                     </div>
//                     <div className="flex-1 overflow-y-auto space-y-1">
//                         {recentSessions.map((session, index) => (
//                             <div
//                                 key={index}
//                                 className={`px-3 py-2 flex items-center gap-3 rounded-lg cursor-pointer transition-colors group ${session.active
//                                     ? 'bg-primary/10 text-primary'
//                                     : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
//                                     }`}
//                             >
//                                 <span className={`material-symbols-outlined text-lg ${session.active ? '' : 'text-gray-400'}`}>chat_bubble</span>
//                                 <span className={`text-sm truncate ${session.active ? 'font-semibold' : 'font-medium'}`}>{session.title}</span>
//                             </div>
//                         ))}
//                     </div>
//                     <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
//                         <div className="flex items-center gap-3 px-3 py-2 text-gray-500 hover:text-primary cursor-pointer">
//                             <span className="material-symbols-outlined text-lg">settings</span>
//                             <span className="text-sm font-medium">Settings</span>
//                         </div>
//                         <div className="flex items-center gap-3 px-3 py-2 text-gray-500 hover:text-primary cursor-pointer">
//                             <span className="material-symbols-outlined text-lg">help_outline</span>
//                             <span className="text-sm font-medium">Help Center</span>
//                         </div>
//                     </div>
//                 </div>
//             </aside>

//             {/* Main Chat Area */}
//             <main className="flex-1 flex flex-col relative w-full h-[calc(100vh-theme(spacing.0))]">
//                 {/* Note: the height calc is a bit tricky if we have other headers. 
//                 DashboardLayout main has flex-1. So this div just needs to fill it. 
//                 h-full should work if parent has height.
//             */}
//                 {/* Chat Header */}
//                 <header className="bg-white dark:bg-background-dark border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between gap-4 sticky top-0 z-10">
//                     <div className="flex items-center gap-3">
//                         {/* Toggle Button for Mobile Main Sidebar */}
//                         <button
//                             onClick={toggleSidebar}
//                             className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
//                             aria-label="Toggle Menu"
//                         >
//                             <span className="material-symbols-outlined">menu</span>
//                         </button>

//                         <div>
//                             <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">
//                                 <span className="hover:text-primary">Chemistry</span>
//                                 <span>/</span>
//                                 <span className="text-primary">Advanced Level</span>
//                             </div>
//                             <h2 className="text-charcoal dark:text-white text-lg sm:text-xl font-bold flex items-center gap-2">
//                                 Tutor: Chemical Equilibrium
//                                 <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 whitespace-nowrap">Live AI</span>
//                             </h2>
//                         </div>
//                     </div>

//                     <div className="hidden sm:flex items-center gap-2">
//                         <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 transition-colors">
//                             <span className="material-symbols-outlined text-sm">print</span>
//                             <span className="hidden md:inline">Print Session</span>
//                         </button>
//                         <button className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-lg text-sm font-bold hover:bg-primary/20 transition-colors">
//                             <span className="material-symbols-outlined text-sm">auto_stories</span>
//                             <span className="hidden md:inline">Textbooks</span>
//                         </button>
//                     </div>
//                 </header>

//                 {/* Messages Container */}
//                 <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8">
//                     {messages.map((message, index) => (
//                         <MessageBubble key={index} message={message} isAI={message.isAI} />
//                     ))}

//                     {/* Suggestion Chips */}
//                     <div className="flex flex-wrap gap-2 justify-center max-w-3xl py-4 mx-auto">
//                         {suggestionChips.map((chip, index) => (
//                             <button
//                                 key={index}
//                                 className="px-4 py-2 bg-white dark:bg-gray-800 border border-primary/30 text-primary text-xs font-semibold rounded-full hover:bg-primary hover:text-white transition-all shadow-sm"
//                             >
//                                 {chip}
//                             </button>
//                         ))}
//                     </div>
//                 </div>

//                 {/* Chat Input Area */}
//                 <div className="p-4 bg-white dark:bg-background-dark border-t border-gray-200 dark:border-gray-800">
//                     <ChatBox />
//                 </div>
//             </main>
//         </div>
//     );
// };

// export default ChatPage;



import React, { useState, useRef, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import MessageBubble from '../components/chat/MessageBubble';
import ChatBox from '../components/chat/ChatBox';

const ChatPage = () => {
    const { toggleSidebar } = useOutletContext() || {};

    // ✅ 1. Messages State (Dynamic Now)
    const [messages, setMessages] = useState([]);

    // ✅ 2. Auto Scroll Reference
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // ✅ 3. Function To Add Messages (Used By ChatBox)
    const addMessage = (message, isAI) => {
        setMessages(prev => [...prev, { ...message, isAI }]);
    };

    const suggestionChips = [
        "Explain Le Chatelier's principle again?",
        "Give me a practice problem",
        "Show the Kc formula"
    ];

    const recentSessions = [
        { title: 'Chemical Equilibrium', active: true },
        { title: 'Acid-Base Titration', active: false },
        { title: 'Newtonian Physics', active: false },
        { title: 'The Carbon Cycle', active: false },
        { title: 'Calculus: Integration', active: false }
    ];

    return (
        <div className="flex h-full bg-background-light dark:bg-background-dark">
            
            {/* Sidebar */}
            <aside className="w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-background-dark hidden lg:flex flex-col">
                <div className="p-4 flex flex-col h-full">
                    <div className="flex flex-col mb-6">
                        <h1 className="text-charcoal dark:text-white text-xs font-bold uppercase tracking-widest mb-4">Recent Sessions</h1>
                        <button className="flex items-center justify-center gap-2 w-full py-2.5 bg-primary text-white rounded-lg text-sm font-bold shadow-sm hover:bg-primary/90 transition-all mb-4">
                            <span className="material-symbols-outlined text-lg">add</span>
                            <span>Start New Session</span>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-1">
                        {recentSessions.map((session, index) => (
                            <div
                                key={index}
                                className={`px-3 py-2 flex items-center gap-3 rounded-lg cursor-pointer transition-colors group ${session.active
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                            >
                                <span className="material-symbols-outlined text-lg">chat_bubble</span>
                                <span className="text-sm truncate font-medium">{session.title}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Main Chat Area */}
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
                                Tutor: AI Chemistry Assistant
                                <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                                    Live AI
                                </span>
                            </h2>
                        </div>
                    </div>
                </header>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8">
                    {messages.map((message, index) => (
                        <MessageBubble
                            key={index}
                            message={message}
                            isAI={message.isAI}
                        />
                    ))}

                    <div ref={messagesEndRef} />

                    {/* Suggestion Chips */}
                    {messages.length === 0 && (
                        <div className="flex flex-wrap gap-2 justify-center max-w-3xl py-4 mx-auto">
                            {suggestionChips.map((chip, index) => (
                                <button
                                    key={index}
                                    className="px-4 py-2 bg-white dark:bg-gray-800 border border-primary/30 text-primary text-xs font-semibold rounded-full hover:bg-primary hover:text-white transition-all shadow-sm"
                                >
                                    {chip}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Chat Input */}
                <ChatBox onNewMessage={addMessage} />

            </main>
        </div>
    );
};

export default ChatPage;
