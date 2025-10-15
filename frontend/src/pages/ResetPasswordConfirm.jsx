import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import authService from '../services/authService';

const ResetPasswordConfirm = () => {
    const [formData, setFormData] = useState({
        new_password1: '',
        new_password2: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { uid, token } = useParams();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.new_password1 !== formData.new_password2) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            await authService.resetPasswordConfirm(
                uid,
                token,
                formData.new_password1,
                formData.new_password2
            );
            navigate('/login', {
                state: { message: 'Password reset successful! Please login with your new password.' }
            });
        } catch (err) {
            setError(
                err.new_password2?.[0] ||
                err.token?.[0] ||
                err.detail ||
                'Failed to reset password. The link may be invalid or expired.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Set New Password</h2>
                <p className="text-center text-gray-600 mb-6">
                    Enter your new password below
                </p>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="new_password1" className="block text-gray-700 font-medium mb-2">
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="At least 8 characters"
                        />
                    </div>

                    <div>
                        <label htmlFor="new_password2" className="block text-gray-700 font-medium mb-2">
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Re-enter your password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400 disabled:cursor-not-allowed font-medium"
                    >
                        {loading ? 'Resetting Password...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordConfirm;