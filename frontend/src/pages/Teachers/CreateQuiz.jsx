import React, { useState, useEffect } from 'react';
import { useAuth } from '../../utils/AuthContext';
import api from '../../services/api';
import { Upload, FileText, Calendar, Clock, Trash2, Plus, X, Search, Filter, Wand2, Timer, CheckCircle } from 'lucide-react';

const CreateQuiz = () => {
    const { user, loading } = useAuth();
    const [quizzes, setQuizzes] = useState([]);
    const [classrooms, setClassrooms] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterClassroom, setFilterClassroom] = useState('all');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        classroom: '',
        start_time: '',
        end_time: '',
        time_per_question: '60',
        questionMethod: 'manual',
        resource_pdf: null,
        numQuestions: '5',
        difficultyLevel: 'moderate',
    });

    const [manualQuestions, setManualQuestions] = useState([]);
    const [generatedQuestions, setGeneratedQuestions] = useState([]);
    const [formErrors, setFormErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [generatingQuestions, setGeneratingQuestions] = useState(false);

    useEffect(() => {
        if (user && user.role === 'TEACHER') {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        try {
            setDataLoading(true);
            const [quizzesRes, classroomsRes] = await Promise.all([
                api.get('/classroom/quizzes/'),
                api.get('/classroom/classrooms/')
            ]);

            setQuizzes(quizzesRes.data);
            setClassrooms(classroomsRes.data);
            setError('');
        } catch (err) {
            setError('Failed to load data');
            console.error('Error fetching data:', err);
        } finally {
            setDataLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files && files[0]) {
            setFormData(prev => ({ ...prev, [name]: files[0] }));
            if (formErrors[name]) {
                setFormErrors(prev => ({ ...prev, [name]: '' }));
            }
        }
    };

    const handleQuestionMethodChange = (method) => {
        setFormData(prev => ({ ...prev, questionMethod: method }));
        setGeneratedQuestions([]);
        setManualQuestions([]);
    };

    // Manual Questions Handling
    const addManualQuestion = () => {
        const newQuestion = {
            id: Date.now(),
            question: '',
            option1: '',
            option2: '',
            option3: '',
            option4: '',
            correct_option: '1',
        };
        setManualQuestions(prev => [...prev, newQuestion]);
    };

    const updateManualQuestion = (id, field, value) => {
        setManualQuestions(prev =>
            prev.map(q => q.id === id ? { ...q, [field]: value } : q)
        );
    };

    const removeManualQuestion = (id) => {
        setManualQuestions(prev => prev.filter(q => q.id !== id));
    };

    // Generated Questions Handling
    const handleGenerateQuestions = async () => {
        if (!formData.resource_pdf) {
            setFormErrors(prev => ({ ...prev, resource_pdf: 'Please upload training material first' }));
            return;
        }

        setGeneratingQuestions(true);
        setError('');

        try {
            const generateData = new FormData();
            generateData.append('resource_pdf', formData.resource_pdf);
            generateData.append('num_questions', formData.numQuestions);
            generateData.append('difficulty', formData.difficultyLevel);

            const response = await api.post('/classroom/quizzes/generate-questions/', generateData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data && response.data.questions) {
                setGeneratedQuestions(response.data.questions);
            }
        } catch (err) {
            console.error('Error generating questions:', err);
            setError('Failed to generate questions from training material');
        } finally {
            setGeneratingQuestions(false);
        }
    };

    const updateGeneratedQuestion = (index, field, value) => {
        setGeneratedQuestions(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.title.trim()) errors.title = 'Title is required';
        if (!formData.classroom) errors.classroom = 'Classroom is required';
        if (!formData.start_time) errors.start_time = 'Start time is required';
        if (!formData.end_time) errors.end_time = 'End time is required';
        if (!formData.time_per_question || formData.time_per_question < 10) {
            errors.time_per_question = 'Time per question must be at least 10 seconds';
        }

        const startDate = new Date(formData.start_time);
        const endDate = new Date(formData.end_time);

        if (startDate < new Date()) {
            errors.start_time = 'Start time must be in the future';
        }

        if (endDate <= startDate) {
            errors.end_time = 'End time must be after start time';
        }

        if (formData.questionMethod === 'manual' && manualQuestions.length === 0) {
            errors.questions = 'Please add at least one question';
        } else if (formData.questionMethod === 'manual') {
            const invalidQuestions = manualQuestions.filter(q =>
                !q.question.trim() || !q.option1.trim() || !q.option2.trim() ||
                !q.option3.trim() || !q.option4.trim()
            );
            if (invalidQuestions.length > 0) {
                errors.questions = 'All questions must have text and all 4 options filled';
            }
        }

        if (formData.questionMethod === 'generate' && generatedQuestions.length === 0) {
            errors.questions = 'Please generate questions first';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setSubmitting(true);
            const submitData = new FormData();

            submitData.append('title', formData.title);
            submitData.append('description', formData.description);
            submitData.append('classroom', formData.classroom);
            submitData.append('start_time', formData.start_time);
            submitData.append('end_time', formData.end_time);
            submitData.append('time_per_question', formData.time_per_question);

            if (formData.questionMethod === 'manual') {
                submitData.append('questions', JSON.stringify(manualQuestions));
            } else {
                submitData.append('questions', JSON.stringify(generatedQuestions));
                if (formData.resource_pdf) {
                    submitData.append('resource_pdf', formData.resource_pdf);
                }
            }

            const response = await api.post('/classroom/quizzes/', submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setQuizzes(prev => [response.data, ...prev]);
            setShowModal(false);
            resetForm();
            setError('');
        } catch (err) {
            console.error('Error creating quiz:', err);
            if (err.response && err.response.data) {
                const errorData = err.response.data;
                if (typeof errorData === 'object') {
                    const errorMessages = Object.entries(errorData)
                        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
                        .join('; ');
                    setError(errorMessages || 'Failed to create quiz');
                } else {
                    setError('Failed to create quiz');
                }
            } else {
                setError('Failed to create quiz');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this quiz?')) return;

        try {
            await api.delete(`/classroom/quizzes/${id}/delete`);
            setQuizzes(prev => prev.filter(q => q.id !== id));
            setError('');
        } catch (err) {
            setError('Failed to delete quiz');
            console.error('Error deleting quiz:', err);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            classroom: '',
            start_time: '',
            end_time: '',
            time_per_question: '60',
            questionMethod: 'manual',
            resource_pdf: null,
            numQuestions: '5',
            difficultyLevel: 'moderate',
        });
        setManualQuestions([]);
        setGeneratedQuestions([]);
        setFormErrors({});
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getQuizStatus = (startTime, endTime) => {
        const now = new Date();
        const start = new Date(startTime);
        const end = new Date(endTime);

        if (now < start) return { text: 'Upcoming', color: 'blue' };
        if (now > end) return { text: 'Ended', color: 'red' };
        return { text: 'Active', color: 'green' };
    };

    const filteredQuizzes = quizzes.filter(quiz => {
        const matchesSearch = (quiz.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            quiz.classroom_name?.toLowerCase().includes(searchTerm.toLowerCase())) ?? true;
        const matchesFilter = filterClassroom === 'all' || quiz.classroom === filterClassroom;
        return matchesSearch && matchesFilter;
    });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-700">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    if (!user || user.role !== 'TEACHER') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-700">
                <div className="text-red-400 text-xl">Unauthorized Access</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-800 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Quizzes</h1>
                    <p className="text-gray-300">Create and manage quizzes for your classrooms</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Controls */}
                <div className="mb-6 flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search quizzes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                        />
                    </div>

                    <div className="flex gap-3">
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <select
                                value={filterClassroom}
                                onChange={(e) => setFilterClassroom(e.target.value)}
                                className="pl-10 pr-8 py-2 bg-gray-900 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                            >
                                <option value="all">All Classrooms</option>
                                {classrooms.map(classroom => (
                                    <option key={classroom.id} value={classroom.id}>
                                        {classroom.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            New Quiz
                        </button>
                    </div>
                </div>

                {/* Quizzes List */}
                {dataLoading ? (
                    <div className="text-center py-12 text-gray-300">Loading quizzes...</div>
                ) : filteredQuizzes.length === 0 ? (
                    <div className="text-center py-12 bg-gray-900 rounded-lg shadow">
                        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-300 text-lg">No quizzes found</p>
                        <p className="text-gray-400 mt-2">Create your first quiz to get started</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredQuizzes.map(quiz => {
                            const status = getQuizStatus(quiz.start_time, quiz.end_time);
                            return (
                                <div key={quiz.id} className="bg-gray-900 rounded-lg shadow hover:shadow-lg transition-shadow p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-semibold text-white mb-1">{quiz.title}</h3>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="inline-block px-3 py-1 bg-blue-600 text-blue-100 text-sm rounded-full">
                                                    {quiz.classroom_name}
                                                </span>
                                                <span className={`inline-block px-3 py-1 text-sm rounded-full ${status.color === 'green' ? 'bg-green-600 text-green-100' :
                                                    status.color === 'blue' ? 'bg-blue-600 text-blue-100' :
                                                        'bg-red-600 text-red-100'
                                                    }`}>
                                                    {status.text}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(quiz.id)}
                                            className="text-red-400 hover:text-red-300 transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {quiz.description && (
                                        <p className="text-gray-300 text-sm mb-4 line-clamp-2">{quiz.description}</p>
                                    )}

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <Timer className="w-4 h-4" />
                                            {quiz.time_per_question}s per question
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <CheckCircle className="w-4 h-4" />
                                            {quiz.total_questions || 0} questions
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-700">
                                        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                                            <Calendar className="w-4 h-4" />
                                            Start: {formatDate(quiz.start_time)}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <Clock className="w-4 h-4" />
                                            End: {formatDate(quiz.end_time)}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Create Quiz Modal */}
                {showModal && (
                    <div className="fixed inset-0 backdrop-blur-2xl bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-gray-900 border-b border-gray-700 px-6 py-4 flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-white">Create New Quiz</h2>
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                        setError('');
                                    }}
                                    className="text-gray-400 hover:text-gray-300"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Basic Information */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Title <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-2 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500 ${formErrors.title ? 'border-red-500' : 'border-gray-600'}`}
                                        placeholder="e.g., Data Structures Mid-term Quiz"
                                    />
                                    {formErrors.title && <p className="text-red-400 text-sm mt-1">{formErrors.title}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows="3"
                                        className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500"
                                        placeholder="Provide additional details about the quiz..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Classroom <span className="text-red-400">*</span>
                                        </label>
                                        <select
                                            name="classroom"
                                            value={formData.classroom}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-2 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white ${formErrors.classroom ? 'border-red-500' : 'border-gray-600'}`}
                                        >
                                            <option value="">Select a classroom</option>
                                            {classrooms.map(classroom => (
                                                <option key={classroom.id} value={classroom.id}>
                                                    {classroom.name} ({classroom.subject_code})
                                                </option>
                                            ))}
                                        </select>
                                        {formErrors.classroom && <p className="text-red-400 text-sm mt-1">{formErrors.classroom}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Time per Question (seconds) <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="time_per_question"
                                            value={formData.time_per_question}
                                            onChange={handleInputChange}
                                            min="10"
                                            className={`w-full px-4 py-2 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white ${formErrors.time_per_question ? 'border-red-500' : 'border-gray-600'}`}
                                        />
                                        {formErrors.time_per_question && <p className="text-red-400 text-sm mt-1">{formErrors.time_per_question}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Start Time <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="datetime-local"
                                            name="start_time"
                                            value={formData.start_time}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-2 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white ${formErrors.start_time ? 'border-red-500' : 'border-gray-600'}`}
                                        />
                                        {formErrors.start_time && <p className="text-red-400 text-sm mt-1">{formErrors.start_time}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            End Time <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="datetime-local"
                                            name="end_time"
                                            value={formData.end_time}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-2 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white ${formErrors.end_time ? 'border-red-500' : 'border-gray-600'}`}
                                        />
                                        {formErrors.end_time && <p className="text-red-400 text-sm mt-1">{formErrors.end_time}</p>}
                                    </div>
                                </div>

                                {/* Question Method Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-3">
                                        Question Method <span className="text-red-400">*</span>
                                    </label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => handleQuestionMethodChange('manual')}
                                            className={`p-4 rounded-lg border-2 transition-all ${formData.questionMethod === 'manual'
                                                ? 'border-blue-500 bg-blue-900 bg-opacity-20'
                                                : 'border-gray-600 hover:border-gray-500'
                                                }`}
                                        >
                                            <FileText className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                                            <p className="text-sm font-medium text-white">Add Questions Manually</p>
                                            <p className="text-xs text-gray-400 mt-1">Type questions one by one</p>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleQuestionMethodChange('generate')}
                                            className={`p-4 rounded-lg border-2 transition-all ${formData.questionMethod === 'generate'
                                                ? 'border-purple-500 bg-purple-900 bg-opacity-20'
                                                : 'border-gray-600 hover:border-gray-500'
                                                }`}
                                        >
                                            <Wand2 className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                                            <p className="text-sm font-medium text-white">Generate from Material</p>
                                            <p className="text-xs text-gray-400 mt-1">AI-powered generation</p>
                                        </button>
                                    </div>
                                </div>

                                {/* Manual Questions Section */}
                                {formData.questionMethod === 'manual' && (
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <label className="block text-sm font-medium text-gray-300">
                                                Questions ({manualQuestions.length})
                                            </label>
                                            <button
                                                type="button"
                                                onClick={addManualQuestion}
                                                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                                Add Question
                                            </button>
                                        </div>

                                        {manualQuestions.length === 0 ? (
                                            <div className="text-center py-8 bg-gray-800 border border-gray-600 rounded-lg">
                                                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                                <p className="text-gray-300 text-sm">No questions added yet</p>
                                                <p className="text-gray-400 text-xs mt-1">Click "Add Question" to get started</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                                                {manualQuestions.map((q, index) => (
                                                    <div key={q.id} className="bg-gray-800 border border-gray-600 rounded-lg p-4">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <span className="text-sm font-medium text-gray-300">Question {index + 1}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeManualQuestion(q.id)}
                                                                className="text-red-400 hover:text-red-300"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>

                                                        <input
                                                            type="text"
                                                            value={q.question}
                                                            onChange={(e) => updateManualQuestion(q.id, 'question', e.target.value)}
                                                            placeholder="Enter question text..."
                                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white text-sm placeholder-gray-400 mb-3"
                                                        />

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                                                            {[1, 2, 3, 4].map(optNum => (
                                                                <input
                                                                    key={optNum}
                                                                    type="text"
                                                                    value={q[`option${optNum}`]}
                                                                    onChange={(e) => updateManualQuestion(q.id, `option${optNum}`, e.target.value)}
                                                                    placeholder={`Option ${optNum}`}
                                                                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white text-sm placeholder-gray-400"
                                                                />
                                                            ))}
                                                        </div>

                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-400 mb-1">Correct Option</label>
                                                            <select
                                                                value={q.correct_option}
                                                                onChange={(e) => updateManualQuestion(q.id, 'correct_option', e.target.value)}
                                                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white text-sm"
                                                            >
                                                                <option value="1">Option 1</option>
                                                                <option value="2">Option 2</option>
                                                                <option value="3">Option 3</option>
                                                                <option value="4">Option 4</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {formErrors.questions && <p className="text-red-400 text-sm mt-2">{formErrors.questions}</p>}
                                    </div>
                                )}

                                {/* Generate Questions Section */}
                                {formData.questionMethod === 'generate' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Training Material (Resource PDF)
                                        </label>
                                        <div className="flex items-center gap-3 mb-4">
                                            <label className="flex-1 cursor-pointer">
                                                <div className={`flex items-center gap-3 px-4 py-3 border-2 border-dashed rounded-lg hover:border-purple-500 transition-colors ${formErrors.resource_pdf ? 'border-red-500' : 'border-gray-600'}`}>
                                                    <Upload className="w-5 h-5 text-gray-400" />
                                                    <span className="text-sm text-gray-300">
                                                        {formData.resource_pdf ? formData.resource_pdf.name : 'Upload resource PDF for question generation'}
                                                    </span>
                                                </div>
                                                <input
                                                    type="file"
                                                    name="resource_pdf"
                                                    accept=".pdf"
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                />
                                            </label>
                                            {formData.resource_pdf && (
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, resource_pdf: null }))}
                                                    className="text-red-400 hover:text-red-300"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                        {formErrors.resource_pdf && <p className="text-red-400 text-sm mb-4">{formErrors.resource_pdf}</p>}

                                        <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 space-y-4">
                                            <div className="flex items-start gap-3">
                                                <Wand2 className="w-5 h-5 text-purple-400 mt-0.5" />
                                                <div className="flex-1">
                                                    <p className="text-sm text-gray-300 mb-2">
                                                        AI will analyze your training material and generate relevant quiz questions automatically.
                                                    </p>
                                                    <p className="text-xs text-yellow-400">
                                                        ⚠️ This process may take a few minutes depending on the material size
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                                        Number of Questions
                                                    </label>
                                                    <select
                                                        name="numQuestions"
                                                        value={formData.numQuestions}
                                                        onChange={handleInputChange}
                                                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                                                    >
                                                        <option value="3">3 Questions</option>
                                                        <option value="5">5 Questions</option>
                                                        <option value="10">10 Questions</option>
                                                        <option value="15">15 Questions</option>
                                                        <option value="20">20 Questions</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                                        Difficulty Level
                                                    </label>
                                                    <select
                                                        name="difficultyLevel"
                                                        value={formData.difficultyLevel}
                                                        onChange={handleInputChange}
                                                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                                                    >
                                                        <option value="easy">Easy</option>
                                                        <option value="moderate">Moderate</option>
                                                        <option value="hard">Hard</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={handleGenerateQuestions}
                                                disabled={!formData.resource_pdf || generatingQuestions}
                                                className="w-full mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                            >
                                                {generatingQuestions ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                        Generating Questions...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Wand2 className="w-4 h-4" />
                                                        {generatedQuestions.length > 0 ? 'Re-generate Questions' : 'Generate Questions'}
                                                    </>
                                                )}
                                            </button>

                                            {/* Display Generated Questions */}
                                            {generatedQuestions.length > 0 && (
                                                <div className="mt-4 space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-sm font-medium text-green-400">
                                                            ✓ {generatedQuestions.length} Questions Generated
                                                        </p>
                                                        <p className="text-xs text-gray-400">You can edit the questions below</p>
                                                    </div>

                                                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                                                        {generatedQuestions.map((q, index) => (
                                                            <div key={index} className="bg-gray-700 rounded-lg p-4">
                                                                <label className="block text-xs font-medium text-gray-300 mb-2">
                                                                    Question {index + 1}
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={q.question}
                                                                    onChange={(e) => updateGeneratedQuestion(index, 'question', e.target.value)}
                                                                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white text-sm placeholder-gray-400 mb-3"
                                                                    placeholder="Enter question text..."
                                                                />

                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                                                                    {[1, 2, 3, 4].map(optNum => (
                                                                        <input
                                                                            key={optNum}
                                                                            type="text"
                                                                            value={q[`option${optNum}`] || ''}
                                                                            onChange={(e) => updateGeneratedQuestion(index, `option${optNum}`, e.target.value)}
                                                                            placeholder={`Option ${optNum}`}
                                                                            className="px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white text-sm placeholder-gray-400"
                                                                        />
                                                                    ))}
                                                                </div>

                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-400 mb-1">Correct Option</label>
                                                                    <select
                                                                        value={q.correct_option || '1'}
                                                                        onChange={(e) => updateGeneratedQuestion(index, 'correct_option', e.target.value)}
                                                                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white text-sm"
                                                                    >
                                                                        <option value="1">Option 1</option>
                                                                        <option value="2">Option 2</option>
                                                                        <option value="3">Option 3</option>
                                                                        <option value="4">Option 4</option>
                                                                    </select>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {formErrors.questions && generatedQuestions.length === 0 && (
                                                <p className="text-red-400 text-sm mt-2">{formErrors.questions}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Submit Buttons */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            resetForm();
                                            setError('');
                                        }}
                                        className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={submitting}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                                    >
                                        {submitting ? 'Creating...' : 'Create Quiz'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateQuiz;