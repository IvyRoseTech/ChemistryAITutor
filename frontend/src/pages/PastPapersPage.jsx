import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';

const PastPapersPage = () => {
    const { toggleSidebar } = useOutletContext() || {};
    const [selectedPDF, setSelectedPDF] = useState(null);

    // Sample past papers - you can add your 3 PDFs here
    const pastPapers = [
        {
            id: 1,
            title: 'GCE 2023 Chemistry Paper 1',
            year: 2023,
            paper: 1,
            file: '/pdfs/chemistry-2023-paper1.pdf',
            cover: '/images/covers/chemistry-2023-paper1.jpg'
        },
        {
            id: 2,
            title: 'GCE 2023 Chemistry Paper 2',
            year: 2023,
            paper: 2,
            file: '/pdfs/chemistry-2023-paper2.pdf',
            cover: '/images/covers/chemistry-2023-paper2.jpg'
        },
        {
            id: 3,
            title: 'GCE 2022 Chemistry Paper 1',
            year: 2022,
            paper: 1,
            file: '/pdfs/chemistry-2022-paper1.pdf',
            cover: '/images/covers/chemistry-2022-paper1.jpg'
        }
    ];

    const handleViewPDF = (paper) => {
        setSelectedPDF(paper);
    };

    const handleClosePDF = () => {
        setSelectedPDF(null);
    };

    return (
        <div className="w-full min-h-screen bg-background-light dark:bg-background-dark">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 md:px-8 py-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleSidebar}
                        className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        aria-label="Toggle Menu"
                    >
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">GCE Chemistry Past Papers</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">View and download past examination papers</p>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="p-4 md:p-8 max-w-7xl mx-auto">
                {!selectedPDF ? (
                    <div className="space-y-6">
                        {/* Papers Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {pastPapers.map((paper) => (
                                <div
                                    key={paper.id}
                                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-primary dark:hover:border-primary transition-all cursor-pointer group shadow-sm hover:shadow-xl"
                                    onClick={() => handleViewPDF(paper)}
                                >
                                    {/* Cover Image */}
                                    <div className="relative h-64 bg-gradient-to-br from-primary/20 to-purple-500/20 overflow-hidden">
                                        <img
                                            src={paper.cover}
                                            alt={paper.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            onError={(e) => {
                                                // Fallback to gradient if image not found
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                                            <div className="text-white">
                                                <p className="text-xs font-semibold uppercase tracking-wider opacity-90">Chemistry</p>
                                                <h3 className="text-lg font-bold">{paper.year} Paper {paper.paper}</h3>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 rounded bg-primary/10 text-primary">
                                                    <span className="material-symbols-outlined text-sm">description</span>
                                                </div>
                                                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Click to View
                                                </span>
                                            </div>
                                            <span className="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform">
                                                arrow_forward
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* PDF Viewer */
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                        <div className="bg-gray-100 dark:bg-gray-900 px-6 py-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
                            <div>
                                <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                                    {selectedPDF.title}
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {selectedPDF.year} Chemistry Paper {selectedPDF.paper}
                                </p>
                            </div>
                            <button
                                onClick={handleClosePDF}
                                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="h-[calc(100vh-250px)]">
                            <iframe
                                src={selectedPDF.file}
                                className="w-full h-full"
                                title={selectedPDF.title}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PastPapersPage;
