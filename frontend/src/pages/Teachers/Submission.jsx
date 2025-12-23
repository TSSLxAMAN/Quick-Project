import React, { useState, useEffect } from 'react';
import { useAuth } from '../../utils/AuthContext';
import api from '../../services/api';

const Submission = () => {
    const { user, loading } = useAuth();
    const [dataLoading, setDataLoading] = useState(true);
    const [error, setError] = useState('');

    const [classrooms, setClassrooms] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState([]);

    const [selectedClassroom, setSelectedClassroom] = useState(null);
    const [selectedAssignment, setSelectedAssignment] = useState(null);

    useEffect(() => {
        if (user && user.role === 'TEACHER') {
            fetchDashboardData();
        }
    }, [user]);

    const fetchDashboardData = async () => {
        try {
            setDataLoading(true);
            const [classroomsRes, assignmentsRes] = await Promise.all([
                api.get('/classroom/classrooms/'),
                api.get('/classroom/assignments/')
            ]);

            setClassrooms(Array.isArray(classroomsRes.data) ? classroomsRes.data : []);
            setAssignments(Array.isArray(assignmentsRes.data) ? assignmentsRes.data : []);

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
            const submissionsRes = await api.get(`/classroom/class/${classroomId}/submissions/`);
            setSubmissions(Array.isArray(submissionsRes.data) ? submissionsRes.data : []);
        } catch (err) {
            console.error('Error fetching submissions:', err);
            setError('Failed to load submissions');
            setSubmissions([]);
        }
    };

    const handleClassroomChange = async (classroomId) => {
        setSelectedClassroom(classroomId);
        setSelectedAssignment(null);
        await fetchSubmissions(classroomId);
    };

    const getClassroomAssignments = () => {
        return Array.isArray(assignments) ? assignments.filter(a => a.classroom === selectedClassroom) : [];
    };

    const getAssignmentSubmissions = (assignmentId) => {
        return Array.isArray(submissions) ? submissions.filter(s => s.assignment_id === assignmentId) : [];
    };

    const getSubmissionStats = (assignmentId) => {
        const assignmentSubs = getAssignmentSubmissions(assignmentId);
        const submitted = assignmentSubs.filter(s => s.status === 'submitted').length;
        const pending = assignmentSubs.filter(s => s.status === 'pending').length;
        return { submitted, pending, total: assignmentSubs.length };
    };

    const isDeadlinePassed = (deadline) => {
        return new Date(deadline) < new Date();
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
    const classroomAssignments = getClassroomAssignments();

    return (
        <div className="min-h-screen bg-gray-800 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Assignment Submissions</h1>
                    <p className="text-gray-300">Track and manage student submissions across your classrooms</p>
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

                {/* Assignments Overview */}
                {selectedClassroom && (
                    <div className="bg-gray-900 rounded-lg p-6 mb-6">
                        <h2 className="text-2xl font-bold text-white mb-4">
                            {selectedClassroomData?.name} - Assignments
                        </h2>

                        {classroomAssignments.length === 0 ? (
                            <div className="text-gray-400 text-center py-8">
                                No assignments found for this classroom
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {classroomAssignments.map((assignment) => {
                                    const stats = getSubmissionStats(assignment.id);
                                    const deadlinePassed = isDeadlinePassed(assignment.deadline);

                                    return (
                                        <div
                                            key={assignment.id}
                                            className={`bg-gray-800 rounded-lg p-5 border-l-4 ${selectedAssignment === assignment.id
                                                ? 'border-blue-500'
                                                : 'border-gray-700'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex-1">
                                                    <h3 className="text-xl font-semibold text-white mb-1">
                                                        {assignment.title}
                                                    </h3>
                                                    <p className="text-gray-400 text-sm mb-2">
                                                        {assignment.description}
                                                    </p>
                                                    <div className="flex items-center gap-4 text-sm">
                                                        <span className={`${deadlinePassed ? 'text-red-400' : 'text-gray-300'}`}>
                                                            Deadline: {formatDate(assignment.deadline)}
                                                        </span>
                                                        {deadlinePassed && (
                                                            <span className="bg-red-900 text-red-200 px-2 py-1 rounded text-xs">
                                                                Time Endedṇ
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => setSelectedAssignment(
                                                        selectedAssignment === assignment.id ? null : assignment.id
                                                    )}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                                                >
                                                    {selectedAssignment === assignment.id ? 'Hide Details' : 'View Details'}
                                                </button>
                                            </div>

                                            {/* Stats Bar */}
                                            <div className="grid grid-cols-3 gap-4 mt-4">
                                                <div className="bg-gray-900 p-3 rounded border border-gray-700">
                                                    <div className="text-gray-400 text-xs">Total Students</div>
                                                    <div className="text-white text-2xl font-bold">{stats.total}</div>
                                                </div>
                                                <div className="bg-gray-900 p-3 rounded border border-gray-700">
                                                    <div className="text-gray-400 text-xs">Submitted</div>
                                                    <div className="text-white text-2xl font-bold">{stats.submitted}</div>
                                                </div>
                                                <div className="bg-gray-900 p-3 rounded border border-gray-700">
                                                    <div className="text-gray-400 text-xs">Pending</div>
                                                    <div className="text-white text-2xl font-bold">{stats.pending}</div>
                                                </div>
                                            </div>

                                            {/* Submission Progress Bar */}
                                            <div className="mt-4">
                                                <div className="flex justify-between text-sm text-gray-400 mb-1">
                                                    <span>Progress</span>
                                                    <span>{stats.total > 0 ? Math.round((stats.submitted / stats.total) * 100) : 0}%</span>
                                                </div>
                                                <div className="w-full bg-gray-700 rounded-full h-2">
                                                    <div
                                                        className="bg-green-500 h-2 rounded-full transition-all"
                                                        style={{ width: `${stats.total > 0 ? (stats.submitted / stats.total) * 100 : 0}%` }}
                                                    ></div>
                                                </div>
                                            </div>

                                            {/* Detailed Submissions List */}
                                            {selectedAssignment === assignment.id && (
                                                <div className="mt-6 border-t border-gray-700 pt-4">
                                                    <h4 className="text-lg font-semibold text-white mb-3">Student Submissions</h4>
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full">
                                                            <thead>
                                                                <tr className="border-b border-gray-700">
                                                                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Student Name</th>
                                                                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Enrollment No</th>
                                                                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Status</th>
                                                                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Submitted At</th>
                                                                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Files</th>
                                                                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Marks</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {getAssignmentSubmissions(assignment.id).map((submission) => (
                                                                    <tr key={`${submission.student_id}-${submission.assignment_id}`} className="border-b border-gray-800 hover:bg-gray-750">
                                                                        <td className="py-3 px-4 text-white">{submission.student_name}</td>
                                                                        <td className="py-3 px-4 text-gray-300">{submission.enrollment_no}</td>
                                                                        <td className="py-3 px-4">
                                                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${submission.status === 'submitted'
                                                                                ? 'bg-gray-900 text-green-400 border border-green-700'
                                                                                : 'bg-gray-900 text-orange-400 border border-orange-700'
                                                                                }`}>
                                                                                {submission.status.toUpperCase()}
                                                                            </span>
                                                                        </td>
                                                                        <td className="py-3 px-4 text-gray-300">
                                                                            {submission.submitted_at ? formatDate(submission.submitted_at) : '-'}
                                                                        </td>
                                                                        <td className="py-3 px-4">
                                                                            <div className="flex gap-2">
                                                                                {submission.question_pdf && (
                                                                                    <a
                                                                                        href={submission.question_pdf}
                                                                                        target="_blank"
                                                                                        rel="noopener noreferrer"
                                                                                        className="bg-gray-900 text-blue-400 px-3 py-1 rounded text-xs hover:bg-gray-600 border border-blue-700 transition-colors"
                                                                                    >
                                                                                        Question
                                                                                    </a>
                                                                                )}
                                                                                {submission.submitted_file && (
                                                                                    <a
                                                                                        href={submission.submitted_file}
                                                                                        target="_blank"
                                                                                        rel="noopener noreferrer"
                                                                                        className="bg-gray-900 text-green-400 px-3 py-1 rounded text-xs hover:bg-gray-600 border border-green-700 transition-colors"
                                                                                    >
                                                                                        Submission
                                                                                    </a>
                                                                                )}
                                                                                {!submission.submitted_file && submission.status === 'pending' && (
                                                                                    <span className="text-gray-500 text-xs">No file</span>
                                                                                )}
                                                                            </div>
                                                                        </td>
                                                                        <td className="py-3 px-4 text-gray-300">
                                                                            {submission.marks !== null ? submission.marks : '-'}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
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
                        <div className="text-gray-500 text-sm">Create a classroom to start managing assignments</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Submission;