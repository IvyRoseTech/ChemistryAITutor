import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const WelcomePage = () => {
    const { currentUser } = useAuth();
    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col transition-colors duration-300">
            {/* Top Navigation Bar */}
            <header className="w-full border-b border-[#eae9f1] dark:border-white/10 bg-background-light dark:bg-background-dark">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="size-8 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-3xl font-bold">school</span>
                        </div>
                        <h1 className="text-[#101019] dark:text-white text-xl font-bold tracking-tight">GCE Prep</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div
                            className="h-10 w-10 rounded-full border-2 border-primary/20 bg-cover bg-center"
                            style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuD2M9leyGvdSdyxPfxVlhiAwTuSyYp2vG0cAQWQiz-fDCB5nNk-iUwpM314o07qmmb5TlXwRmXaOWdnEWxcmZ3BtsAEhvhC4lqKIR2F2OTBI8yzVkNFdm_PrfePVB9Ziu5R2oMC4peGJ0zEaET1eiQOmChlE7M5vP7PChjb12Jsz0iqPa8t9MfBECUYiQ8guTF_IFYRjNLBPB_WRU7S3yhOyc1WQLhv1oun0ktmRIU43qcozJyjOj_lXwrdw9wHmbVquz9juLHMsfL9")' }}
                        >
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-grow flex items-center justify-center p-6">
                <div className="w-full max-w-[640px] flex flex-col gap-8">
                    {/* Progress Indicator */}
                    <div className="flex flex-col gap-3 px-4">
                        <div className="flex gap-6 justify-between items-center">
                            <p className="text-[#101019] dark:text-white/90 text-base font-medium">Finalizing Profile</p>
                            <p className="text-primary text-sm font-bold">90% Complete</p>
                        </div>
                        <div className="rounded-full bg-[#eae9f1] dark:bg-white/10 overflow-hidden h-2.5">
                            <div className="h-full rounded-full bg-primary" style={{ width: '90%' }}></div>
                        </div>
                        <p className="text-[#5b5b8b] dark:text-primary/70 text-sm font-normal">One step away from your personalized study plan</p>
                    </div>

                    {/* Welcome Success Card */}
                    <div className="bg-white dark:bg-white/5 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-[#eae9f1] dark:border-white/10 overflow-hidden">
                        {/* Visual Header */}
                        <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#f5b400 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                            <div className="relative flex flex-col items-center">
                                <div className="bg-primary text-[#101019] w-16 h-16 rounded-full flex items-center justify-center shadow-lg mb-4">
                                    <span className="material-symbols-outlined text-3xl">check_circle</span>
                                </div>
                                <h2 className="text-2xl font-bold text-[#101019] dark:text-white">Account Created!</h2>
                            </div>
                        </div>

                        {/* Card Content */}
                        <div className="p-8 flex flex-col gap-6">
                            <div className="text-center space-y-2">
                                <h3 className="text-xl font-bold text-[#101019] dark:text-white">Welcome to GCE Prep, {currentUser?.displayName?.split(' ')[0] || 'Student'}</h3>
                                <p className="text-[#5b5b8b] dark:text-primary/70 text-base leading-relaxed max-w-md mx-auto">
                                    Let's identify your weak topics and start improving. The diagnostic quiz takes only 5-10 minutes and tailors the platform to your needs.
                                </p>
                            </div>

                            {/* CTA Button */}
                            <div className="flex flex-col gap-4">
                                <Link to="/quiz" className="w-full flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-14 bg-primary text-[#101019] text-lg font-bold transition-all hover:scale-[1.01] active:scale-[0.99] shadow-md shadow-primary/20">
                                    <span className="material-symbols-outlined">rocket_launch</span>
                                    <span>Start Diagnostic Quiz</span>
                                </Link>
                                <Link to="/dashboard" className="w-full h-12 flex items-center justify-center bg-transparent text-[#5b5b8b] dark:text-primary/80 text-sm font-semibold hover:text-[#101019] dark:hover:text-white transition-colors">
                                    Skip for now, go to Dashboard
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Supporting Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex flex-col items-center text-center p-4">
                            <span className="material-symbols-outlined text-primary mb-2">timer</span>
                            <span className="text-[#101019] dark:text-white text-xs font-bold uppercase tracking-wider">5-10 Mins</span>
                            <p className="text-[#5b5b8b] text-[10px] mt-1">Average completion time</p>
                        </div>
                        <div className="flex flex-col items-center text-center p-4">
                            <span className="material-symbols-outlined text-primary mb-2">auto_awesome</span>
                            <span className="text-[#101019] dark:text-white text-xs font-bold uppercase tracking-wider">Personalized</span>
                            <p className="text-[#5b5b8b] text-[10px] mt-1">AI-generated study path</p>
                        </div>
                        <div className="flex flex-col items-center text-center p-4">
                            <span className="material-symbols-outlined text-primary mb-2">trending_up</span>
                            <span className="text-[#101019] dark:text-white text-xs font-bold uppercase tracking-wider">Fast Results</span>
                            <p className="text-[#5b5b8b] text-[10px] mt-1">Target weak areas first</p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full py-8 px-4 mt-auto">
                <div className="max-w-4xl mx-auto flex flex-col gap-6">
                    <div className="flex flex-wrap items-center justify-center gap-8 border-t border-[#eae9f1] dark:border-white/5 pt-8">
                        <a className="text-[#5b5b8b] dark:text-primary/60 text-sm font-medium hover:text-primary transition-colors" href="#">Privacy Policy</a>
                        <a className="text-[#5b5b8b] dark:text-primary/60 text-sm font-medium hover:text-primary transition-colors" href="#">Terms of Service</a>
                        <a className="text-[#5b5b8b] dark:text-primary/60 text-sm font-medium hover:text-primary transition-colors" href="#">Help Center</a>
                    </div>
                    <p className="text-[#5b5b8b] dark:text-primary/40 text-sm text-center">© 2024 GCE Prep. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default WelcomePage;
