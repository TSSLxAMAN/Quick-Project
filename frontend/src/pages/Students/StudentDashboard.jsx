import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../utils/AuthContext';
import { RotateCcw, NotebookPen, Megaphone } from 'lucide-react'

const StudentDashboard = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">
            <div className="text-gray-300 text-xl">Loading...</div>
        </div>;
    }

    if (!user || user.role !== 'STUDENT') {
        return <Navigate to="/unauthorized" />;
    }
    return (
        <div className="space-y-6 py-6">
            <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-2xl blur opacity-30"></div>
                <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl shadow-2xl p-6">
                    <h2 className="text-3xl font-bold mb-2">Student Dashboard</h2>
                    <p className="text-purple-100">Check student's assignment similarity before markings</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
                <Link to="/dashboard/studentDashboard/myClass" className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition"></div>
                    <div className="relative bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-700 hover:border-indigo-500 transition-all">
                        <div className="text-indigo-400 text-4xl mb-3"><NotebookPen size={32} /></div>
                        <h3 className="text-xl font-semibold text-gray-100 mb-2">My Classes</h3>

                    </div>
                </Link>

                <Link to="/dashboard/studentDashboard/upcomingSubmit" className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition"></div>
                    <div className="relative bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-700 hover:border-indigo-500 transition-all">
                        <div className="text-indigo-400 text-4xl mb-3"><Megaphone size={32} /></div>
                        <h3 className="text-xl font-semibold text-gray-100 mb-2">Student Submission</h3>
                    </div>
                </Link>
                
                <Link to="/dashboard/studentDashboard/quiz" className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition"></div>
                    <div className="relative bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-700 hover:border-indigo-500 transition-all">
                        <div className="text-indigo-400 text-4xl mb-3"><Megaphone size={32} /></div>
                        <h3 className="text-xl font-semibold text-gray-100 mb-2">Quiz</h3>
                    </div>
                </Link>
            </div>


        </div>
    )
};
export default StudentDashboard