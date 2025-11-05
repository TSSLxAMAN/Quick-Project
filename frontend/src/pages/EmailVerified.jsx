import { Link } from 'react-router-dom';

const EmailVerified = () => {
    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center px-6">
            <div className="max-w-2xl w-full">
                <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur opacity-30"></div>
                    <div className="relative bg-gray-800 rounded-2xl shadow-2xl p-12 border border-gray-700 text-center">
                        {/* Success Icon */}
                        <div className="mb-6">
                            <div className="mx-auto w-24 h-24 bg-green-500 rounded-full flex items-center justify-center">
                                <svg
                                    className="w-12 h-12 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>
                        </div>

                        <h1 className="text-4xl font-bold text-gray-100 mb-4">
                            Email Verified Successfully!
                        </h1>

                        <p className="text-xl text-gray-400 mb-8">
                            Your email has been confirmed. You can now login to your account.
                        </p>

                        <div className="space-y-4">
                            <Link
                                to="/login"
                                className="inline-block w-full sm:w-auto px-8 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all shadow-lg shadow-indigo-500/20"
                            >
                                Login to Your Account
                            </Link>
                        </div>

                        <div className="mt-8 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                            <p className="text-green-400 text-sm">
                                ✓ Your account is now active<br />
                                ✓ You can access all features<br />
                                ✓ Welcome to AssignMatch!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmailVerified;