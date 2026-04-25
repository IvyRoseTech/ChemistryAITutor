import React, { useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import ProgressBar from '../components/dashboard/ProgressBar';
import useAuth from '../hooks/useAuth';

const TopicMasteryPage = () => {
    const { currentUser } = useAuth();
    const { toggleSidebar } = useOutletContext() || {};

    // State for accordion items
    const [expandedTopic, setExpandedTopic] = useState('atomic-structure');

    return (
        <div className="w-full">
            {/* Top Nav Bar */}
            <header className="sticky top-0 z-10 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 md:px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {/* Toggle Button for Mobile */}
                    <button
                        onClick={toggleSidebar}
                        className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <span className="material-symbols-outlined">menu</span>
                    </button>

                    <h2 className="text-lg font-bold">Topic Mastery</h2>
                    <nav className="hidden md:flex gap-6 ml-8">
                        <Link className="text-sm font-medium text-slate-500 hover:text-primary transition-colors" to="/study-plan">Study Plan</Link>
                        <Link className="text-sm font-medium text-slate-500 hover:text-primary transition-colors" to="/quiz">Mock Exams</Link>
                        <Link className="text-sm font-medium text-slate-500 hover:text-primary transition-colors underline decoration-2 underline-offset-8 decoration-primary" to="/resources">Resources</Link>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative hidden lg:block">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
                        <input className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm w-64 focus:ring-2 focus:ring-primary/20" placeholder="Search topics..." type="text" />
                    </div>
                </div>
            </header>

            <div className="max-w-5xl mx-auto p-4 md:p-8">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 mb-6">
                    <Link to="/dashboard" className="text-slate-400 text-sm hover:text-slate-600 flex items-center gap-1">
                        <span className="material-symbols-outlined text-lg">home</span>
                        Dashboard
                    </Link>
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-400 text-sm">Chemistry</span>
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-900 dark:text-white font-medium text-sm">Topic Analysis</span>
                </div>

                {/* Subject Mastery Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 mb-8 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Chemistry - GCE Advanced Level</h1>
                            <p className="text-slate-500 max-w-xl">Deep dive into your mastery across the official GCE syllabus. Use the AI tutor to bridge gaps in red-labeled topics.</p>
                        </div>
                        <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 flex items-center gap-4 min-w-[240px]">
                            <div className="size-12 rounded-full border-4 border-primary border-r-slate-200 flex items-center justify-center">
                                <span className="text-primary font-bold text-xs">65%</span>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Overall Mastery</p>
                                <p className="text-lg font-bold text-primary">65% Achieved</p>
                            </div>
                        </div>
                    </div>
                    <ProgressBar percentage={65} label="Syllabus Completion" goal="Goal: 90% by June Exams" />

                    {/* Legend */}
                    <div className="flex gap-6 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <span className="size-2 rounded-full bg-emerald-500"></span>
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Strong (80-100%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="size-2 rounded-full bg-amber-500"></span>
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Needs Practice (50-79%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="size-2 rounded-full bg-rose-500"></span>
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Weak (0-49%)</span>
                        </div>
                    </div>
                </div>

                {/* Topics Accordion List */}
                <div className="space-y-4">
                    {/* Topic Item 1 (Expanded) */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                        <div
                            className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-800/50 cursor-pointer"
                            onClick={() => setExpandedTopic(expandedTopic === 'atomic-structure' ? null : 'atomic-structure')}
                        >
                            <div className="flex items-center gap-4">
                                <span className={`material-symbols-outlined text-slate-400 transition-transform ${expandedTopic === 'atomic-structure' ? 'rotate-180' : ''}`}>expand_more</span>
                                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                    <span className="material-symbols-outlined">blur_on</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white">Physical Chemistry: Atomic Structure</h3>
                                    <p className="text-xs text-slate-500">4 Subtopics • 12 Syllabus Objectives</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="px-2 py-1 rounded bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-[10px] font-bold tracking-wider uppercase">Priority Review</span>
                                <div className="text-right">
                                    <p className="text-sm font-bold">42%</p>
                                </div>
                            </div>
                        </div>

                        {expandedTopic === 'atomic-structure' && (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {/* Subtopic 1 */}
                                <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="size-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]"></div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Orbitals &amp; Electronic Configuration</p>
                                            <p className="text-xs text-slate-500">Last practiced 4 days ago</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Link to="/chat" className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors">
                                            <span className="material-symbols-outlined text-sm">smart_toy</span>
                                            Ask AI Tutor
                                        </Link>
                                        <Link to="/quiz" className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                            <span className="material-symbols-outlined text-sm">quiz</span>
                                            Practice
                                        </Link>
                                    </div>
                                </div>
                                {/* Subtopic 2 */}
                                <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="size-2.5 rounded-full bg-amber-500"></div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Ionisation Energies</p>
                                            <p className="text-xs text-slate-500">Mastery improving</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Link to="/chat" className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg">
                                            <span className="material-symbols-outlined text-sm">smart_toy</span>
                                            Ask AI
                                        </Link>
                                        <Link to="/quiz" className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-semibold rounded-lg">
                                            <span className="material-symbols-outlined text-sm">quiz</span>
                                            Practice
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Topic Item 2 (Collapsed) */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                        <div className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                            <div className="flex items-center gap-4">
                                <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                    <span className="material-symbols-outlined">polyline</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white">Chemical Bonding</h3>
                                    <p className="text-xs text-slate-500">6 Subtopics • 18 Syllabus Objectives</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <p className="text-sm font-bold text-emerald-600">88%</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer CTA */}
                <div className="mt-12 p-8 rounded-2xl bg-gradient-to-br from-primary to-indigo-900 text-white flex flex-col items-center text-center shadow-xl">
                    <div className="size-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mb-6">
                        <span className="material-symbols-outlined text-3xl">psychology</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Ready for a Full Mock Exam?</h3>
                    <p className="text-indigo-100 mb-6 max-w-md">Challenge yourself with a timed Paper 1 or Paper 2 mock exam based on your current weakness identification.</p>
                    <div className="flex gap-4">
                        <Link to="/quiz" className="px-6 py-3 bg-white text-primary font-bold rounded-xl hover:bg-indigo-50 transition-all shadow-lg">Start Mock Exam</Link>
                        <button className="px-6 py-3 bg-primary/40 border border-white/30 text-white font-bold rounded-xl hover:bg-primary/50 transition-all">View Performance History</button>
                    </div>
                </div>
            </div>

            {/* AI Tutor Mini Modal (Visual Only) */}
            <div className="fixed bottom-6 right-6 z-50">
                <Link to="/chat" className="size-14 rounded-full bg-primary text-white shadow-2xl flex items-center justify-center hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-3xl">smart_toy</span>
                </Link>
            </div>
        </div>
    );
};

export default TopicMasteryPage;
