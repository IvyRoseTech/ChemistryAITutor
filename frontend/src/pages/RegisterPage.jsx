import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const RegisterPage = () => {
    const navigate = useNavigate();
    const { register, error: authError } = useAuth();

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        examLevel: 'ordinary',
        subjects: ['Mathematics', 'Physics', 'Chemistry']
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [subjectInput, setSubjectInput] = useState('');

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleRemoveSubject = (subjectToRemove) => {
        setFormData({
            ...formData,
            subjects: formData.subjects.filter(subject => subject !== subjectToRemove)
        });
    };

    const handleAddSubject = (e) => {
        if (e.key === 'Enter' && subjectInput.trim()) {
            e.preventDefault();
            if (!formData.subjects.includes(subjectInput.trim())) {
                setFormData({
                    ...formData,
                    subjects: [...formData.subjects, subjectInput.trim()]
                });
            }
            setSubjectInput('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Register user with Firebase
            await register(formData.email, formData.password, formData.fullName);

            // TODO: Store additional user data (examLevel, subjects) in Firestore
            // This will be implemented in a future enhancement

            // Redirect to welcome page
            navigate('/welcome', { replace: true });
        } catch (err) {
            // Provide user-friendly error messages
            if (err.code === 'auth/email-already-in-use') {
                setError('This email is already registered. Please log in instead.');
            } else if (err.code === 'auth/weak-password') {
                setError('Password should be at least 6 characters long.');
            } else if (err.code === 'auth/invalid-email') {
                setError('Please enter a valid email address.');
            } else {
                setError(err.message || 'Failed to create account. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col transition-colors duration-300">
            {/* Header */}
            <header className="w-full flex items-center justify-between whitespace-nowrap border-b border-solid border-gray-200 dark:border-gray-800 px-10 py-3 bg-background-light dark:bg-background-dark">
                <Link to="/" className="flex items-center gap-4 text-primary dark:text-white">
                    <div className="size-6">
                        <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <path clipRule="evenodd" d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z" fillRule="evenodd"></path>
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold leading-tight tracking-tight">GCE Prep</h2>
                </Link>
                <div className="flex items-center gap-8">
                    <nav className="hidden md:flex items-center gap-9">
                        <Link className="text-gray-700 dark:text-gray-300 text-sm font-medium hover:text-primary transition-colors" to="/">Home</Link>
                        <Link className="text-gray-700 dark:text-gray-300 text-sm font-medium hover:text-primary transition-colors" to="/dashboard">Dashboard</Link>
                    </nav>
                    <Link to="/login">
                        <button className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold transition-opacity hover:opacity-90">
                            Login
                        </button>
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-[560px] bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                    <div className="pt-10 pb-6 px-8 text-center">
                        <h1 className="text-gray-900 dark:text-white text-3xl font-bold leading-tight mb-2">Create Your Student Account</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-base">Start your journey to academic excellence.</p>
                    </div>

                    {/* Error Message */}
                    {(error || authError) && (
                        <div className="mx-8 mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
                            <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-sm mt-0.5">error</span>
                            <p className="text-sm text-red-600 dark:text-red-400">{error || authError}</p>
                        </div>
                    )}

                    <form className="px-8 pb-10 space-y-5" onSubmit={handleSubmit}>
                        {/* Full Name */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-gray-800 dark:text-gray-200 text-sm font-semibold">Full Name</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">person</span>
                                <input
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-background-light dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400"
                                    placeholder="e.g. John Doe"
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-gray-800 dark:text-gray-200 text-sm font-semibold">Email Address</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">mail</span>
                                <input
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-background-light dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400"
                                    placeholder="name@example.com"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Password & Exam Level Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-gray-800 dark:text-gray-200 text-sm font-semibold">Password</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">lock</span>
                                    <input
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-background-light dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400"
                                        placeholder="••••••••"
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required
                                        minLength={6}
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-gray-800 dark:text-gray-200 text-sm font-semibold">Exam Level</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">school</span>
                                    <select
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-background-light dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none cursor-pointer"
                                        name="examLevel"
                                        value={formData.examLevel}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                    >
                                        <option value="ordinary">Ordinary Level</option>
                                        <option value="advanced">Advanced Level</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                                </div>
                            </div>
                        </div>

                        {/* Select Subjects */}
                        <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-center">
                                <label className="text-gray-800 dark:text-gray-200 text-sm font-semibold">Select Subjects</label>
                                <span className="text-[11px] text-gray-400 uppercase tracking-wider font-bold">Multi-select</span>
                            </div>
                            <div className="min-h-[100px] w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-background-light dark:bg-gray-800 flex flex-wrap gap-2 content-start">
                                {/* Chips */}
                                {formData.subjects.map((subject, index) => (
                                    <div key={index} className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary dark:text-primary/90 px-3 py-1 rounded-full text-xs font-medium">
                                        {subject}
                                        <span
                                            className="material-symbols-outlined text-sm cursor-pointer hover:text-red-500 transition-colors"
                                            onClick={() => handleRemoveSubject(subject)}
                                        >
                                            close
                                        </span>
                                    </div>
                                ))}
                                <input
                                    className="bg-transparent border-none focus:ring-0 p-0 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 w-24"
                                    placeholder="Add more..."
                                    type="text"
                                    value={subjectInput}
                                    onChange={(e) => setSubjectInput(e.target.value)}
                                    onKeyDown={handleAddSubject}
                                    disabled={loading}
                                />
                            </div>
                            <p className="text-[12px] text-gray-500 italic mt-1 px-1 flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">info</span>
                                This helps us tailor your personalized dashboard.
                            </p>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <button
                                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>Creating Account...</span>
                                    </>
                                ) : (
                                    <>
                                        Create Account
                                        <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Footer Link */}
                        <div className="text-center pt-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Already have an account?
                                <Link className="text-primary font-semibold hover:underline" to="/login"> Log in</Link>
                            </p>
                        </div>
                    </form>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-6 text-center text-gray-400 text-xs">
                © 2024 GCE Prep. All rights reserved.
                <div className="mt-1 flex justify-center gap-4">
                    <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
                    <a className="hover:text-primary transition-colors" href="#">Terms of Service</a>
                </div>
            </footer>
        </div>
    );
};

export default RegisterPage;



