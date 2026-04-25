import React from 'react';
import { Link } from 'react-router-dom';

const AuthForm = ({
    title,
    subtitle,
    icon = 'lock_open',
    fields = [],
    submitText = 'Submit',
    footerText,
    footerLinkText,
    footerLinkHref = '#',
    onSubmit,
    error,
    loading = false,
    formData = {},
    onFieldChange
}) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSubmit) {
            onSubmit(e);
        }
    };

    return (
        <div className="bg-white dark:bg-white/5 p-8 rounded-xl shadow-xl shadow-primary/5 border border-[#e9e7f3] dark:border-white/10">
            {/* Header Section */}
            <div className="flex flex-col items-center text-center mb-8">
                <div className="p-3 bg-primary/5 rounded-full mb-4">
                    <span className="material-symbols-outlined text-primary text-3xl">{icon}</span>
                </div>
                <h1 className="text-primary dark:text-white tracking-tight text-2xl sm:text-3xl font-bold leading-tight">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">{subtitle}</p>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
                    <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-sm mt-0.5">error</span>
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
            )}

            {/* Form */}
            <form className="space-y-5" onSubmit={handleSubmit}>
                {fields.map((field, index) => (
                    <div key={index} className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                            <label className="text-charcoal dark:text-gray-200 text-sm font-semibold flex items-center gap-2">
                                {field.icon && (
                                    <span className="material-symbols-outlined text-xs">{field.icon}</span>
                                )}
                                {field.label}
                            </label>
                            {field.helperLink && (
                                <a className="text-primary dark:text-blue-400 text-xs font-medium hover:underline" href={field.helperLink.href}>
                                    {field.helperLink.text}
                                </a>
                            )}
                        </div>
                        <input
                            className="form-input flex w-full rounded-lg text-charcoal dark:text-white border border-[#d3cfe7] dark:border-white/20 bg-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 h-12 px-4 text-base font-normal placeholder:text-gray-400"
                            placeholder={field.placeholder}
                            type={field.type || 'text'}
                            name={field.name}
                            value={formData[field.name] || ''}
                            onChange={onFieldChange}
                            required
                            disabled={loading}
                        />
                    </div>
                ))}

                {/* Remember Me Checkbox */}
                <div className="flex items-center gap-2 px-1">
                    <input
                        className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                        id="remember"
                        type="checkbox"
                        disabled={loading}
                    />
                    <label className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer" htmlFor="remember">
                        Stay logged in for 30 days
                    </label>
                </div>

                {/* Submit Button */}
                <button
                    className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold text-base shadow-lg shadow-primary/25 transition-all active:scale-[0.98] mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Please wait...</span>
                        </>
                    ) : (
                        submitText
                    )}
                </button>
            </form>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-[#e9e7f3] dark:border-white/10 text-center">
                <div className="flex items-center justify-center gap-2 text-gray-400 dark:text-gray-500 text-xs font-normal mb-4">
                    <span className="material-symbols-outlined text-sm">verified_user</span>
                    Your progress is saved securely.
                </div>
                {footerText && (
                    <p className="text-sm text-charcoal dark:text-gray-300">
                        {footerText}
                        <Link className="text-primary dark:text-blue-400 font-bold hover:underline ml-1" to={footerLinkHref}>
                            {footerLinkText}
                        </Link>
                    </p>
                )}
            </div>
        </div>
    );
};

export default AuthForm;
