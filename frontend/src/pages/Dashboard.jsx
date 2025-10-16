import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';

const Dashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    console.log(dashboardData)
    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const data = await authService.getDashboardData();
                setDashboardData(data);
            } catch (err) {
                setError('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-xl text-gray-300">Loading dashboard...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg">
                {error}
            </div>
        );
    }

    // Render Admin Dashboard
    const renderAdminDashboard = () => (
        <div className="space-y-6">
            <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-2xl blur opacity-30"></div>
                <div className="relative bg-gradient-to-r from-indigo-600 to-pink-600 text-white rounded-2xl shadow-2xl p-6">
                    <h2 className="text-3xl font-bold mb-2">Admin Dashboard</h2>
                    <p className="text-indigo-100">Manage users and monitor system-wide plagiarism checks</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
                <Link to="/analyze" className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition"></div>
                    <div className="relative bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-700 hover:border-indigo-500 transition-all">
                        <div className="text-indigo-400 text-4xl mb-3">🔍</div>
                        <h3 className="text-xl font-semibold text-gray-100 mb-2">New Analysis</h3>
                        <p className="text-gray-400">Start a new plagiarism check</p>
                    </div>
                </Link>

                <Link to="/results" className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition"></div>
                    <div className="relative bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-700 hover:border-indigo-500 transition-all">
                        <div className="text-indigo-400 text-4xl mb-3">📊</div>
                        <h3 className="text-xl font-semibold text-gray-100 mb-2">Previous Results</h3>
                        <p className="text-gray-400">View past analysis reports</p>
                    </div>
                </Link>
            </div>

            {/* Statistics */}
            <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gray-900 rounded-lg shadow-lg p-6 border border-gray-700">
                    <div className="text-indigo-400 text-4xl mb-2">👥</div>
                    <h3 className="text-xl font-semibold text-gray-100">Total Users</h3>
                    <p className="text-3xl font-bold text-white mt-2">{dashboardData?.total_users || '0'}</p>
                    <p className="text-sm text-gray-400 mt-1">Registered accounts</p>
                </div>

                <div className="bg-gray-900 rounded-lg shadow-lg p-6 border border-gray-700">
                    <div className="text-indigo-400 text-4xl mb-2">📝</div>
                    <h3 className="text-xl font-semibold text-gray-100">Total Checks</h3>
                    <p className="text-3xl font-bold text-white mt-2">{dashboardData?.total_checks || '0'}</p>
                    <p className="text-sm text-gray-400 mt-1">All-time analyses</p>
                </div>

                <div className="bg-gray-900 rounded-lg shadow-lg p-6 border border-gray-700">
                    <div className="text-indigo-400 text-4xl mb-2">⚠️</div>
                    <h3 className="text-xl font-semibold text-gray-100">Flagged Cases</h3>
                    <p className="text-3xl font-bold text-white mt-2">{dashboardData?.flagged_cases || '0'}</p>
                    <p className="text-sm text-gray-400 mt-1">High similarity detected</p>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-900 rounded-lg shadow-lg p-6 border border-gray-700">
                <h3 className="text-xl font-semibold text-gray-100 mb-4">Recent System Activity</h3>
                <div className="space-y-3">
                    {dashboardData?.recent_activity?.slice(0, 5).map((activity, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{activity.type === 'check' ? '🔍' : '👤'}</span>
                                <div>
                                    <p className="text-gray-200">{activity.description}</p>
                                    <p className="text-sm text-gray-500">{activity.timestamp}</p>
                                </div>
                            </div>
                            {activity.similarity && (
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${activity.similarity > 70 ? 'bg-red-900/50 text-red-300 border border-red-700' :
                                        activity.similarity > 40 ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-700' :
                                            'bg-green-900/50 text-green-300 border border-green-700'
                                    }`}>
                                    {activity.similarity}% match
                                </span>
                            )}
                        </div>
                    )) || (
                            <p className="text-gray-400 text-center py-4">No recent activity</p>
                        )}
                </div>
            </div>

            {/* Admin Permissions */}
            <div className="bg-gray-900 rounded-lg shadow-lg p-6 border border-gray-700">
                <h3 className="text-xl font-semibold text-gray-100 mb-4">Admin Permissions</h3>
                <div className="flex flex-wrap gap-2">
                    {dashboardData?.permissions?.map((permission, index) => (
                        <span
                            key={index}
                            className="bg-indigo-900/50 text-indigo-300 px-3 py-1 rounded-full text-sm border border-indigo-700"
                        >
                            {permission}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );

    // Render Manager/Teacher Dashboard
    const renderManagerDashboard = () => (
        <div className="space-y-6">
            <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-2xl blur opacity-30"></div>
                <div className="relative bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-2xl shadow-2xl p-6">
                    <h2 className="text-3xl font-bold mb-2">Teacher Dashboard</h2>
                    <p className="text-blue-100">Monitor student submissions and analyze assignments</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
                <Link to="/analyze" className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition"></div>
                    <div className="relative bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-700 hover:border-indigo-500 transition-all">
                        <div className="text-indigo-400 text-4xl mb-3">🔍</div>
                        <h3 className="text-xl font-semibold text-gray-100 mb-2">New Assignment Check</h3>
                        <p className="text-gray-400">Analyze student submissions</p>
                    </div>
                </Link>

                <Link to="/results" className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition"></div>
                    <div className="relative bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-700 hover:border-indigo-500 transition-all">
                        <div className="text-indigo-400 text-4xl mb-3">📊</div>
                        <h3 className="text-xl font-semibold text-gray-100 mb-2">Previous Results</h3>
                        <p className="text-gray-400">View past analysis reports</p>
                    </div>
                </Link>
            </div>

            {/* Statistics */}
            <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gray-900 rounded-lg shadow-lg p-6 border border-gray-700">
                    <div className="text-indigo-400 text-4xl mb-2">📝</div>
                    <h3 className="text-xl font-semibold text-gray-100">My Checks</h3>
                    <p className="text-3xl font-bold text-white mt-2">{dashboardData?.my_checks || '0'}</p>
                    <p className="text-sm text-gray-400 mt-1">Total analyses</p>
                </div>

                <div className="bg-gray-900 rounded-lg shadow-lg p-6 border border-gray-700">
                    <div className="text-indigo-400 text-4xl mb-2">📚</div>
                    <h3 className="text-xl font-semibold text-gray-100">Assignments</h3>
                    <p className="text-3xl font-bold text-white mt-2">{dashboardData?.assignments || '0'}</p>
                    <p className="text-sm text-gray-400 mt-1">Reviewed this month</p>
                </div>

                <div className="bg-gray-900 rounded-lg shadow-lg p-6 border border-gray-700">
                    <div className="text-indigo-400 text-4xl mb-2">⚠️</div>
                    <h3 className="text-xl font-semibold text-gray-100">Flagged</h3>
                    <p className="text-3xl font-bold text-white mt-2">{dashboardData?.flagged || '0'}</p>
                    <p className="text-sm text-gray-400 mt-1">High similarity cases</p>
                </div>
            </div>

            {/* Recent Checks */}
            <div className="bg-gray-900 rounded-lg shadow-lg p-6 border border-gray-700">
                <h3 className="text-xl font-semibold text-gray-100 mb-4">Recent Checks</h3>
                <div className="space-y-3">
                    {dashboardData?.recent_checks?.slice(0, 5).map((check, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition cursor-pointer">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">📄</span>
                                <div>
                                    <p className="text-gray-200 font-medium">{check.assignment_name}</p>
                                    <p className="text-sm text-gray-500">{check.date}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${check.similarity > 70 ? 'bg-red-900/50 text-red-300 border border-red-700' :
                                        check.similarity > 40 ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-700' :
                                            'bg-green-900/50 text-green-300 border border-green-700'
                                    }`}>
                                    {check.similarity}% match
                                </span>
                                <Link to={`/results/${check.id}`} className="text-indigo-400 hover:text-indigo-300">
                                    View →
                                </Link>
                            </div>
                        </div>
                    )) || (
                            <p className="text-gray-400 text-center py-4">No checks yet</p>
                        )}
                </div>
            </div>

            {/* Manager Permissions */}
            <div className="bg-gray-900 rounded-lg shadow-lg p-6 border border-gray-700">
                <h3 className="text-xl font-semibold text-gray-100 mb-4">Your Permissions</h3>
                <div className="flex flex-wrap gap-2">
                    {dashboardData?.permissions?.map((permission, index) => (
                        <span
                            key={index}
                            className="bg-indigo-900/50 text-indigo-300 px-3 py-1 rounded-full text-sm border border-indigo-700"
                        >
                            {permission}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );

    // Render Student/User Dashboard
    const renderUserDashboard = () => (
        <div className="space-y-6">
            <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-2xl blur opacity-30"></div>
                <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl shadow-2xl p-6">
                    <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
                    <p className="text-purple-100">Check student's assignment similarity before markings</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
                <Link to="/analyze" className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition"></div>
                    <div className="relative bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-700 hover:border-indigo-500 transition-all">
                        <div className="text-indigo-400 text-4xl mb-3">🔍</div>
                        <h3 className="text-xl font-semibold text-gray-100 mb-2">Check new Work</h3>
                        <p className="text-gray-400">Analyze student's assignment for plagiarism</p>
                    </div>
                </Link>

                <Link to="/results" className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition"></div>
                    <div className="relative bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-700 hover:border-indigo-500 transition-all">
                        <div className="text-indigo-400 text-4xl mb-3">📊</div>
                        <h3 className="text-xl font-semibold text-gray-100 mb-2">Recent Checks</h3>
                        <p className="text-gray-400">View your previous checks</p>
                    </div>
                </Link>
            </div>

            {/* Statistics */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-900 rounded-lg shadow-lg p-6 border border-gray-700">
                    <div className="text-indigo-400 text-4xl mb-2">📝</div>
                    <h3 className="text-xl font-semibold text-gray-100">Total Checks</h3>
                    <p className="text-3xl font-bold text-white mt-2">{dashboardData?.my_checks || '0'}</p>
                    <p className="text-sm text-gray-400 mt-1">Assignments analyzed</p>
                </div>

                <div className="bg-gray-900 rounded-lg shadow-lg p-6 border border-gray-700">
                    <div className="text-indigo-400 text-4xl mb-2">✅</div>
                    <h3 className="text-xl font-semibold text-gray-100">Clean Reports</h3>
                    <p className="text-3xl font-bold text-white mt-2">{dashboardData?.clean_reports || '0'}</p>
                    <p className="text-sm text-gray-400 mt-1">Low similarity results</p>
                </div>
            </div>

            {/* Recent Checks */}
            <div className="bg-gray-900 rounded-lg shadow-lg p-6 border border-gray-700">
                <h3 className="text-xl font-semibold text-gray-100 mb-4">My Recent Checks</h3>
                <div className="space-y-3">
                    {dashboardData?.recent_checks?.slice(0, 5).map((check, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition cursor-pointer">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">📄</span>
                                <div>
                                    <p className="text-gray-200 font-medium">{check.file_name}</p>
                                    <p className="text-sm text-gray-500">{check.date}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${check.similarity > 70 ? 'bg-red-900/50 text-red-300 border border-red-700' :
                                        check.similarity > 40 ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-700' :
                                            'bg-green-900/50 text-green-300 border border-green-700'
                                    }`}>
                                    {check.similarity}% match
                                </span>
                                <Link to={`/results/${check.id}`} className="text-indigo-400 hover:text-indigo-300">
                                    View →
                                </Link>
                            </div>
                        </div>
                    )) || (
                            <p className="text-gray-400 text-center py-4">No checks yet. Start your first analysis!</p>
                        )}
                </div>
            </div>

            {/* Tips Card */}
            <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 rounded-lg shadow-lg p-6 border border-indigo-700/50">
                <h3 className="text-xl font-semibold text-gray-100 mb-3">💡 Tips for Academic Integrity</h3>
                <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start gap-2">
                        <span className="text-indigo-400 mt-1">•</span>
                        <span>Always cite your sources properly using the required citation style</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-indigo-400 mt-1">•</span>
                        <span>Paraphrase information in your own words rather than copying</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-indigo-400 mt-1">•</span>
                        <span>Use quotation marks when using exact words from a source</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-indigo-400 mt-1">•</span>
                        <span>Check your work before submission to ensure originality</span>
                    </li>
                </ul>
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto py-8">
            {dashboardData?.dashboard_type === 'admin' && renderAdminDashboard()}
            {dashboardData?.dashboard_type === 'manager' && renderManagerDashboard()}
            {dashboardData?.dashboard_type === 'user' && renderUserDashboard()}
        </div>
    );
};

export default Dashboard;