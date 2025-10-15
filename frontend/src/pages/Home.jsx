import { Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

const Home = () => {
    const { isAuthenticated, user } = useAuth();

    return (
        <div className="bg-gray-800 text-gray-100 mt-12">
            {/* Hero Section */}
            <section className="min-h-scree flex flex-col justify-center px-6 md:px-2 lg:px-5">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
                            Catch plagiarism early — with confidence.
                        </h1>
                        <p className="mt-6 text-lg text-gray-300 max-w-lg">
                            AssignMatch helps educators and institutions identify similarities in student submissions using advanced AI and ML models. Simple, fast, and built for academic integrity.
                        </p>

                        <div className="mt-8 flex gap-4">
                            {isAuthenticated ? (
                                <Link
                                    to="/dashboard"
                                    className="px-8 py-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-semibold transition-all shadow-lg shadow-indigo-500/30"
                                >
                                    Go to Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        to="/register"
                                        className="px-8 py-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-semibold transition-all shadow-lg shadow-indigo-500/30"
                                    >
                                        Get Started Free
                                    </Link>
                                    <Link
                                        to="/login"
                                        className="px-8 py-4 rounded-lg border-2 border-gray-700 hover:bg-gray-800 font-semibold transition-all"
                                    >
                                        Login
                                    </Link>
                                </>
                            )}
                        </div>

                        <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-300">
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span> AI-powered similarity detection
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span> Supports multiple file formats
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span> Instant, accurate results
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span> Built for universities
                            </li>
                        </ul>
                    </div>

                    <div className="flex justify-center items-center">
                        <div className="relative w-full max-w-md">
                            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-2xl blur opacity-30 animate-pulse"></div>
                            <div className="relative bg-gray-800 rounded-2xl p-10 shadow-2xl text-center border border-gray-700">
                                <div className="mb-6 flex justify-center">
                                    <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-full animate-pulse flex items-center justify-center">
                                        <span className="text-4xl">🔍</span>
                                    </div>
                                </div>
                                <h2 className="text-2xl font-bold mb-3">AI + ML Analysis</h2>
                                <p className="text-gray-400">
                                    Experience the power of artificial intelligence in detecting plagiarism with precision and speed.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-6 md:px-12 lg:px-20 bg-gray-800">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features for Academic Integrity</h2>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            Everything you need to maintain high standards of academic honesty
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-gray-900 rounded-xl p-8 border border-gray-700 hover:border-indigo-500 transition-all">
                            <div className="text-4xl mb-4">🤖</div>
                            <h3 className="text-xl font-semibold mb-3">Advanced AI Detection</h3>
                            <p className="text-gray-400">
                                Leverages cutting-edge machine learning algorithms to identify even subtle similarities across documents.
                            </p>
                        </div>

                        <div className="bg-gray-900 rounded-xl p-8 border border-gray-700 hover:border-pink-500 transition-all">
                            <div className="text-4xl mb-4">📄</div>
                            <h3 className="text-xl font-semibold mb-3">Multiple Format Support</h3>
                            <p className="text-gray-400">
                                Check assignments in PDF, DOCX, TXT, and more. Upload and compare with ease.
                            </p>
                        </div>

                        <div className="bg-gray-900 rounded-xl p-8 border border-gray-700 hover:border-purple-500 transition-all">
                            <div className="text-4xl mb-4">⚡</div>
                            <h3 className="text-xl font-semibold mb-3">Lightning Fast Results</h3>
                            <p className="text-gray-400">
                                Get detailed similarity reports in seconds, not minutes. Save time, catch plagiarism early.
                            </p>
                        </div>

                        <div className="bg-gray-900 rounded-xl p-8 border border-gray-700 hover:border-green-500 transition-all">
                            <div className="text-4xl mb-4">📊</div>
                            <h3 className="text-xl font-semibold mb-3">Detailed Reports</h3>
                            <p className="text-gray-400">
                                Visual similarity scores, highlighted matches, and comprehensive analysis for each submission.
                            </p>
                        </div>

                        <div className="bg-gray-900 rounded-xl p-8 border border-gray-700 hover:border-blue-500 transition-all">
                            <div className="text-4xl mb-4">👥</div>
                            <h3 className="text-xl font-semibold mb-3">Role-Based Access</h3>
                            <p className="text-gray-400">
                                Different dashboards for admins, managers, and users. Perfect for institutional use.
                            </p>
                        </div>

                        <div className="bg-gray-900 rounded-xl p-8 border border-gray-700 hover:border-yellow-500 transition-all">
                            <div className="text-4xl mb-4">🔒</div>
                            <h3 className="text-xl font-semibold mb-3">Secure & Private</h3>
                            <p className="text-gray-400">
                                Your submissions are encrypted and secure. We prioritize student privacy and data protection.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-20 px-6 md:px-12 lg:px-20 bg-gray-900">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">How AssignMatch Works</h2>
                        <p className="text-gray-400 text-lg">Simple process, powerful results</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-600 text-2xl font-bold mb-4">
                                1
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Upload Assignments</h3>
                            <p className="text-gray-400">
                                Teachers upload student submissions in supported formats through our intuitive interface.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-600 text-2xl font-bold mb-4">
                                2
                            </div>
                            <h3 className="text-xl font-semibold mb-3">AI Analysis</h3>
                            <p className="text-gray-400">
                                Our AI models analyze and compare submissions, detecting similarities and potential plagiarism.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-600 text-2xl font-bold mb-4">
                                3
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Review Results</h3>
                            <p className="text-gray-400">
                                Get detailed reports with similarity scores, highlighted matches, and actionable insights.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 px-6 md:px-12 lg:px-20 bg-gradient-to-r from-indigo-900 to-purple-900">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-8 text-center">
                        <div>
                            <div className="text-4xl font-bold text-indigo-300 mb-2">99.9%</div>
                            <p className="text-gray-300">Accuracy Rate</p>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-pink-300 mb-2">10K+</div>
                            <p className="text-gray-300">Documents Checked</p>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-purple-300 mb-2">500+</div>
                            <p className="text-gray-300">Institutions</p>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-green-300 mb-2">&lt;3s</div>
                            <p className="text-gray-300">Average Check Time</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6 md:px-12 lg:px-20 bg-gray-800">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        Ready to Maintain Academic Integrity?
                    </h2>
                    <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
                        Join hundreds of institutions using AssignMatch to ensure fair and honest academic practices.
                    </p>
                    {isAuthenticated ? (
                        <div className="space-y-4">
                            <p className="text-lg text-gray-400">
                                Welcome back, <span className="font-semibold text-indigo-400">{user?.username}</span>!
                            </p>
                            <Link
                                to="/dashboard"
                                className="inline-block px-10 py-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-semibold transition-all shadow-lg shadow-indigo-500/30"
                            >
                                Go to Dashboard
                            </Link>
                        </div>
                    ) : (
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/register"
                                className="px-10 py-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-semibold transition-all shadow-lg shadow-indigo-500/30"
                            >
                                Start Free Trial
                            </Link>
                            <Link
                                to="/login"
                                className="px-10 py-4 rounded-lg border-2 border-gray-700 hover:bg-gray-900 font-semibold transition-all"
                            >
                                Login to Account
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-6 bg-gray-800 border-t border-gray-800">
                <div className="max-w-6xl mx-auto text-center text-gray-500">
                    <p>&copy; 2025 AssignMatch. Built with Django & React. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Home;