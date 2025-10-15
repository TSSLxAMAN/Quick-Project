import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const ChangePassword = () => {
    const [formData, setFormData] = useState({
        old_password: '',
        new_password1: '',
        new_password2: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.new_password1 !== formData.new_password2) {
            setError('New passwords do not match');
            return;
        }

        setLoading(true);

        try {
            await authService.changePassword(
                formData.old_password,
                formData.new_password1,
                formData.new_password2
            );
            setSuccess('Password changed successfully!');
            setTimeout(() => {
                navigate('/profile');
            }, 2000);
        } catch (err) {
            setError(err.old_password?.[0] || err.new_password2?.[0] || err.detail || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-800 flex items-center justify-center px-6">
            <div className="max-w-md w-full">
                <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-2xl blur opacity-20"></div>
                    <div className="relative bg-gray-900 rounded-2xl shadow-2xl p-8">
                        <h2 className="text-3xl font-bold text-center text-gray-100 mb-2">
                            Change Password
                        </h2>
                        <p className="text-center text-gray-400 mb-6">
                            Update your account password
                        </p>

                        {error && (
                            <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg mb-4">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-900/30 border border-green-500/50 text-green-300 px-4 py-3 rounded-lg mb-4">
                                {success}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="old_password" className="block text-gray-300 font-medium mb-2">
                                    Current Password
                                </label>
                                <input
                                    type="password"
                                    id="old_password"
                                    name="old_password"
                                    value={formData.old_password}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    placeholder="Enter current password"
                                />
                            </div>

                            <div>
                                <label htmlFor="new_password1" className="block text-gray-300 font-medium mb-2">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    id="new_password1"
                                    name="new_password1"
                                    value={formData.new_password1}
                                    onChange={handleChange}
                                    required
                                    minLength="8"
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    placeholder="At least 8 characters"
                                />
                            </div>

                            <div>
                                <label htmlFor="new_password2" className="block text-gray-300 font-medium mb-2">
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    id="new_password2"
                                    name="new_password2"
                                    value={formData.new_password2}
                                    onChange={handleChange}
                                    required
                                    minLength="8"
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    placeholder="Re-enter new password"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-500 transition-all disabled:bg-indigo-800 disabled:cursor-not-allowed font-medium shadow-lg shadow-indigo-500/20"
                            >
                                {loading ? 'Changing Password...' : 'Change Password'}
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate('/profile')}
                                className="w-full bg-gray-800 text-gray-300 py-3 rounded-lg hover:bg-gray-700 transition-all font-medium border border-gray-700"
                            >
                                Cancel
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;