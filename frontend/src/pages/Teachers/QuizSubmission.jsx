import React, { useState, useEffect } from 'react';
import { useAuth } from '../../utils/AuthContext';
import api from '../../services/api';

const QuizSubmission = () => {
    const { user, loading } = useAuth();
    const [dataLoading, setDataLoading] = useState(true);
    const [error, setError] = useState('');

    const [classrooms, setClassrooms] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [submissions, setSubmissions] = useState([]);

    const [selectedClassroom, setSelectedClassroom] = useState(null);
    const [selectedQuiz, setSelectedQuiz] = useState(null);

    useEffect(() => {
        if (user && user.role === 'TEACHER') {
            fetchDashboardData();
        }
    }, [user]);

    const fetchDashboardData = async () => {
        try {
            setDataLoading(true);
            const [classroomsRes, quizzesRes] = await Promise.all([
                api.get('/classroom/classrooms/'),
                api.get('/classroom/quizzes/')
            ]);

            setClassrooms(Array.isArray(classroomsRes.data) ? classroomsRes.data : []);
            setQuizzes(Array.isArray(quizzesRes.data) ? quizzesRes.data : []);

            // Auto-select first classroom if available
            if (Array.isArray(classroomsRes.data) && classroomsRes.data.length > 0) {
                setSelectedClassroom(classroomsRes.data[0].id);
                await fetchSubmissions(classroomsRes.data[0].id);
            }

            setError('');
        } catch (err) {
            setError('Failed to load dashboard data');
            console.error('Error fetching data:', err);
        } finally {
            setDataLoading(false);
        }
    };

    const fetchSubmissions = async (classroomId) => {
        try {
            const submissionsRes = await api.get(`/classroom/class/${classroomId}/quiz-submissions/`);
            setSubmissions(Array.isArray(submissionsRes.data) ? submissionsRes.data : []);
        } catch (err) {
            console.error('Error fetching submissions:', err);
            setError('Failed to load quiz submissions');
            setSubmissions([]);
        }
    };

    const handleClassroomChange = async (classroomId) => {
        setSelectedClassroom(classroomId);
        setSelectedQuiz(null);
        await fetchSubmissions(classroomId);
    };

    const getClassroomQuizzes = () => {
        return Array.isArray(quizzes) ? quizzes.filter(q => q.classroom === selectedClassroom) : [];
    };

    const getQuizSubmissions = (quizId) => {
        return Array.isArray(submissions) ? submissions.filter(s => s.quiz_id === quizId) : [];
    };

    const getSubmissionStats = (quizId) => {
        const quizSubs = getQuizSubmissions(quizId);
        const completed = quizSubs.filter(s => s.status === 'completed').length;
        const inProgress = quizSubs.filter(s => s.status === 'in_progress').length;
        const notStarted = quizSubs.filter(s => s.status === 'not_started').length;
        return { completed, inProgress, notStarted, total: quizSubs.length };
    };

    const getQuizStatus = (startTime, endTime) => {
        const now = new Date();
        const start = new Date(startTime);
        const end = new Date(endTime);

        if (now < start) return { text: 'Upcoming', color: 'blue' };
        if (now > end) return { text: 'Ended', color: 'red' };
        return { text: 'Active', color: 'green' };
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

    const calculatePercentage = (score, total) => {
        if (!total || total === 0) return 0;
        return Math.round((score / total) * 100);
    };

    const getScoreColor = (percentage) => {
        if (percentage >= 80) return 'text-green-400';
        if (percentage >= 60) return 'text-yellow-400';
        if (percentage >= 40) return 'text-orange-400';
        return 'text-red-400';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-800">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    if (!user || user.role !== 'TEACHER') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-800">
                <div className="text-white text-xl">Unauthorized Access</div>
            </div>
        );
    }

    if (dataLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-800">
                <div className="text-white text-xl">Loading dashboard...</div>
            </div>
        );
    }

    const selectedClassroomData = classrooms.find(c => c.id === selectedClassroom);
    const classroomQuizzes = getClassroomQuizzes();

    return (
        <div className="min-h-screen bg-gray-800 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Quiz Submissions</h1>
                    <p className="text-gray-300">Track and manage student quiz performance across your classrooms</p>
                </div>

                {error && (
                    <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                {/* Classroom Selector */}
                <div className="bg-gray-900 rounded-lg p-6 mb-6">
                    <label className="block text-white text-sm font-medium mb-3">
                        Select Classroom
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {classrooms.map((classroom) => (
                            <button
                                key={classroom.id}
                                onClick={() => handleClassroomChange(classroom.id)}
                                className={`p-4 rounded-lg text-left transition-all ${selectedClassroom === classroom.id
                                    ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                    }`}
                            >
                                <div className="font-semibold text-lg">{classroom.name}</div>
                                <div className="text-sm opacity-80">{classroom.subject_code}</div>
                                <div className="text-xs opacity-60 mt-1">{classroom.description}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Quizzes Overview */}
                {selectedClassroom && (
                    <div className="bg-gray-900 rounded-lg p-6 mb-6">
                        <h2 className="text-2xl font-bold text-white mb-4">
                            {selectedClassroomData?.name} - Quizzes
                        </h2>

                        {classroomQuizzes.length === 0 ? (
                            <div className="text-gray-400 text-center py-8">
                                No quizzes found for this classroom
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {classroomQuizzes.map((quiz) => {
                                    const stats = getSubmissionStats(quiz.id);
                                    const status = getQuizStatus(quiz.start_time, quiz.end_time);

                                    return (
                                        <div
                                            key={quiz.id}
                                            className={`bg-gray-800 rounded-lg p-5 border-l-4 ${selectedQuiz === quiz.id
                                                ? 'border-blue-500'
                                                : 'border-gray-700'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-xl font-semibold text-white">
                                                            {quiz.title}
                                                        </h3>
                                                        <span className={`px-3 py-1 text-xs rounded-full ${status.color === 'green' ? 'bg-green-900 text-green-200 border border-green-700' :
                                                                status.color === 'blue' ? 'bg-blue-900 text-blue-200 border border-blue-700' :
                                                                    'bg-red-900 text-red-200 border border-red-700'
                                                            }`}>
                                                            {status.text}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-400 text-sm mb-2">
                                                        {quiz.description}
                                                    </p>
                                                    <div className="flex items-center gap-4 text-sm text-gray-300">
                                                        <span>
                                                            Start: {formatDate(quiz.start_time)}
                                                        </span>
                                                        <span>•</span>
                                                        <span>
                                                            End: {formatDate(quiz.end_time)}
                                                        </span>
                                                        <span>•</span>
                                                        <span>
                                                            {quiz.total_questions || 0} Questions
                                                        </span>
                                                        <span>•</span>
                                                        <span>
                                                            {quiz.time_per_question}s per question
                                                        </span>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => setSelectedQuiz(
                                                        selectedQuiz === quiz.id ? null : quiz.id
                                                    )}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                                                >
                                                    {selectedQuiz === quiz.id ? 'Hide Details' : 'View Details'}
                                                </button>
                                            </div>

                                            {/* Stats Bar */}
                                            <div className="grid grid-cols-4 gap-4 mt-4">
                                                <div className="bg-gray-900 p-3 rounded border border-gray-700">
                                                    <div className="text-gray-400 text-xs">Total Students</div>
                                                    <div className="text-white text-2xl font-bold">{stats.total}</div>
                                                </div>
                                                <div className="bg-gray-900 p-3 rounded border border-green-700">
                                                    <div className="text-gray-400 text-xs">Completed</div>
                                                    <div className="text-green-400 text-2xl font-bold">{stats.completed}</div>
                                                </div>
                                                <div className="bg-gray-900 p-3 rounded border border-yellow-700">
                                                    <div className="text-gray-400 text-xs">In Progress</div>
                                                    <div className="text-yellow-400 text-2xl font-bold">{stats.inProgress}</div>
                                                </div>
                                                <div className="bg-gray-900 p-3 rounded border border-gray-700">
                                                    <div className="text-gray-400 text-xs">Not Started</div>
                                                    <div className="text-white text-2xl font-bold">{stats.notStarted}</div>
                                                </div>
                                            </div>

                                            {/* Completion Progress Bar */}
                                            <div className="mt-4">
                                                <div className="flex justify-between text-sm text-gray-400 mb-1">
                                                    <span>Completion Rate</span>
                                                    <span>{stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%</span>
                                                </div>
                                                <div className="w-full bg-gray-700 rounded-full h-2">
                                                    <div
                                                        className="bg-green-500 h-2 rounded-full transition-all"
                                                        style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
                                                    ></div>
                                                </div>
                                            </div>

                                            {/* Detailed Submissions List */}
                                            {selectedQuiz === quiz.id && (
                                                <div className="mt-6 border-t border-gray-700 pt-4">
                                                    <h4 className="text-lg font-semibold text-white mb-3">Student Performance</h4>
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full">
                                                            <thead>
                                                                <tr className="border-b border-gray-700">
                                                                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Student Name</th>
                                                                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Enrollment No</th>
                                                                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Status</th>
                                                                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Score</th>
                                                                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Percentage</th>
                                                                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Time Taken</th>
                                                                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Submitted At</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {getQuizSubmissions(quiz.id).map((submission) => {
                                                                    const percentage = calculatePercentage(
                                                                        submission.score,
                                                                        submission.total_questions
                                                                    );
                                                                    const scoreColor = getScoreColor(percentage);

                                                                    return (
                                                                        <tr key={`${submission.student_id}-${submission.quiz_id}`} className="border-b border-gray-800 hover:bg-gray-750">
                                                                            <td className="py-3 px-4 text-white">{submission.student_name}</td>
                                                                            <td className="py-3 px-4 text-gray-300">{submission.enrollment_no}</td>
                                                                            <td className="py-3 px-4">
                                                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${submission.status === 'completed'
                                                                                        ? 'bg-gray-900 text-green-400 border border-green-700'
                                                                                        : submission.status === 'in_progress'
                                                                                            ? 'bg-gray-900 text-yellow-400 border border-yellow-700'
                                                                                            : 'bg-gray-900 text-gray-400 border border-gray-700'
                                                                                    }`}>
                                                                                    {submission.status === 'completed' ? 'COMPLETED' :
                                                                                        submission.status === 'in_progress' ? 'IN PROGRESS' :
                                                                                            'NOT STARTED'}
                                                                                </span>
                                                                            </td>
                                                                            <td className="py-3 px-4">
                                                                                {submission.status === 'completed' ? (
                                                                                    <span className={`font-semibold ${scoreColor}`}>
                                                                                        {submission.score} / {submission.total_questions}
                                                                                    </span>
                                                                                ) : (
                                                                                    <span className="text-gray-500">-</span>
                                                                                )}
                                                                            </td>
                                                                            <td className="py-3 px-4">
                                                                                {submission.status === 'completed' ? (
                                                                                    <span className={`font-semibold ${scoreColor}`}>
                                                                                        {percentage}%
                                                                                    </span>
                                                                                ) : (
                                                                                    <span className="text-gray-500">-</span>
                                                                                )}
                                                                            </td>
                                                                            <td className="py-3 px-4 text-gray-300">
                                                                                {submission.time_taken ? `${Math.round(submission.time_taken / 60)} min` : '-'}
                                                                            </td>
                                                                            <td className="py-3 px-4 text-gray-300">
                                                                                {submission.submitted_at ? formatDate(submission.submitted_at) : '-'}
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                            </tbody>
                                                        </table>
                                                    </div>

                                                    {/* Quiz Statistics Summary */}
                                                    {stats.completed > 0 && (
                                                        <div className="mt-6 bg-gray-800 rounded-lg p-4 border border-gray-700">
                                                            <h5 className="text-md font-semibold text-white mb-3">Class Performance Summary</h5>
                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                <div>
                                                                    <div className="text-gray-400 text-xs mb-1">Average Score</div>
                                                                    <div className="text-white text-xl font-bold">
                                                                        {(() => {
                                                                            const completedSubs = getQuizSubmissions(quiz.id).filter(s => s.status === 'completed');
                                                                            const avgScore = completedSubs.length > 0
                                                                                ? (completedSubs.reduce((acc, s) => acc + s.score, 0) / completedSubs.length).toFixed(1)
                                                                                : 0;
                                                                            return avgScore;
                                                                        })()}
                                                                        /{quiz.total_questions || 0}
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <div className="text-gray-400 text-xs mb-1">Average Percentage</div>
                                                                    <div className="text-white text-xl font-bold">
                                                                        {(() => {
                                                                            const completedSubs = getQuizSubmissions(quiz.id).filter(s => s.status === 'completed');
                                                                            const avgPercentage = completedSubs.length > 0
                                                                                ? Math.round(completedSubs.reduce((acc, s) =>
                                                                                    acc + calculatePercentage(s.score, s.total_questions), 0) / completedSubs.length)
                                                                                : 0;
                                                                            return avgPercentage;
                                                                        })()}%
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <div className="text-gray-400 text-xs mb-1">Highest Score</div>
                                                                    <div className="text-green-400 text-xl font-bold">
                                                                        {(() => {
                                                                            const completedSubs = getQuizSubmissions(quiz.id).filter(s => s.status === 'completed');
                                                                            const highestScore = completedSubs.length > 0
                                                                                ? Math.max(...completedSubs.map(s => s.score))
                                                                                : 0;
                                                                            return highestScore;
                                                                        })()}
                                                                        /{quiz.total_questions || 0}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Empty State */}
                {classrooms.length === 0 && (
                    <div className="bg-gray-900 rounded-lg p-12 text-center">
                        <div className="text-gray-400 text-lg mb-2">No classrooms found</div>
                        <div className="text-gray-500 text-sm">Create a classroom to start managing quizzes</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizSubmission;