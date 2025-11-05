import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

const Login = () => {
    const location = useLocation();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    // console.log(formData)
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const successMessage = location.state?.message;

    const { login } = useAuth();
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
        setLoading(true);

        const result = await login(formData.email, formData.password);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error?.detail || 'Login failed. Please check your credentials.');
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-800 flex items-center justify-center px-6">
            <div className="max-w-md w-full">
                <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-2xl blur opacity-20"></div>
                    <div className="relative bg-gray-900 rounded-2xl shadow-2xl p-8">
                        <h2 className="text-3xl font-bold text-center text-gray-100 mb-2">
                            Welcome Back
                        </h2>
                        <p className="text-center text-gray-400 mb-6">
                            Login to access AssignMatch
                        </p>

                        {successMessage && (
                            <div className="bg-green-900/30 border border-green-500/50 text-green-300 px-4 py-3 rounded-lg mb-4">
                                {successMessage}
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg mb-4">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label htmlFor="username" className="block text-gray-300 font-medium mb-2">
                                    Email
                                </label>
                                <input
                                    type="text"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    placeholder="Enter your username"
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-gray-300 font-medium mb-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    placeholder="Enter your password"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-500 transition-all disabled:bg-indigo-800 disabled:cursor-not-allowed font-medium shadow-lg shadow-indigo-500/20"
                            >
                                {loading ? 'Logging in...' : 'Login'}
                            </button>
                        </form>

                        <div className="mt-6 text-center space-y-3">
                            <Link to="/reset-password" className="text-indigo-400 hover:text-indigo-300 block transition-colors">
                                Forgot Password?
                            </Link>
                            <p className="text-gray-400">
                                Don't have an account?{' '}
                                <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                                    Register here
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;