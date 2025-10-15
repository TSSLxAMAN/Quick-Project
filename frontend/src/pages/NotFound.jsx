import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="min-h-screen bg-gray-800 flex items-center justify-center px-6">
            <div className="max-w-2xl w-full text-center">
                <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-2xl blur opacity-20"></div>
                    <div className="relative bg-gray-900 rounded-2xl shadow-2xl p-12">
                        <div className="text-8xl font-bold bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent mb-4">
                            404
                        </div>
                        <h1 className="text-4xl font-bold text-gray-100 mb-4">Page Not Found</h1>
                        <p className="text-xl text-gray-400 mb-8">
                            The page you're looking for doesn't exist.
                        </p>
                        <Link
                            to="/"
                            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20"
                        >
                            Go Back Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFound;