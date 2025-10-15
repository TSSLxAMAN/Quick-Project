import { Link } from 'react-router-dom';

const Unauthorized = () => {
    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center px-6">
            <div className="max-w-2xl w-full text-center">
                <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl blur opacity-20"></div>
                    <div className="relative bg-gray-800 rounded-2xl shadow-2xl p-12 border border-gray-700">
                        <div className="text-6xl mb-6 animate-pulse">🚫</div>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-100 mb-4">
                            Access Denied
                        </h1>
                        <p className="text-xl text-gray-400 mb-8">
                            You don't have permission to access this page.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/dashboard"
                                className="px-8 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all shadow-lg shadow-indigo-500/20"
                            >
                                Go to Dashboard
                            </Link>
                            <Link
                                to="/"
                                className="px-8 py-3 rounded-lg border-2 border-gray-700 hover:bg-gray-900 text-gray-300 font-semibold transition-all"
                            >
                                Go Home
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Unauthorized;