import { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';

const ResetPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await authService.resetPasswordRequest(email);
            setSuccess('Password reset email sent! Please check your inbox.');
            setEmail('');
        } catch (err) {
            setError(err.email?.[0] || err.detail || 'Failed to send reset email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Reset Password</h2>
                <p className="text-center text-gray-600 mb-6">
                    Enter your email address and we'll send you a link to reset your password
                </p>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="your.email@example.com"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400 disabled:cursor-not-allowed font-medium"
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                <div className="mt-6 text-center space-y-2">
                    <Link to="/login" className="text-blue-600 hover:underline block">
                        Back to Login
                    </Link>
                    <p className="text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-blue-600 hover:underline font-medium">
                            Register here
                        </Link>
                    </p>
                </div>

                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm text-yellow-800">
                        <strong>Note:</strong> Email functionality requires email backend configuration in Django settings.
                        In development, check the Django console for the reset link.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;