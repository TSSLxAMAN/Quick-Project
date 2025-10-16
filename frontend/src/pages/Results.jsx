import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Results = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all'); // all, high, medium, low
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchResults();
    }, []);

    const fetchResults = async () => {
        try {
            setLoading(true);
            // Replace with your actual API call
            const response = await fetch('/api/results', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch results');
            }

            const data = await response.json();
            setResults(data.results || []);
        } catch (err) {
            setError(err.message || 'Failed to load results');
        } finally {
            setLoading(false);
        }
    };

    const getSimilarityColor = (similarity) => {
        if (similarity > 70) return 'bg-red-900/50 text-red-300 border-red-700';
        if (similarity > 40) return 'bg-yellow-900/50 text-yellow-300 border-yellow-700';
        return 'bg-green-900/50 text-green-300 border-green-700';
    };

    const getSimilarityIcon = (similarity) => {
        if (similarity > 70) return '🔴';
        if (similarity > 40) return '🟡';
        return '🟢';
    };

    const filteredResults = results.filter(result => {
        const matchesSearch = result.assignment_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            result.student_name?.toLowerCase().includes(searchTerm.toLowerCase());

        if (filter === 'all') return matchesSearch;
        if (filter === 'high') return matchesSearch && result.avg_similarity > 70;
        if (filter === 'medium') return matchesSearch && result.avg_similarity > 40 && result.avg_similarity <= 70;
        if (filter === 'low') return matchesSearch && result.avg_similarity <= 40;

        return matchesSearch;
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-xl text-gray-300">Loading results...</div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto py-8">
            {/* Header */}
            <div className="relative mb-8">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-2xl blur opacity-20"></div>
                <div className="relative bg-gray-900 rounded-2xl shadow-2xl p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-100 mb-2">
                                Analysis Results
                            </h1>
                            <p className="text-gray-400">
                                View and manage your plagiarism check history
                            </p>
                        </div>
                        <Link
                            to="/analyze"
                            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 font-medium text-center"
                        >
                            + New Analysis
                        </Link>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {/* Filters and Search */}
            <div className="bg-gray-900 rounded-xl shadow-lg p-6 mb-6 border border-gray-700">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Search by assignment or student name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                    </div>

                    {/* Filter Buttons */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'all'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('high')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'high'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                }`}
                        >
                            High
                        </button>
                        <button
                            onClick={() => setFilter('medium')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'medium'
                                    ? 'bg-yellow-600 text-white'
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                }`}
                        >
                            Medium
                        </button>
                        <button
                            onClick={() => setFilter('low')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'low'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                }`}
                        >
                            Low
                        </button>
                    </div>
                </div>
            </div>

            {/* Results List */}
            {filteredResults.length === 0 ? (
                <div className="bg-gray-900 rounded-xl shadow-lg p-12 text-center border border-gray-700">
                    <div className="text-6xl mb-4">📊</div>
                    <h3 className="text-2xl font-bold text-gray-100 mb-2">No Results Found</h3>
                    <p className="text-gray-400 mb-6">
                        {searchTerm || filter !== 'all'
                            ? 'Try adjusting your filters or search term'
                            : "You haven't run any plagiarism checks yet"}
                    </p>
                    <Link
                        to="/analyze"
                        className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 font-medium"
                    >
                        Start First Analysis
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredResults.map((result) => (
                        <div
                            key={result.id}
                            className="bg-gray-900 rounded-xl shadow-lg border border-gray-700 hover:border-indigo-500 transition-all"
                        >
                            <div className="p-6">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    {/* Left Side - Assignment Info */}
                                    <div className="flex-1">
                                        <div className="flex items-start gap-3 mb-3">
                                            <span className="text-3xl">{getSimilarityIcon(result.avg_similarity)}</span>
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-gray-100 mb-1">
                                                    {result.assignment_name}
                                                </h3>
                                                <div className="flex flex-wrap gap-3 text-sm text-gray-400">
                                                    <span className="flex items-center gap-1">
                                                        <span>📅</span>
                                                        {result.date}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <span>📄</span>
                                                        {result.file_count} file{result.file_count !== 1 ? 's' : ''}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <span>⏱️</span>
                                                        {result.processing_time}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Similarity Score */}
                                        <div className="flex items-center gap-4">
                                            <div>
                                                <p className="text-sm text-gray-400 mb-1">Average Similarity</p>
                                                <span className={`inline-block px-4 py-1 rounded-full text-lg font-bold border ${getSimilarityColor(result.avg_similarity)}`}>
                                                    {result.avg_similarity}%
                                                </span>
                                            </div>
                                            {result.highest_similarity && (
                                                <div>
                                                    <p className="text-sm text-gray-400 mb-1">Highest Match</p>
                                                    <span className={`inline-block px-4 py-1 rounded-full text-lg font-bold border ${getSimilarityColor(result.highest_similarity)}`}>
                                                        {result.highest_similarity}%
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right Side - Actions */}
                                    <div className="flex flex-col gap-2">
                                        <Link
                                            to={`/results/${result.id}`}
                                            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-500 transition-all font-medium text-center"
                                        >
                                            View Details
                                        </Link>
                                        <button className="bg-gray-800 text-gray-300 px-6 py-2 rounded-lg hover:bg-gray-700 transition-all font-medium border border-gray-700">
                                            Download Report
                                        </button>
                                    </div>
                                </div>

                                {/* Status Tags */}
                                {result.flagged_count > 0 && (
                                    <div className="mt-4 pt-4 border-t border-gray-700">
                                        <div className="flex items-center gap-2 text-red-400">
                                            <span>⚠️</span>
                                            <span className="text-sm font-medium">
                                                {result.flagged_count} submission{result.flagged_count !== 1 ? 's' : ''} flagged for review
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Summary Stats */}
            {results.length > 0 && (
                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-900 rounded-lg p-4 border border-gray-700 text-center">
                        <p className="text-gray-400 text-sm mb-1">Total Analyses</p>
                        <p className="text-2xl font-bold text-gray-100">{results.length}</p>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4 border border-gray-700 text-center">
                        <p className="text-gray-400 text-sm mb-1">Total Files</p>
                        <p className="text-2xl font-bold text-gray-100">
                            {results.reduce((sum, r) => sum + (r.file_count || 0), 0)}
                        </p>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4 border border-gray-700 text-center">
                        <p className="text-gray-400 text-sm mb-1">High Risk</p>
                        <p className="text-2xl font-bold text-red-400">
                            {results.filter(r => r.avg_similarity > 70).length}
                        </p>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4 border border-gray-700 text-center">
                        <p className="text-gray-400 text-sm mb-1">Clean Results</p>
                        <p className="text-2xl font-bold text-green-400">
                            {results.filter(r => r.avg_similarity <= 40).length}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Results;