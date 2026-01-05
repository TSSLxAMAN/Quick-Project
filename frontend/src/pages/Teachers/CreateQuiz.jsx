import React, { useState, useEffect } from 'react';
import { useAuth } from '../../utils/AuthContext';
import api from '../../services/api';
import { Upload, FileText, Calendar, Clock, Trash2, Plus, X, Search, Filter, Wand2, Edit2 } from 'lucide-react';

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
        resource_pdf: null,
        questionMethod: 'manual',
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
            // TODO: Uncomment when API is ready
            const [quizzesRes, classroomsRes] = await Promise.all([
              api.get('/classroom/classrooms/')
            ]);
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
        setFormData(prev => ({
            ...prev,
            questionMethod: method,
        }));
        setGeneratedQuestions([]);
        if (method === 'manual') {
            setManualQuestions([createEmptyQuestion()]);
        }
    };

    const createEmptyQuestion = () => ({
        id: Date.now() + Math.random(),
        question: '',
        options: ['', '', '', ''],
        correct_answer: 0
    });

    const handleAddManualQuestion = () => {
        setManualQuestions(prev => [...prev, createEmptyQuestion()]);
    };

    const handleRemoveManualQuestion = (id) => {
        setManualQuestions(prev => prev.filter(q => q.id !== id));
    };

    const handleManualQuestionChange = (id, field, value) => {
        setManualQuestions(prev => prev.map(q =>
            q.id === id ? { ...q, [field]: value } : q
        ));
    };

    const handleManualOptionChange = (questionId, optionIndex, value) => {
        setManualQuestions(prev => prev.map(q => {
            if (q.id === questionId) {
                const newOptions = [...q.options];
                newOptions[optionIndex] = value;
                return { ...q, options: newOptions };
            }
            return q;
        }));
    };

    const handleGeneratedQuestionChange = (index, value) => {
        setGeneratedQuestions(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], question: value };
            return updated;
        });
    };

    const handleGenerateQuestions = async () => {
        if (!formData.resource_pdf) {
            setFormErrors(prev => ({ ...prev, resource_pdf: 'Please upload training material first' }));
            return;
        }

        setGeneratingQuestions(true);
        setError('');

        try {
            // TODO: Uncomment when API is ready
            // const generateData = new FormData();
            // generateData.append('resource_pdf', formData.resource_pdf);
            // generateData.append('title', formData.title);
            // generateData.append('classroom', formData.classroom);
            // generateData.append('num_questions', formData.numQuestions);
            // generateData.append('difficulty', formData.difficultyLevel);

            // const response = await api.post('/classroom/quizzes/generate-questions/', generateData, {
            //   headers: {
            //     'Content-Type': 'multipart/form-data',
            //   },
            // });

            // Mock response
            await new Promise(resolve => setTimeout(resolve, 2000));
            const mockQuestions = Array.from({ length: parseInt(formData.numQuestions) }, (_, i) => ({
                question_number: i + 1,
                question: `Sample generated question ${i + 1}?`,
                options: ['Option A', 'Option B', 'Option C', 'Option D'],
                correct_answer: 0
            }));

            setGeneratedQuestions(mockQuestions);
        } catch (err) {
            console.error('Error generating questions:', err);
            setError('Failed to generate questions from training material');
        } finally {
            setGeneratingQuestions(false);
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.title.trim()) errors.title = 'Title is required';
        if (!formData.classroom) errors.classroom = 'Classroom is required';
        if (!formData.start_time) errors.start_time = 'Start time is required';
        if (!formData.end_time) errors.end_time = 'End time is required';

        const startTime = new Date(formData.start_time);
        const endTime = new Date(formData.end_time);

        if (startTime < new Date()) {
            errors.start_time = 'Start time must be in the future';
        }

        if (endTime <= startTime) {
            errors.end_time = 'End time must be after start time';
        }

        if (formData.questionMethod === 'manual') {
            if (manualQuestions.length === 0) {
                errors.questions = 'At least one question is required';
            } else {
                const hasInvalidQuestion = manualQuestions.some(q =>
                    !q.question.trim() || q.options.some(opt => !opt.trim())
                );
                if (hasInvalidQuestion) {
                    errors.questions = 'All questions and options must be filled';
                }
            }
        } else if (formData.questionMethod === 'generate') {
            if (generatedQuestions.length === 0) {
                errors.questions = 'Please generate questions first';
            }
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setSubmitting(true);

            // TODO: Uncomment when API is ready
            // const submitData = new FormData();
            // submitData.append('title', formData.title);
            // submitData.append('description', formData.description);
            // submitData.append('classroom', formData.classroom);
            // submitData.append('start_time', formData.start_time);
            // submitData.append('end_time', formData.end_time);
            // submitData.append('questionMethod', formData.questionMethod);

            // if (formData.questionMethod === 'manual') {
            //   submitData.append('questions', JSON.stringify(manualQuestions));
            // } else {
            //   submitData.append('questions', JSON.stringify(generatedQuestions));
            //   submitData.append('resource_pdf', formData.resource_pdf);
            // }

            // const response = await api.post('/classroom/quizzes/', submitData, {
            //   headers: {
            //     'Content-Type': 'multipart/form-data',
            //   },
            // });

            // Mock success
            await new Promise(resolve => setTimeout(resolve, 1000));
            const newQuiz = {
                id: Date.now(),
                title: formData.title,
                description: formData.description,
                classroom_name: classrooms.find(c => c.id === parseInt(formData.classroom))?.name || '',
                start_time: formData.start_time,
                end_time: formData.end_time,
                created_at: new Date().toISOString(),
                question_count: formData.questionMethod === 'manual' ? manualQuestions.length : generatedQuestions.length
            };

            setQuizzes(prev => [newQuiz, ...prev]);
            setShowModal(false);
            resetForm();
            setError('');
        } catch (err) {
            console.error('Error creating quiz:', err);
            setError('Failed to create quiz');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this quiz?')) return;

        try {
            // TODO: Uncomment when API is ready
            // await api.delete(`/classroom/quizzes/${id}/delete`);

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
            resource_pdf: null,
            questionMethod: 'manual',
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

    const isQuizActive = (startTime, endTime) => {
        const now = new Date();
        const start = new Date(startTime);
        const end = new Date(endTime);
        return now >= start && now <= end;
    };

    const isQuizUpcoming = (startTime) => {
        return new Date(startTime) > new Date();
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
                        {filteredQuizzes.map(quiz => (
                            <div key={quiz.id} className="bg-gray-900 rounded-lg shadow hover:shadow-lg transition-shadow p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-semibold text-white mb-1">{quiz.title}</h3>
                                        <span className="inline-block px-3 py-1 bg-blue-600 text-blue-100 text-sm rounded-full">
                                            {quiz.classroom_name}
                                        </span>
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

                                <div className="mb-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                        <FileText className="w-4 h-4" />
                                        {quiz.question_count} Questions
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-700 space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                        <Calendar className="w-4 h-4" />
                                        Created: {formatDate(quiz.created_at)}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-300">
                                        <Clock className="w-4 h-4" />
                                        Start: {formatDate(quiz.start_time)}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-300">
                                        <Clock className="w-4 h-4" />
                                        End: {formatDate(quiz.end_time)}
                                    </div>

                                    {isQuizActive(quiz.start_time, quiz.end_time) ? (
                                        <span className="inline-block mt-2 px-3 py-1 bg-green-900 text-green-200 text-xs rounded-full">
                                            Active Now
                                        </span>
                                    ) : isQuizUpcoming(quiz.start_time) ? (
                                        <span className="inline-block mt-2 px-3 py-1 bg-yellow-900 text-yellow-200 text-xs rounded-full">
                                            Upcoming
                                        </span>
                                    ) : (
                                        <span className="inline-block mt-2 px-3 py-1 bg-gray-700 text-gray-300 text-xs rounded-full">
                                            Ended
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
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
                                {/* Basic Info */}
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
                                        placeholder="e.g., Data Structures Mid-Term Quiz"
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

                                <div className="grid grid-cols-2 gap-4">
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
                                            <Edit2 className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                                            <p className="text-sm font-medium text-white">Add Manually</p>
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
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <label className="block text-sm font-medium text-gray-300">
                                                Questions <span className="text-red-400">*</span>
                                            </label>
                                            <button
                                                type="button"
                                                onClick={handleAddManualQuestion}
                                                className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                                Add Question
                                            </button>
                                        </div>

                                        {manualQuestions.length === 0 && (
                                            <div className="text-center py-8 bg-gray-800 border border-gray-600 rounded-lg">
                                                <p className="text-gray-400">Click "Add Question" to start adding questions</p>
                                            </div>
                                        )}

                                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                                            {manualQuestions.map((question, index) => (
                                                <div key={question.id} className="bg-gray-800 border border-gray-600 rounded-lg p-4">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <h4 className="text-sm font-medium text-white">Question {index + 1}</h4>
                                                        {manualQuestions.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveManualQuestion(question.id)}
                                                                className="text-red-400 hover:text-red-300"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>

                                                    <input
                                                        type="text"
                                                        value={question.question}
                                                        onChange={(e) => handleManualQuestionChange(question.id, 'question', e.target.value)}
                                                        placeholder="Enter question text"
                                                        className="w-full px-3 py-2 mb-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 text-sm"
                                                    />

                                                    <div className="space-y-2">
                                                        <p className="text-xs text-gray-400 mb-2">Options:</p>
                                                        {question.options.map((option, optIndex) => (
                                                            <div key={optIndex} className="flex items-center gap-2">
                                                                <input
                                                                    type="radio"
                                                                    name={`correct-${question.id}`}
                                                                    checked={question.correct_answer === optIndex}
                                                                    onChange={() => handleManualQuestionChange(question.id, 'correct_answer', optIndex)}
                                                                    className="w-4 h-4 text-blue-600"
                                                                />
                                                                <input
                                                                    type="text"
                                                                    value={option}
                                                                    onChange={(e) => handleManualOptionChange(question.id, optIndex, e.target.value)}
                                                                    placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                                                                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 text-sm"
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {formErrors.questions && <p className="text-red-400 text-sm mt-1">{formErrors.questions}</p>}
                                    </div>
                                )}

                                {/* Generate Questions Section */}
                                {formData.questionMethod === 'generate' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Training Material (Resource PDF)
                                        </label>
                                        <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 space-y-4">
                                            <div className="flex items-center gap-3">
                                                <label className="flex-1 cursor-pointer">
                                                    <div className={`flex items-center gap-3 px-4 py-3 border-2 border-dashed rounded-lg hover:border-purple-500 transition-colors ${formErrors.resource_pdf ? 'border-red-500' : 'border-gray-600'}`}>
                                                        <Upload className="w-5 h-5 text-gray-400" />
                                                        <span className="text-sm text-gray-300">
                                                            {formData.resource_pdf ? formData.resource_pdf.name : 'Upload resource PDF'}
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
                                            {formErrors.resource_pdf && <p className="text-red-400 text-sm mt-1">{formErrors.resource_pdf}</p>}

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
                                                <div className="grid grid-cols-3 gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, difficultyLevel: 'easy' }))}
                                                        className={`px-4 py-2 rounded-lg transition-all ${formData.difficultyLevel === 'easy'
                                                            ? 'bg-green-600 text-white'
                                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                            }`}
                                                    >
                                                        Easy
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, difficultyLevel: 'moderate' }))}
                                                        className={`px-4 py-2 rounded-lg transition-all ${formData.difficultyLevel === 'moderate'
                                                            ? 'bg-yellow-600 text-white'
                                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                            }`}
                                                    >
                                                        Moderate
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, difficultyLevel: 'hard' }))}
                                                        className={`px-4 py-2 rounded-lg transition-all ${formData.difficultyLevel === 'hard'
                                                            ? 'bg-red-600 text-white'
                                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                            }`}
                                                    >
                                                        Hard
                                                    </button>
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
                                                            <div key={q.question_number} className="bg-gray-700 rounded-lg p-3">
                                                                <label className="block text-xs font-medium text-gray-300 mb-2">
                                                                    Question {q.question_number}
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={q.question}
                                                                    onChange={(e) => handleGeneratedQuestionChange(index, e.target.value)}
                                                                    className="w-full px-3 py-2 mb-3 bg-gray-600 border border-gray-500 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white text-sm placeholder-gray-400"
                                                                    placeholder="Enter question text..."
                                                                />

                                                                <div className="space-y-2">
                                                                    <p className="text-xs text-gray-400 mb-2">Options:</p>
                                                                    {q.options.map((option, optIndex) => (
                                                                        <div key={optIndex} className="flex items-center gap-2">
                                                                            <input
                                                                                type="radio"
                                                                                name={`gen-correct-${q.question_number}`}
                                                                                checked={q.correct_answer === optIndex}
                                                                                onChange={() => {
                                                                                    setGeneratedQuestions(prev => {
                                                                                        const updated = [...prev];
                                                                                        updated[index] = { ...updated[index], correct_answer: optIndex };
                                                                                        return updated;
                                                                                    });
                                                                                }}
                                                                                className="w-4 h-4 text-purple-600"
                                                                            />
                                                                            <input
                                                                                type="text"
                                                                                value={option}
                                                                                onChange={(e) => {
                                                                                    setGeneratedQuestions(prev => {
                                                                                        const updated = [...prev];
                                                                                        const newOptions = [...updated[index].options];
                                                                                        newOptions[optIndex] = e.target.value;
                                                                                        updated[index] = { ...updated[index], options: newOptions };
                                                                                        return updated;
                                                                                    });
                                                                                }}
                                                                                placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                                                                                className="flex-1 px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 text-sm"
                                                                            />
                                                                        </div>
                                                                    ))}
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