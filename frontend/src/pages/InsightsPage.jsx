import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import StatCard from '../components/dashboard/StatCard';
import ChartPanel from '../components/dashboard/ChartPanel';

const InsightsPage = () => {
    const { currentUser } = useAuth();
    const { toggleSidebar } = useOutletContext() || {};

    return (
        <div className="w-full">
            {/* Top Header */}
            <header className="sticky top-0 z-10 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 md:px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {/* Toggle Button for Mobile */}
                    <button
                        onClick={toggleSidebar}
                        className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        aria-label="Toggle Menu"
                    >
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Learning Insights</h2>
                </div>
                <div className="flex items-center gap-4">
                    <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                        <span className="material-symbols-outlined">calendar_month</span>
                    </button>
                    <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                        <span className="material-symbols-outlined">download</span>
                    </button>
                </div>
            </header>

            <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
                {/* Performance Overview */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">Performance Overview</h3>
                        <select className="bg-white dark:bg-gray-800 border-none text-sm font-medium text-gray-600 dark:text-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20">
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                            <option>This Month</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white dark:bg-background-dark p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                                    <span className="material-symbols-outlined">quiz</span>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Questions Attempted</p>
                                    <h4 className="text-2xl font-black text-gray-800 dark:text-white">1,248</h4>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-green-500 font-bold flex items-center"><span className="material-symbols-outlined text-sm">trending_up</span> +12%</span>
                                <span className="text-gray-400">vs last week</span>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-background-dark p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                                    <span className="material-symbols-outlined">check_circle</span>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Accuracy Rate</p>
                                    <h4 className="text-2xl font-black text-gray-800 dark:text-white">76%</h4>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-green-500 font-bold flex items-center"><span className="material-symbols-outlined text-sm">trending_up</span> +5%</span>
                                <span className="text-gray-400">vs last week</span>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-background-dark p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
                                    <span className="material-symbols-outlined">schedule</span>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Study Time</p>
                                    <h4 className="text-2xl font-black text-gray-800 dark:text-white">24h 12m</h4>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-red-500 font-bold flex items-center"><span className="material-symbols-outlined text-sm">trending_down</span> -2%</span>
                                <span className="text-gray-400">vs last week</span>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-background-dark p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                                    <span className="material-symbols-outlined">emoji_events</span>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Current Streak</p>
                                    <h4 className="text-2xl font-black text-gray-800 dark:text-white">12 Days</h4>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-gray-400">Best: 15 Days</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Detailed Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <ChartPanel />

                        <div className="bg-white dark:bg-background-dark p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Subject Proficiency</h3>
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Chemistry</span>
                                        <span className="text-sm font-bold text-primary">78%</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary rounded-full" style={{ width: '78%' }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Physics</span>
                                        <span className="text-sm font-bold text-amber-500">62%</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-amber-500 rounded-full" style={{ width: '62%' }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Biology</span>
                                        <span className="text-sm font-bold text-emerald-500">85%</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '85%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-white dark:bg-background-dark p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Recent Activity</h3>
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="pt-1">
                                        <div className="p-2 rounded-lg bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                                            <span className="material-symbols-outlined text-lg">check</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-800 dark:text-white">Completed Organic Chem Quiz</h4>
                                        <p className="text-xs text-gray-500 mt-1">Score: 85% • 2 hours ago</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="pt-1">
                                        <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                                            <span className="material-symbols-outlined text-lg">book</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-800 dark:text-white">Studied Thermodynamics</h4>
                                        <p className="text-xs text-gray-500 mt-1">45 mins • Yesterday</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="pt-1">
                                        <div className="p-2 rounded-lg bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">
                                            <span className="material-symbols-outlined text-lg">priority_high</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-800 dark:text-white">Missed Daily Goal</h4>
                                        <p className="text-xs text-gray-500 mt-1">2 days ago</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-primary to-indigo-700 p-6 rounded-2xl text-white shadow-lg">
                            <div className="mb-4">
                                <span className="material-symbols-outlined text-4xl bg-white/20 p-3 rounded-full backdrop-blur-sm">psychology</span>
                            </div>
                            <h3 className="text-lg font-bold mb-2">AI Insight</h3>
                            <p className="text-indigo-100 text-sm mb-6 leading-relaxed">
                                You're showing strong improvement in Organic Chemistry, but your Mechanics scores in Physics have dipped. Consider spending 30 mins exclusively on Projectiles tomorrow.
                            </p>
                            <Link to="/study-plan" className="block w-full text-center py-3 bg-white text-primary font-bold rounded-xl hover:bg-indigo-50 transition-colors">
                                Adjust Study Plan
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InsightsPage;
