import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../utils/AuthContext';
import { SquareUserRound, NotebookPen, PlusCircleIcon, ScrollText  } from 'lucide-react'
const TeacherDashboard = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">
            <div className="text-gray-300 text-xl">Loading...</div>
        </div>;
    }

    if (!user || user.role !== 'TEACHER') {
        return <Navigate to="/unauthorized" />;
    }
    return (

        <div className="space-y-6 py-6">
            <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-2xl blur opacity-30"></div>
                <div className="relative bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-2xl shadow-2xl p-6">
                    <h2 className="text-3xl font-bold mb-2">Teacher Dashboard</h2>
                    <p className="text-blue-100">Monitor student submissions and analyze assignments</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
                <Link to="/dashboard/teacherDashboard/myClass" className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition"></div>
                    <div className="relative bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-700 hover:border-indigo-500 transition-all">
                        <div className="text-indigo-400 text-4xl mb-3"><NotebookPen size={32} /></div>
                        <h3 className="text-lg font-semibold text-gray-100 mb-2">My Classroom</h3>
                    </div>
                </Link>
                <Link to="/dashboard/teacherDashboard/studentsRequests" className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition"></div>
                    <div className="relative bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-700 hover:border-indigo-500 transition-all">
                        <div className="text-indigo-400 text-4xl mb-3"><SquareUserRound size={32}/></div>
                        <h3 className="text-lg font-semibold text-gray-100 mb-2">Student Classroom Status</h3>
                    </div>
                </Link>
                <Link to="/dashboard/teacherDashboard/assignment" className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition"></div>
                    <div className="relative bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-700 hover:border-indigo-500 transition-all">
                        <div className="text-indigo-400 text-4xl mb-3"><PlusCircleIcon size={32}/></div>
                        <h3 className="text-lg font-semibold text-gray-100 mb-2">Create Assignment</h3>
                    </div>
                </Link>
                <Link to="/dashboard/teacherDashboard/submission" className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition"></div>
                    <div className="relative bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-700 hover:border-indigo-500 transition-all">
                        <div className="text-indigo-400 text-4xl mb-3"><ScrollText size={32}/></div>
                        <h3 className="text-lg font-semibold text-gray-100 mb-2">Student Assignment Submissions</h3>
                    </div>
                </Link>
                <Link to="/dashboard/teacherDashboard/createQuiz" className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition"></div>
                    <div className="relative bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-700 hover:border-indigo-500 transition-all">
                        <div className="text-indigo-400 text-4xl mb-3"><PlusCircleIcon size={32}/></div>
                        <h3 className="text-lg font-semibold text-gray-100 mb-2">Create Quiz</h3>
                    </div>
                </Link>
                <Link to="/dashboard/teacherDashboard/quizSubmission" className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition"></div>
                    <div className="relative bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-700 hover:border-indigo-500 transition-all">
                        <div className="text-indigo-400 text-4xl mb-3"><ScrollText size={32} /></div>
                        <h3 className="text-lg font-semibold text-gray-100 mb-2">Student Quiz Submissions</h3>
                    </div>
                </Link>
            </div>
        </div>
    )
};
export default TeacherDashboard