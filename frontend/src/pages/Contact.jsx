import { useState } from 'react';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        // Simulate form submission
        setTimeout(() => {
            setStatus({
                type: 'success',
                message: 'Thank you for contacting us! We will get back to you soon.'
            });
            setFormData({ name: '', email: '', subject: '', message: '' });
            setLoading(false);
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100">
            {/* Hero Section */}
            <section className="bg-gradient-to-b from-gray-800 to-gray-900 py-20 px-6 md:px-12 lg:px-20">
                <div className="max-w-6xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6 bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
                        Get In Touch
                    </h1>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                        Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                    </p>
                </div>
            </section>

            {/* Contact Form & Info Section */}
            <section className="py-16 px-6 md:px-12 lg:px-20 bg-gray-900">
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
                    {/* Contact Form */}
                    <div>
                        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
                            <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>

                            {status.message && (
                                <div className={`mb-6 px-4 py-3 rounded-lg border ${status.type === 'success'
                                        ? 'bg-green-900/30 border-green-500/50 text-green-300'
                                        : 'bg-red-900/30 border-red-500/50 text-red-300'
                                    }`}>
                                    {status.message}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="block text-gray-300 font-medium mb-2">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                        placeholder="John Doe"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-gray-300 font-medium mb-2">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                        placeholder="john@example.com"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="subject" className="block text-gray-300 font-medium mb-2">
                                        Subject *
                                    </label>
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                        placeholder="What is this regarding?"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-gray-300 font-medium mb-2">
                                        Message *
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows="5"
                                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                                        placeholder="Tell us more about your inquiry..."
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-semibold transition-all disabled:bg-indigo-800 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
                                >
                                    {loading ? 'Sending...' : 'Send Message'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-8">
                        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
                            <h2 className="text-2xl font-bold mb-6">Contact Information</h2>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="text-3xl">📧</div>
                                    <div>
                                        <h3 className="font-semibold text-lg mb-1">Email</h3>
                                        <p className="text-gray-400">assignmatch@integral.ac.in</p>
                                        <p className="text-gray-400">support@assignmatch.com</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="text-3xl">📍</div>
                                    <div>
                                        <h3 className="font-semibold text-lg mb-1">Location</h3>
                                        <p className="text-gray-400">Integral University</p>
                                        <p className="text-gray-400">Kursi Road, Lucknow</p>
                                        <p className="text-gray-400">Uttar Pradesh, India - 226026</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="text-3xl">🎓</div>
                                    <div>
                                        <h3 className="font-semibold text-lg mb-1">Department</h3>
                                        <p className="text-gray-400">Computer Science & Engineering</p>
                                        <p className="text-gray-400">Data Science & AI Specialization</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="text-3xl">⏰</div>
                                    <div>
                                        <h3 className="font-semibold text-lg mb-1">Response Time</h3>
                                        <p className="text-gray-400">We typically respond within 24-48 hours</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
                            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
                            <div className="space-y-3">
                                <a href="/about" className="block text-indigo-400 hover:text-indigo-300 transition-colors">
                                    → About AssignMatch
                                </a>
                                <a href="/dashboard" className="block text-indigo-400 hover:text-indigo-300 transition-colors">
                                    → Check Plagiarism
                                </a>
                                <a href="https://integral.ac.in" target="_blank" rel="noopener noreferrer" className="block text-indigo-400 hover:text-indigo-300 transition-colors">
                                    → Integral University
                                </a>
                            </div>
                        </div>

                        {/* Social/Professional */}
                        <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-2xl p-8 border border-indigo-500/30">
                            <h3 className="text-xl font-bold mb-3">Academic Project</h3>
                            <p className="text-gray-300 mb-4">
                                This project is developed as part of our BTech final year curriculum under the guidance of our faculty.
                            </p>
                            <div className="flex gap-4 text-3xl">
                                <span>👥</span>
                                <span>🎓</span>
                                <span>💡</span>
                                <span>🚀</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Contact Section */}
            <section className="py-16 px-6 md:px-12 lg:px-20 bg-gray-800">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Meet the Team</h2>
                        <p className="text-gray-400">Feel free to reach out to any of our team members</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-gray-900 rounded-xl p-6 border border-gray-700 text-center">
                            <div className="text-4xl mb-3">👨‍💻</div>
                            <h3 className="font-semibold mb-1">Aman Kumar Verma</h3>
                            <p className="text-sm text-indigo-400 mb-2">Team Lead</p>
                            <p className="text-xs text-gray-500">Full Stack Development</p>
                        </div>

                        <div className="bg-gray-900 rounded-xl p-6 border border-gray-700 text-center">
                            <div className="text-4xl mb-3">⚙️</div>
                            <h3 className="font-semibold mb-1">Mohd Asim Kaif</h3>
                            <p className="text-sm text-blue-400 mb-2">Backend Developer</p>
                            <p className="text-xs text-gray-500">Django & APIs</p>
                        </div>

                        <div className="bg-gray-900 rounded-xl p-6 border border-gray-700 text-center">
                            <div className="text-4xl mb-3">🤖</div>
                            <h3 className="font-semibold mb-1">Kumail Mujtaba</h3>
                            <p className="text-sm text-green-400 mb-2">AI/ML Engineer</p>
                            <p className="text-xs text-gray-500">ML Models & Algorithms</p>
                        </div>

                        <div className="bg-gray-900 rounded-xl p-6 border border-gray-700 text-center">
                            <div className="text-4xl mb-3">🎨</div>
                            <h3 className="font-semibold mb-1">Syed Tabish Sajjad</h3>
                            <p className="text-sm text-pink-400 mb-2">Frontend Developer</p>
                            <p className="text-xs text-gray-500">React & UI/UX</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Contact;