import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Analyze = () => {
    const [files, setFiles] = useState([]);
    const [assignmentName, setAssignmentName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        const pdfFiles = selectedFiles.filter(file => file.type === 'application/pdf');

        if (pdfFiles.length !== selectedFiles.length) {
            setError('Only PDF files are allowed');
            return;
        }

        setFiles(pdfFiles);
        setError('');
    };

    const handleRemoveFile = (index) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (files.length === 0) {
            setError('Please select at least one PDF file');
            return;
        }

        if (!assignmentName.trim()) {
            setError('Please enter an assignment name');
            return;
        }

        setLoading(true);
        setError('');
        setUploadProgress(0);

        try {
            const formData = new FormData();
            formData.append('assignment_name', assignmentName);
            files.forEach((file) => {
                formData.append('files', file);
            });

            // Simulate upload progress
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 200);

            // Replace with your actual API call
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: formData,
            });

            clearInterval(progressInterval);
            setUploadProgress(100);

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const result = await response.json();

            // Navigate to results page with the analysis ID
            setTimeout(() => {
                navigate(`/results/${result.analysis_id}`);
            }, 500);

        } catch (err) {
            setError(err.message || 'Failed to upload files. Please try again.');
            setUploadProgress(0);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-2xl blur opacity-20"></div>
                <div className="relative bg-gray-900 rounded-2xl shadow-2xl p-8">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-100 mb-2">
                            New Plagiarism Analysis
                        </h1>
                        <p className="text-gray-400">
                            Upload student assignments in PDF format to check for plagiarism
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Assignment Name */}
                        <div>
                            <label htmlFor="assignmentName" className="block text-gray-300 font-medium mb-2">
                                Assignment Name *
                            </label>
                            <input
                                type="text"
                                id="assignmentName"
                                value={assignmentName}
                                onChange={(e) => setAssignmentName(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                placeholder="e.g., Data Structures Assignment 1"
                                disabled={loading}
                            />
                        </div>

                        {/* File Upload Area */}
                        <div>
                            <label className="block text-gray-300 font-medium mb-2">
                                Upload PDF Files *
                            </label>
                            <div className="relative">
                                <input
                                    type="file"
                                    id="fileInput"
                                    multiple
                                    accept=".pdf"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    disabled={loading}
                                />
                                <label
                                    htmlFor="fileInput"
                                    className="flex flex-col items-center justify-center w-full h-48 bg-gray-800 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-indigo-500 transition-all group"
                                >
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <svg
                                            className="w-12 h-12 mb-3 text-gray-500 group-hover:text-indigo-400 transition"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                            />
                                        </svg>
                                        <p className="mb-2 text-sm text-gray-400">
                                            <span className="font-semibold text-indigo-400 group-hover:text-indigo-300">
                                                Click to upload
                                            </span>{' '}
                                            or drag and drop
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            PDF files only (multiple files supported)
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Selected Files List */}
                        {files.length > 0 && (
                            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-100 mb-3">
                                    Selected Files ({files.length})
                                </h3>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {files.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-3 bg-gray-900 rounded-lg"
                                        >
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <span className="text-2xl">📄</span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-gray-200 truncate font-medium">
                                                        {file.name}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {formatFileSize(file.size)}
                                                    </p>
                                                </div>
                                            </div>
                                            {!loading && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveFile(index)}
                                                    className="text-red-400 hover:text-red-300 transition ml-2"
                                                >
                                                    <svg
                                                        className="w-5 h-5"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M6 18L18 6M6 6l12 12"
                                                        />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Upload Progress */}
                        {loading && (
                            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-300">Uploading and analyzing...</span>
                                    <span className="text-indigo-400 font-medium">{uploadProgress}%</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-indigo-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}

                        {/* Info Box */}
                        <div className="bg-indigo-900/20 border border-indigo-700/50 rounded-lg p-4">
                            <h4 className="text-indigo-300 font-medium mb-2 flex items-center gap-2">
                                <span>ℹ️</span> Important Information
                            </h4>
                            <ul className="text-gray-400 text-sm space-y-1">
                                <li>• Upload multiple PDF files at once for batch processing</li>
                                <li>• Analysis may take a few minutes depending on file size and count</li>
                                <li>• All files must be in PDF format</li>
                                <li>• Maximum file size: 10MB per file</li>
                            </ul>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || files.length === 0}
                            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-500 transition-all disabled:bg-indigo-800 disabled:cursor-not-allowed font-medium shadow-lg shadow-indigo-500/20"
                        >
                            {loading ? 'Processing...' : `Analyze ${files.length} File${files.length !== 1 ? 's' : ''}`}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Analyze;