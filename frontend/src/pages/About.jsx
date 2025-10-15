import React from 'react';

const About = () => {
    const teamMembers = [
        {
            name: 'Aman Kumar Verma',
            role: 'Team Lead & Full Stack Developer',
            description: 'Leading the project architecture and development efforts.',
            color: 'from-indigo-500 to-purple-500',
            icon: '👨‍💻'
        },
        {
            name: 'Mohd Asim Kaif',
            role: 'Backend Developer',
            description: 'Specializing in Django REST APIs and database optimization.',
            color: 'from-blue-500 to-cyan-500',
            icon: '⚙️'
        },
        {
            name: 'Kumail Mujtaba',
            role: 'AI/ML Engineer',
            description: 'Developing plagiarism detection algorithms and ML models.',
            color: 'from-green-500 to-emerald-500',
            icon: '🤖'
        },
        {
            name: 'Syed Tabish Sajjad',
            role: 'Frontend Developer',
            description: 'Creating intuitive user interfaces and seamless user experiences.',
            color: 'from-pink-500 to-rose-500',
            icon: '🎨'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-800 text-gray-100 pb-12">
            {/* Hero Section */}
            <section className=" py-20 px-6 md:px-12 lg:px-20">
                <div className="max-w-6xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6 bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
                        About AssignMatch
                    </h1>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                        A cutting-edge plagiarism detection platform built by students, for students and educators.
                    </p>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-16 px-6 md:px-12 lg:px-20 bg-gray-800">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
                            <p className="text-gray-300 text-lg leading-relaxed mb-4">
                                AssignMatch was created to address the growing challenge of maintaining academic integrity in educational institutions. We leverage advanced AI and machine learning technologies to provide educators with powerful tools to detect plagiarism quickly and accurately.
                            </p>
                            <p className="text-gray-300 text-lg leading-relaxed">
                                Our goal is to foster a culture of originality and honest academic work while making the verification process seamless and efficient for educators worldwide.
                            </p>
                        </div>
                        <div className="relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-2xl blur opacity-20"></div>
                            <div className="relative bg-gray-900 rounded-2xl p-8 border border-gray-700">
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="text-3xl">🎯</div>
                                        <div>
                                            <h3 className="font-semibold text-lg mb-2">Accuracy First</h3>
                                            <p className="text-gray-400">99.9% detection accuracy using advanced ML algorithms</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="text-3xl">⚡</div>
                                        <div>
                                            <h3 className="font-semibold text-lg mb-2">Lightning Fast</h3>
                                            <p className="text-gray-400">Get results in seconds, not minutes</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="text-3xl">🔒</div>
                                        <div>
                                            <h3 className="font-semibold text-lg mb-2">Privacy Focused</h3>
                                            <p className="text-gray-400">Student data security is our top priority</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-20 px-6 md:px-12 lg:px-20 bg-gray-800">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet Our Team</h2>
                        <p className="text-gray-400 text-lg">
                            BTech CSE - Data Science and Artificial Intelligence
                        </p>
                        <p className="text-indigo-400 font-semibold">Integral University, Lucknow</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {teamMembers.map((member, index) => (
                            <div key={index} className="group">
                                <div className="relative">
                                    <div className={`absolute -inset-1 bg-gradient-to-r ${member.color} rounded-2xl blur opacity-20 group-hover:opacity-40 transition-all`}></div>
                                    <div className="relative bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-gray-600 transition-all">
                                        <div className="text-center">
                                            <div className="text-6xl mb-4">{member.icon}</div>
                                            <h3 className="text-xl font-bold mb-2">{member.name}</h3>
                                            <p className={`text-sm font-semibold mb-3 bg-gradient-to-r ${member.color} bg-clip-text text-transparent`}>
                                                {member.role}
                                            </p>
                                            <p className="text-gray-400 text-sm">
                                                {member.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Technology Stack */}
            <section className="py-16 px-6 md:px-12 lg:px-20 bg-gray-800">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Built With Modern Technologies</h2>
                        <p className="text-gray-400">Leveraging cutting-edge tools for optimal performance</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-gray-900 rounded-xl p-6 border border-gray-700 text-center">
                            <div className="text-4xl mb-3">🐍</div>
                            <h3 className="font-semibold text-lg mb-2">Backend</h3>
                            <p className="text-gray-400 text-sm">Django, Django REST Framework, PostgreSQL</p>
                        </div>
                        <div className="bg-gray-900 rounded-xl p-6 border border-gray-700 text-center">
                            <div className="text-4xl mb-3">⚛️</div>
                            <h3 className="font-semibold text-lg mb-2">Frontend</h3>
                            <p className="text-gray-400 text-sm">React, Vite, Tailwind CSS, React Router</p>
                        </div>
                        <div className="bg-gray-900 rounded-xl p-6 border border-gray-700 text-center">
                            <div className="text-4xl mb-3">🤖</div>
                            <h3 className="font-semibold text-lg mb-2">AI/ML</h3>
                            <p className="text-gray-400 text-sm">TensorFlow, Scikit-learn, NLP Models</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Academic Project Info */}
            <section className="py-16 px-6 md:px-12 lg:px-20 bg-gray-900 rounded-2xl" >
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-6">Academic Excellence</h2>
                    <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                        AssignMatch is developed as part of our BTech curriculum at Integral University, combining theoretical knowledge with practical implementation in Data Science and Artificial Intelligence.
                    </p>
                    <div className="inline-block bg-gray-800/50 rounded-lg px-8 py-4 border border-indigo-500/30">
                        <p className="text-indigo-300 font-semibold">
                            🎓 Final Year Project - Academic Year 2024-25
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;