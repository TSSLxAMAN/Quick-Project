import { useAuth } from '../utils/AuthContext';
import { Link } from 'react-router-dom';

const Profile = () => {
    const { user } = useAuth();

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'ADMIN':
                return 'bg-indigo-900/50 text-indigo-300 border border-indigo-700';
            case 'MANAGER':
                return 'bg-blue-900/50 text-blue-300 border border-blue-700';
            case 'USER':
                return 'bg-purple-900/50 text-purple-300 border border-purple-700';
            default:
                return 'bg-gray-800 text-gray-300 border border-gray-700';
        }
    };

    return (
        <div className="max-w-3xl mx-auto mt-12">
            <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-2xl blur opacity-20"></div>
                <div className="relative bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-pink-500 blur opacity-30"></div>
                        <div className="relative bg-gradient-to-r from-indigo-600 to-pink-600 px-6 py-8 text-white">
                            <h1 className="text-3xl font-bold">User Profile</h1>
                            <p className="text-indigo-100 mt-2">Manage your account information</p>
                        </div>
                    </div>

                    {/* Profile Content */}
                    <div className="p-6 space-y-6">
                        {/* Profile Picture Placeholder */}
                        <div className="flex items-center space-x-4">
                            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                                {user?.username?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-100">{user?.username}</h2>
                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${getRoleBadgeColor(user?.role)}`}>
                                    {user?.role}
                                </span>
                            </div>
                        </div>

                        {/* Profile Information */}
                        <div className="border-t border-gray-700 pt-6">
                            <h3 className="text-xl font-semibold text-gray-100 mb-4">Personal Information</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-400">Username</label>
                                    <p className="text-lg text-gray-100 mt-1">{user?.username}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-400">Email</label>
                                    <p className="text-lg text-gray-100 mt-1">{user?.email}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-400">First Name</label>
                                    <p className="text-lg text-gray-100 mt-1">{user?.first_name || 'Not provided'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-400">Last Name</label>
                                    <p className="text-lg text-gray-100 mt-1">{user?.last_name || 'Not provided'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Account Details */}
                        <div className="border-t border-gray-700 pt-6">
                            <h3 className="text-xl font-semibold text-gray-100 mb-4">Account Details</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-400">Member Since</label>
                                    <p className="text-lg text-gray-100 mt-1">
                                        {new Date(user?.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-400">Last Updated</label>
                                    <p className="text-lg text-gray-100 mt-1">
                                        {new Date(user?.updated_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="border-t border-gray-700 pt-6">
                            <h3 className="text-xl font-semibold text-gray-100 mb-4">Actions</h3>
                            <div className="flex flex-wrap gap-4">
                                <Link
                                    to="/change-password"
                                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20"
                                >
                                    Change Password
                                </Link>
                                <button className="bg-gray-800 text-gray-300 px-6 py-2 rounded-lg hover:bg-gray-700 transition-all border border-gray-700">
                                    Edit Profile
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;