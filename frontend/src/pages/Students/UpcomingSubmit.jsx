import React, { useState, useEffect } from 'react';
import { useAuth } from '../../utils/AuthContext';
import api from '../../services/api';

const UpcomingSubmit = () => {
  const { user, loading } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadingId, setUploadingId] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'submitted'

  useEffect(() => {
    if (user && user.role === 'STUDENT') {
      fetchAssignments();
    }
  }, [user]);

  const fetchAssignments = async () => {
    try {
      setDataLoading(true);
      const response = await api.get('/classroom/studentAssignmentsStatus/');
      setAssignments(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load assignments');
      console.error('Error fetching assignments:', err);
    } finally {
      setDataLoading(false);
    }
  };

  const handleFileSelect = (e, assignmentId) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please select a PDF file');
        e.target.value = '';
        return;
      }
      setSelectedFile({ assignmentId, file });
      setError('');
    }
  };

  const handleSubmitAssignment = async (assignmentId) => {
    if (!selectedFile || selectedFile.assignmentId !== assignmentId) {
      setError('Please select a file to upload');
      return;
    }

    try {
      setUploadingId(assignmentId);
      setError('');
      setUploadSuccess('');

      const formData = new FormData();
      formData.append('assignment', assignmentId);
      formData.append('submitted_file', selectedFile.file);

      await api.post('/classroom/submitAssignment/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadSuccess('Assignment submitted successfully!');
      setSelectedFile(null);

      // Refresh assignments list
      await fetchAssignments();

      // Clear success message after 3 seconds
      setTimeout(() => setUploadSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit assignment');
      console.error('Error submitting assignment:', err);
    } finally {
      setUploadingId(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isDeadlinePassed = (deadline) => {
    return new Date(deadline) < new Date();
  };

  const getTimeRemaining = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate - now;

    if (diff < 0) return 'Time Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} remaining`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
    return 'Due soon';
  };

  const pendingAssignments = assignments.filter(a => a.status === 'pending');
  const submittedAssignments = assignments.filter(a => a.status === 'submitted');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-700">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== 'STUDENT') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-700">
        <div className="text-white text-xl">Access Denied</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Assignments</h1>
          <p className="text-gray-300">View and submit your assignments</p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-600 text-white rounded-lg">
            {error}
          </div>
        )}
        {uploadSuccess && (
          <div className="mb-4 p-4 bg-green-600 text-white rounded-lg">
            {uploadSuccess}
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-900 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${activeTab === 'pending'
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:text-white'
              }`}
          >
            Pending ({pendingAssignments.length})
          </button>
          <button
            onClick={() => setActiveTab('submitted')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${activeTab === 'submitted'
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:text-white'
              }`}
          >
            Submitted ({submittedAssignments.length})
          </button>
        </div>

        {/* Loading State */}
        {dataLoading ? (
          <div className="text-center py-12">
            <div className="text-white text-xl">Loading assignments...</div>
          </div>
        ) : (
          <>
            {/* Pending Assignments */}
            {activeTab === 'pending' && (
              <div className="space-y-4">
                {pendingAssignments.length === 0 ? (
                  <div className="bg-gray-900 p-8 rounded-lg text-center">
                    <p className="text-gray-400 text-lg">No pending assignments</p>
                  </div>
                ) : (
                  pendingAssignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="bg-gray-900 p-6 rounded-lg shadow-lg"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-white mb-2">
                            {assignment.assignment_title}
                          </h3>
                          <div className="space-y-1">
                            <p className="text-gray-400">
                              <span className="font-medium">Class:</span> {assignment.classroom_name}
                            </p>
                            <p className="text-gray-400">
                              <span className="font-medium">Teacher:</span> {assignment.teacher_name}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-sm font-medium mb-1 ${isDeadlinePassed(assignment.deadline)
                                ? 'text-red-400'
                                : 'text-yellow-400'
                              }`}
                          >
                            {getTimeRemaining(assignment.deadline)}
                          </div>
                          <div className="text-gray-400 text-sm">
                            Due: {formatDate(assignment.deadline)}
                          </div>
                        </div>
                      </div>

                      {/* Question PDF */}
                      <div className="mb-4">
                        <a
                          href={assignment.question_pdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                        >
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                            />
                          </svg>
                          View Question Paper
                        </a>
                      </div>

                      {/* File Upload Section */}
                      <div className="border-t border-gray-700 pt-4">
                        <label className="block text-white font-medium mb-2">
                          Upload Your Submission
                        </label>
                        <div className="flex items-center space-x-3">
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => handleFileSelect(e, assignment.assignment)}
                            className="block w-full text-sm text-gray-400
                              file:mr-4 file:py-2 file:px-4
                              file:rounded-md file:border-0
                              file:text-sm file:font-semibold
                              file:bg-gray-700 file:text-white
                              hover:file:bg-gray-600 file:cursor-pointer"
                            disabled={uploadingId === assignment.assignment}
                          />
                          <button
                            onClick={() => handleSubmitAssignment(assignment.assignment)}
                            disabled={
                              uploadingId === assignment.assignment ||
                              selectedFile?.assignmentId !== assignment.assignment
                            }
                            className={`px-6 py-2 rounded-md font-medium whitespace-nowrap transition-colors ${uploadingId === assignment.assignment
                                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                : selectedFile?.assignmentId === assignment.assignment
                                  ? 'bg-green-600 hover:bg-green-700 text-white'
                                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                              }`}
                          >
                            {uploadingId === assignment.assignment
                              ? 'Uploading...'
                              : 'Submit'}
                          </button>
                        </div>
                        <p className="text-gray-500 text-sm mt-2">
                          Only PDF files are accepted
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Submitted Assignments */}
            {activeTab === 'submitted' && (
              <div className="space-y-4">
                {submittedAssignments.length === 0 ? (
                  <div className="bg-gray-900 p-8 rounded-lg text-center">
                    <p className="text-gray-400 text-lg">No submitted assignments</p>
                  </div>
                ) : (
                  submittedAssignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="bg-gray-900 p-6 rounded-lg shadow-lg"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-white mb-2">
                            {assignment.assignment_title}
                          </h3>
                          <div className="space-y-1">
                            <p className="text-gray-400">
                              <span className="font-medium">Class:</span> {assignment.classroom_name}
                            </p>
                            <p className="text-gray-400">
                              <span className="font-medium">Teacher:</span> {assignment.teacher_name}
                            </p>
                            <p className="text-gray-400">
                              <span className="font-medium">Submitted:</span>{' '}
                              {formatDate(assignment.submitted_at)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="inline-block px-3 py-1 bg-green-600 text-white text-sm font-medium rounded-full">
                            Submitted
                          </span>
                        </div>
                      </div>

                      {/* Documents */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        <a
                          href={assignment.question_pdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                        >
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                            />
                          </svg>
                          Question Paper
                        </a>
                        <a
                          href={assignment.submitted_file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
                        >
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          Your Submission
                        </a>
                      </div>

                      {/* Grading Status */}
                      <div className="border-t border-gray-700 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-gray-400 text-sm mb-1">Marks</p>
                            <p className="text-white font-semibold text-lg">
                              {assignment.marks !== null ? assignment.marks : 'Not graded yet'}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm mb-1">Plagiarism Score</p>
                            <p className="text-white font-semibold text-lg">
                              {assignment.plagiarism_score !== null
                                ? `${assignment.plagiarism_score}%`
                                : 'Pending'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UpcomingSubmit;