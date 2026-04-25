import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import StatCard from '../components/ui/StatCard';
import FeatureCard from '../components/ui/FeatureCard';
import IconBox from '../components/ui/IconBox';
import Navbar from '../components/ui/Navbar';

const HomePage = () => {
    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
            {/* Navigation Bar */}
            <Navbar />

            <main className="flex flex-col flex-1">
                {/* Hero Section */}
                <section className="bg-deep-indigo text-white py-16 md:py-24">
                    <div className="max-w-[1200px] mx-auto px-4 md:px-20 lg:px-40">
                        <div className="flex flex-col gap-8 md:flex-row items-center">
                            <div className="flex flex-col gap-6 md:w-1/2">
                                <div className="flex flex-col gap-4">
                                    <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] md:text-6xl">
                                        Master the GCE Syllabus. One Weak Topic at a Time.
                                    </h1>
                                    <p className="text-white/80 text-base md:text-lg font-normal leading-relaxed">
                                        Specifically designed for the Cameroon General Certificate of Education. Pinpoint your weaknesses and turn them into strengths with AI-powered tutoring aligned with the official standards.
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-4">
                                    <Link to="/register">
                                        <Button variant="secondary" className="min-w-[160px] h-12 px-6 text-base">
                                            Start Learning
                                        </Button>
                                    </Link>
                                    <Link to="/login">
                                        <Button variant="outline" className="min-w-[160px] h-12 px-6 text-base">
                                            Login
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                            <div className="w-full md:w-1/2 mt-8 md:mt-0">
                                <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl bg-slate-800 border-4 border-white/10">
                                    <div
                                        className="absolute inset-0 bg-cover bg-center"
                                        style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAKtBWfX37GEnWGWsmiykzM_qMXIUDF7W6CkI-q4TPov5TAU9zV9Mj7QV5DZaLC553foRlwSLJD8s0RROEyIv4eZrjbB1nRVJ8Kc-fWYXrKbaCuNC9fV-On31ZPLjiFx9yH9DcjfHnvxBa_9NhoVS4IPyp81KvAbcb4DrTsTFqPW4YcX8NMou9qbMCcAmznbSQg19cUHuiV1etZc1EYGKCE1_rL8cgoGvQolDJB3FPW0XSdW2_uIGlTq0VwbwzBja1DlXKbHmQWFqsQ")' }}
                                    ></div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-deep-indigo/40 to-transparent"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats/Trust Section */}
                <section className="py-12 bg-white dark:bg-background-dark/50">
                    <div className="max-w-[1200px] mx-auto px-4 md:px-20 lg:px-40">
                        <div className="flex flex-wrap justify-center gap-6">
                            <StatCard
                                label="Aligned to Syllabus"
                                value="Cameroon GCE"
                                description="Full coverage of A/O Level"
                            />
                            <StatCard
                                label="Success Rate"
                                value="94%"
                                description="Average grade improvement"
                            />
                            <StatCard
                                label="Resources"
                                value="10,000+"
                                description="Verified past paper questions"
                            />
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section className="py-20">
                    <div className="max-w-[1200px] mx-auto px-4 md:px-20 lg:px-40">
                        <div className="flex flex-col items-center mb-12">
                            <span className="text-primary font-bold text-sm tracking-widest uppercase mb-2">Our Process</span>
                            <h2 className="text-[#101910] dark:text-white text-4xl font-black leading-tight tracking-tight text-center">How It Works</h2>
                            <div className="h-1.5 w-20 bg-primary mt-4 rounded-full"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <FeatureCard
                                icon="troubleshoot"
                                title="1. Diagnose"
                                description="Take a quick assessment to find specific gaps in your subject knowledge across the syllabus."
                            />
                            <FeatureCard
                                icon="edit_note"
                                title="2. Practice"
                                description="Engage with AI-generated questions and past papers tailored to the Cameroon GCE marking scheme."
                            />
                            <FeatureCard
                                icon="trending_up"
                                title="3. Improve"
                                description="Review real-time feedback and detailed topic tracking to boost your score efficiently."
                            />
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="py-20 bg-white dark:bg-background-dark">
                    <div className="max-w-[1200px] mx-auto px-4 md:px-20 lg:px-40">
                        <div className="flex flex-col md:flex-row gap-16 items-center">
                            <div className="md:w-1/2">
                                <h2 className="text-[#101910] dark:text-white text-3xl md:text-4xl font-black mb-6">
                                    Designed specifically for Cameroonian Students.
                                </h2>
                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <span className="material-symbols-outlined text-primary">check_circle</span>
                                        <div>
                                            <h4 className="font-bold text-lg dark:text-white">Full Syllabus Mapping</h4>
                                            <p className="text-sm text-gray-600 dark:text-white/60">
                                                Every topic from the Cameroon GCE Board is included, from Biology to Pure Maths.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <span className="material-symbols-outlined text-primary">check_circle</span>
                                        <div>
                                            <h4 className="font-bold text-lg dark:text-white">AI Personal Tutor</h4>
                                            <p className="text-sm text-gray-600 dark:text-white/60">
                                                Get instant explanations for complex concepts in plain, easy-to-understand language.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <span className="material-symbols-outlined text-primary">check_circle</span>
                                        <div>
                                            <h4 className="font-bold text-lg dark:text-white">Offline Mode</h4>
                                            <p className="text-sm text-gray-600 dark:text-white/60">
                                                Download materials and practice even when internet access is limited.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="md:w-1/2 grid grid-cols-2 gap-4">
                                <IconBox icon="auto_graph" label="Real-time Analytics" variant="default" />
                                <IconBox icon="history_edu" label="Past Paper Bank" variant="indigo" />
                                <IconBox icon="forum" label="Study Groups" variant="teal" />
                                <IconBox icon="emoji_events" label="Goal Setting" variant="default" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-24">
                    <div className="max-w-[1200px] mx-auto px-4 md:px-20 lg:px-40">
                        <div className="bg-primary rounded-3xl p-8 md:p-16 text-center text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <span className="material-symbols-outlined text-[150px]">school</span>
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black mb-6 relative z-10">Ready to ace your GCE?</h2>
                            <p className="text-white/90 text-lg mb-10 max-w-2xl mx-auto relative z-10">
                                Join thousands of students in Buea, Yaounde, and Douala who are using GCE Prep to secure their future.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                                <Link to="/register">
                                    <Button variant="white" className="px-8 py-4 h-auto text-lg">Create Free Account</Button>
                                </Link>
                                <Link to="/dashboard">
                                    <Button variant="indigo" className="px-8 py-4 h-auto text-lg">View Dashboard</Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-white dark:bg-background-dark border-t border-[#eae9f1] dark:border-white/10 pt-16 pb-8">
                <div className="max-w-[1200px] mx-auto px-4 md:px-20 lg:px-40">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-12">
                        <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
                            <div className="flex items-center gap-2">
                                <div className="text-primary size-5">
                                    <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                        <path clipRule="evenodd" d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z" fillRule="evenodd"></path>
                                    </svg>
                                </div>
                                <span className="font-bold text-xl dark:text-white">GCE Prep</span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-white/50 leading-relaxed">
                                Empowering Cameroonian students through intelligent, personalized GCE preparation and study resources.
                            </p>
                        </div>
                        <div>
                            <h5 className="font-bold mb-4 dark:text-white">Subjects</h5>
                            <ul className="text-sm text-gray-500 dark:text-white/60 space-y-2">
                                <li><a className="hover:text-primary" href="#">Mathematics</a></li>
                                <li><a className="hover:text-primary" href="#">Biology</a></li>
                                <li><a className="hover:text-primary" href="#">Chemistry</a></li>
                                <li><a className="hover:text-primary" href="#">Economics</a></li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-bold mb-4 dark:text-white">Company</h5>
                            <ul className="text-sm text-gray-500 dark:text-white/60 space-y-2">
                                <li><a className="hover:text-primary" href="#">About Us</a></li>
                                <li><a className="hover:text-primary" href="#">Success Stories</a></li>
                                <li><a className="hover:text-primary" href="#">Terms of Service</a></li>
                                <li><a className="hover:text-primary" href="#">Privacy Policy</a></li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-bold mb-4 dark:text-white">Contact</h5>
                            <ul className="text-sm text-gray-500 dark:text-white/60 space-y-2">
                                <li>Email: hello@gceprep.cm</li>
                                <li>Phone: +237 6XX XXX XXX</li>
                                <li>Office: Buea, SW Region</li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-gray-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-xs text-gray-400">© 2024 GCE Prep. All rights reserved.</p>
                        <div className="flex gap-6">
                            <a className="text-gray-400 hover:text-primary" href="#">
                                <span className="material-symbols-outlined text-xl">social_leaderboard</span>
                            </a>
                            <a className="text-gray-400 hover:text-primary" href="#">
                                <span className="material-symbols-outlined text-xl">language</span>
                            </a>
                            <a className="text-gray-400 hover:text-primary" href="#">
                                <span className="material-symbols-outlined text-xl">alternate_email</span>
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
