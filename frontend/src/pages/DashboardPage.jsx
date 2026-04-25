import React from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import StatCard from '../components/dashboard/StatCard';
import ChartPanel from '../components/dashboard/ChartPanel';

const DashboardPage = () => {
    const { currentUser } = useAuth();
    // Get state and toggle function from DashboardLayout
    const { toggleSidebar } = useOutletContext() || {};

    return (
        <div className="w-full">
            {/* Top Header & Stats */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-4">
                    {/* Sidebar Toggle Button (Mobile/Tablet) */}
                    <button
                        onClick={toggleSidebar}
                        className="lg:hidden p-2 rounded-lg bg-white dark:bg-gray-800 text-charcoal dark:text-white shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        aria-label="Toggle Menu"
                    >
                        <span className="material-symbols-outlined">menu</span>
                    </button>

                    <div>
                        <h2 className="text-charcoal dark:text-white text-3xl md:text-4xl font-black tracking-tight mb-1 md:mb-2">
                            Hello, {currentUser?.displayName?.split(' ')[0] || 'Student'}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm md:text-lg">Ready to master your GCE subjects today?</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-4 bg-white dark:bg-background-dark p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <div className="relative w-16 h-16 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle className="text-gray-100 dark:text-gray-800" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeWidth="4"></circle>
                                <circle className="text-primary" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeDasharray="176" strokeDashoffset="49" strokeWidth="4"></circle>
                            </svg>
                            <span className="absolute text-sm font-bold text-primary">72%</span>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Mastery</p>
                            <p className="text-charcoal dark:text-white font-bold">+5% this week</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 bg-white dark:bg-background-dark p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-3 rounded-full">
                            <span className="material-symbols-outlined">local_fire_department</span>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Streak</p>
                            <p className="text-charcoal dark:text-white font-bold">12 Days</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Center Section: Weakness Heatmap */}
                <section className="lg:col-span-2 flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-charcoal dark:text-white">Weakness Heatmap</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Legend:</span>
                            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-accent-amber"></div> <span className="text-[10px] text-gray-500">Critical</span></div>
                            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-teal-500"></div> <span className="text-[10px] text-gray-500">Moderate</span></div>
                            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-primary"></div> <span className="text-[10px] text-gray-500">Strong</span></div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <StatCard icon="science" title="Organic Chemistry" status="Critical Weakness" variant="critical" />
                        <StatCard icon="fitness_center" title="Mechanics" status="Moderate Mastery" variant="moderate" />
                        <StatCard icon="functions" title="Pure Maths" status="High Mastery" variant="strong" />
                        <StatCard icon="genetics" title="Cell Biology" status="Critical Weakness" variant="critical" />
                        <StatCard icon="language" title="English Literature" status="Moderate Mastery" variant="moderate" />
                        <StatCard icon="payments" title="Economics" status="High Mastery" variant="strong" />
                    </div>
                    <ChartPanel />
                </section>

                {/* Right Section: Focus Areas Card */}
                <section className="flex flex-col gap-6">
                    <div className="bg-white dark:bg-background-dark p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl relative overflow-hidden h-full">
                        {/* AI Gradient accent */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-amber/10 blur-3xl -mr-16 -mt-16"></div>
                        <div className="flex items-center gap-2 mb-6">
                            <span className="material-symbols-outlined text-accent-amber">psychology</span>
                            <h3 className="text-xl font-bold text-charcoal dark:text-white">AI Focus Areas</h3>
                        </div>
                        <p className="text-sm text-gray-500 mb-6 leading-relaxed">Based on your recent practice results, focus on these 3 subtopics to maximize your score:</p>
                        <div className="flex flex-col gap-4 mb-8">
                            <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border-l-4 border-accent-amber">
                                <div className="text-accent-amber font-black text-lg">1.</div>
                                <div>
                                    <h5 className="text-sm font-bold text-charcoal dark:text-white">Organic Chem: Alkanes</h5>
                                    <p className="text-xs text-gray-400">Recall error: Nomenclature</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border-l-4 border-teal-500">
                                <div className="text-teal-500 font-black text-lg">2.</div>
                                <div>
                                    <h5 className="text-sm font-bold text-charcoal dark:text-white">Mechanics: Projectiles</h5>
                                    <p className="text-xs text-gray-400">Calculation error: Angle factors</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border-l-4 border-primary">
                                <div className="text-primary font-black text-lg">3.</div>
                                <div>
                                    <h5 className="text-sm font-bold text-charcoal dark:text-white">Pure Maths: Limits</h5>
                                    <p className="text-xs text-gray-400">Efficiency: Speed optimization</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-auto">
                            <Link to="/quiz" className="w-full bg-accent-amber hover:bg-amber-500 text-charcoal font-black py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 mb-4 group">
                                <span>Start Recommended Quiz</span>
                                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </Link>
                            <p className="text-[11px] text-center text-gray-400 uppercase font-bold tracking-widest">Estimated time: 15 mins</p>
                        </div>
                    </div>

                    {/* Past Papers Section */}
                    <div className="bg-white dark:bg-background-dark p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">description</span>
                                <h3 className="text-xl font-bold text-charcoal dark:text-white">Past Papers</h3>
                            </div>
                            <Link
                                to="/past-papers"
                                className="text-sm text-primary hover:underline font-semibold"
                            >
                                View All
                            </Link>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">Practice with GCE Chemistry past papers</p>

                        <div className="space-y-3">
                            <Link
                                to="/past-papers"
                                className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                            >
                                <div className="p-2 rounded bg-primary/10 text-primary">
                                    <span className="material-symbols-outlined text-sm">description</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-charcoal dark:text-white">2023 Paper 1</p>
                                    <p className="text-xs text-gray-500">Chemistry</p>
                                </div>
                                <span className="material-symbols-outlined text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all">
                                    arrow_forward
                                </span>
                            </Link>

                            <Link
                                to="/past-papers"
                                className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                            >
                                <div className="p-2 rounded bg-primary/10 text-primary">
                                    <span className="material-symbols-outlined text-sm">description</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-charcoal dark:text-white">2023 Paper 2</p>
                                    <p className="text-xs text-gray-500">Chemistry</p>
                                </div>
                                <span className="material-symbols-outlined text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all">
                                    arrow_forward
                                </span>
                            </Link>

                            <Link
                                to="/past-papers"
                                className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                            >
                                <div className="p-2 rounded bg-primary/10 text-primary">
                                    <span className="material-symbols-outlined text-sm">description</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-charcoal dark:text-white">2022 Paper 1</p>
                                    <p className="text-xs text-gray-500">Chemistry</p>
                                </div>
                                <span className="material-symbols-outlined text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all">
                                    arrow_forward
                                </span>
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};


export default DashboardPage;
