import { useState, useEffect } from 'react';
import authService from '../services/authService';

const Dashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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

    // Render different dashboards based on role
    const renderAdminDashboard = () => (
        <div className="space-y-6 mt-12">
            <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-2xl blur opacity-30"></div>
                <div className="relative bg-gradient-to-r from-indigo-600 to-pink-600 text-white rounded-2xl shadow-2xl p-6">
                    <h2 className="text-3xl font-bold mb-2">Admin Dashboard</h2>
                    <p className="text-indigo-100">{dashboardData?.message}</p>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gray-900 rounded-lg shadow-lg p-6 border border-gray-700">
                    <div className="text-indigo-400 text-4xl mb-2">👥</div>
                    <h3 className="text-xl font-semibold text-gray-100">Total Users</h3>
                    <p className="text-3xl font-bold text-white mt-2">1,234</p>
                </div>
                <div className="bg-gray-900 rounded-lg shadow-lg p-6 border border-gray-700">
                    <div className="text-indigo-400 text-4xl mb-2">📊</div>
                    <h3 className="text-xl font-semibold text-gray-100">Reports</h3>
                    <p className="text-3xl font-bold text-white mt-2">87</p>
                </div>
                <div className="bg-gray-900 rounded-lg shadow-lg p-6 border border-gray-700">
                    <div className="text-indigo-400 text-4xl mb-2">⚙️</div>
                    <h3 className="text-xl font-semibold text-gray-100">Settings</h3>
                    <p className="text-3xl font-bold text-white mt-2">12</p>
                </div>
            </div>

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

    const renderManagerDashboard = () => (
        <div className="space-y-6 mt-12">
            <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-2xl blur opacity-30"></div>
                <div className="relative bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-2xl shadow-2xl p-6">
                    <h2 className="text-3xl font-bold mb-2">Manager Dashboard</h2>
                    <p className="text-blue-100">{dashboardData?.message}</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-900 rounded-lg shadow-lg p-6 border border-gray-700">
                    <div className="text-indigo-400 text-4xl mb-2">👥</div>
                    <h3 className="text-xl font-semibold text-gray-100">Team Members</h3>
                    <p className="text-3xl font-bold text-white mt-2">24</p>
                </div>
                <div className="bg-gray-900 rounded-lg shadow-lg p-6 border border-gray-700">
                    <div className="text-indigo-400 text-4xl mb-2">📈</div>
                    <h3 className="text-xl font-semibold text-gray-100">Active Projects</h3>
                    <p className="text-3xl font-bold text-white mt-2">8</p>
                </div>
            </div>

            <div className="bg-gray-900 rounded-lg shadow-lg p-6 border border-gray-700">
                <h3 className="text-xl font-semibold text-gray-100 mb-4">Manager Permissions</h3>
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

    const renderUserDashboard = () => (
        <div className="space-y-6 mt-12">
            <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-2xl blur opacity-30"></div>
                <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl shadow-2xl p-6">
                    <h2 className="text-3xl font-bold mb-2">User Dashboard</h2>
                    <p className="text-purple-100">{dashboardData?.message}</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-900 rounded-lg shadow-lg p-6 border border-gray-700">
                    <div className="text-indigo-400 text-4xl mb-2">📝</div>
                    <h3 className="text-xl font-semibold text-gray-100">My Tasks</h3>
                    <p className="text-3xl font-bold text-white mt-2">5</p>
                </div>
                <div className="bg-gray-900 rounded-lg shadow-lg p-6 border border-gray-700">
                    <div className="text-indigo-400 text-4xl mb-2">✅</div>
                    <h3 className="text-xl font-semibold text-gray-100">Completed</h3>
                    <p className="text-3xl font-bold text-white mt-2">12</p>
                </div>
            </div>

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

    return (
        <div className="max-w-6xl mx-auto">
            {dashboardData?.dashboard_type === 'admin' && renderAdminDashboard()}
            {dashboardData?.dashboard_type === 'manager' && renderManagerDashboard()}
            {dashboardData?.dashboard_type === 'user' && renderUserDashboard()}
        </div>
    );
};

export default Dashboard;