import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../services/api';

const EmailVerificationPending = () => {
    const location = useLocation();
    const email = location.state?.email;
    const [resending, setResending] = useState(false);
    const [message, setMessage] = useState('');

    const handleResendEmail = async () => {
        if (!email) {
            setMessage('Email not found. Please register again.');
            return;
        }

        setResending(true);
        setMessage('');

        try {
            await api.post('/auth/registration/resend-email/', { email });
            setMessage('Verification email sent! Please check your inbox.');
        } catch (error) {
            setMessage('Failed to resend email. Please try again.');
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center px-6">
            <div className="max-w-2xl w-full">
                <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl blur opacity-20"></div>
                    <div className="relative bg-gray-800 rounded-2xl shadow-2xl p-12 border border-gray-700 text-center">
                        {/* Email Icon */}
                        <div className="mb-6">
                            <div className="mx-auto w-24 h-24 bg-yellow-500/20 border-2 border-yellow-500 rounded-full flex items-center justify-center">
                                <svg
                                    className="w-12 h-12 text-yellow-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                    />
                                </svg>
                            </div>
                        </div>

                        <h1 className="text-4xl font-bold text-gray-100 mb-4">
                            Verify Your Email
                        </h1>

                        <p className="text-xl text-gray-400 mb-6">
                            We've sent a verification email to:
                        </p>

                        {email && (
                            <div className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 mb-8">
                                <p className="text-indigo-400 font-semibold">{email}</p>
                            </div>
                        )}

                        <div className="space-y-4 mb-8">
                            <p className="text-gray-300">
                                Please check your inbox and click the verification link to activate your account.
                            </p>
                            <p className="text-sm text-gray-500">
                                Don't forget to check your spam folder!
                            </p>
                        </div>

                        {message && (
                            <div className={`mb-6 px-4 py-3 rounded-lg border ${message.includes('sent')
                                    ? 'bg-green-900/30 border-green-500/50 text-green-300'
                                    : 'bg-red-900/30 border-red-500/50 text-red-300'
                                }`}>
                                {message}
                            </div>
                        )}

                        <div className="space-y-4">
                            <button
                                onClick={handleResendEmail}
                                disabled={resending}
                                className="inline-block w-full sm:w-auto px-8 py-3 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-white font-semibold transition-all disabled:bg-yellow-800 disabled:cursor-not-allowed"
                            >
                                {resending ? 'Resending...' : 'Resend Verification Email'}
                            </button>

                            <div>
                                <Link
                                    to="/login"
                                    className="text-indigo-400 hover:text-indigo-300 transition-colors"
                                >
                                    Already verified? Login here
                                </Link>
                            </div>
                        </div>

                        <div className="mt-8 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                            <p className="text-yellow-400 text-sm">
                                <strong>Note:</strong> The verification link expires in 24 hours.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmailVerificationPending;