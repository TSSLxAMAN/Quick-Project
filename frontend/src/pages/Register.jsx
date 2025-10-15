import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password1: '',
        password2: '',
        first_name: '',
        last_name: '',
    });
    console.log(formData)
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
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

        if (formData.password1 !== formData.password2) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        const result = await register(formData);

        if (result.success) {
            navigate('/login', { state: { message: 'Registration successful! Please login.' } });
        } else {
            const errorMsg = result.error?.username?.[0] ||
                result.error?.email?.[0] ||
                result.error?.password1?.[0] ||
                result.error?.detail ||
                'Registration failed';
            setError(errorMsg);
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-800 flex items-center justify-center px-6 py-12">
            <div className="max-w-2xl w-full">
                <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-2xl blur opacity-20"></div>
                    <div className="relative bg-gray-900 rounded-2xl shadow-2xl p-8">
                        <h2 className="text-3xl font-bold text-center text-gray-100 mb-2">
                            Create Account
                        </h2>
                        <p className="text-center text-gray-400 mb-6">
                            Join AssignMatch today
                        </p>

                        {error && (
                            <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg mb-4">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="username" className="block text-gray-300 font-medium mb-2">
                                    Username *
                                </label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    placeholder="Choose a username"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-gray-300 font-medium mb-2">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    placeholder="your.email@example.com"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="first_name" className="block text-gray-300 font-medium mb-2">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        id="first_name"
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                        placeholder="John"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="last_name" className="block text-gray-300 font-medium mb-2">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        id="last_name"
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password1" className="block text-gray-300 font-medium mb-2">
                                    Password *
                                </label>
                                <input
                                    type="password"
                                    id="password1"
                                    name="password1"
                                    value={formData.password1}
                                    onChange={handleChange}
                                    required
                                    minLength="8"
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    placeholder="At least 8 characters"
                                />
                            </div>

                            <div>
                                <label htmlFor="password2" className="block text-gray-300 font-medium mb-2">
                                    Confirm Password *
                                </label>
                                <input
                                    type="password"
                                    id="password2"
                                    name="password2"
                                    value={formData.password2}
                                    onChange={handleChange}
                                    required
                                    minLength="8"
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    placeholder="Re-enter your password"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-500 transition-all disabled:bg-indigo-800 disabled:cursor-not-allowed font-medium shadow-lg shadow-indigo-500/20"
                            >
                                {loading ? 'Registering...' : 'Register'}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-gray-400">
                                Already have an account?{' '}
                                <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                                    Login here
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;