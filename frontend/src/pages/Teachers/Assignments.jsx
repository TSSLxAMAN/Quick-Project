import React, { useState, useEffect } from 'react';
import { useAuth } from '../../utils/AuthContext';
import api from '../../services/api';
import { Upload, FileText, Calendar, Clock, Trash2, Plus, X, Search, Filter, Wand2 } from 'lucide-react';

const Assignments = () => {
  const { user, loading } = useAuth();
  const [assignments, setAssignments] = useState([]);
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
    deadline: '',
    question_pdf: null,
    resource_pdf: null,
    questionMethod: 'upload',
    numQuestions: '5',
    difficultyLevel: 'moderate',
  });

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
      const [assignmentsRes, classroomsRes] = await Promise.all([
        api.get('/classroom/assignments/'),
        api.get('/classroom/classrooms/')
      ]);

      setAssignments(assignmentsRes.data);
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
      question_pdf: null
    }));
    setGeneratedQuestions([]);
    if (formErrors.question_pdf) {
      setFormErrors(prev => ({ ...prev, question_pdf: '' }));
    }
  };

  const handleQuestionChange = (index, value) => {
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
      const generateData = new FormData();
      generateData.append('resource_pdf', formData.resource_pdf);
      generateData.append('title', formData.title);
      generateData.append('classroom', formData.classroom);
      generateData.append('deadline', formData.deadline);
      generateData.append('num_questions', formData.numQuestions);
      generateData.append('difficulty', formData.difficultyLevel);

      const response = await api.post('/classroom/assignments/generate-questions/', generateData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.questions) {
        setGeneratedQuestions(response.data.questions);
        setFormData(prev => ({ ...prev, question_pdf: new File([''], 'generated_questions.pdf') }));
      }
    } catch (err) {
      console.error('Error generating questions:', err);
      if (err.response && err.response.data) {
        const errorData = err.response.data;
        if (typeof errorData === 'object') {
          const errorMessages = Object.entries(errorData)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('; ');
          setError(errorMessages || 'Failed to generate questions from training material');
        } else {
          setError('Failed to generate questions from training material');
        }
      } else {
        setError('Failed to generate questions from training material');
      }
    } finally {
      setGeneratingQuestions(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.classroom) errors.classroom = 'Classroom is required';
    if (!formData.deadline) errors.deadline = 'Deadline is required';

    if (formData.questionMethod === 'upload' && !formData.question_pdf) {
      errors.question_pdf = 'Question PDF is required';
    }

    if (formData.questionMethod === 'generate' && generatedQuestions.length === 0) {
      errors.question_pdf = 'Please generate questions first';
    }

    const deadlineDate = new Date(formData.deadline);
    if (deadlineDate < new Date()) {
      errors.deadline = 'Deadline must be in the future';
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
      submitData.append('deadline', formData.deadline);
      submitData.append('questionMethod', formData.questionMethod);

      if (formData.questionMethod === 'generate' && generatedQuestions.length > 0) {
        submitData.append('generated_questions', JSON.stringify(generatedQuestions));
      }

      if (formData.question_pdf && formData.questionMethod === 'upload') {
        submitData.append('question_pdf', formData.question_pdf);
      }
      if (formData.resource_pdf) {
        submitData.append('resource_pdf', formData.resource_pdf);
      }

      const response = await api.post('/classroom/assignments/', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setAssignments(prev => [response.data, ...prev]);
      setShowModal(false);
      resetForm();
      setError('');
    } catch (err) {
      console.error('Error creating assignment:', err);
      if (err.response && err.response.data) {
        const errorData = err.response.data;
        if (typeof errorData === 'object') {
          const errorMessages = Object.entries(errorData)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('; ');
          setError(errorMessages || 'Failed to create assignment');
        } else {
          setError('Failed to create assignment');
        }
      } else {
        setError('Failed to create assignment');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;

    try {
      await api.delete(`/classroom/assignments/${id}/delete`);
      setAssignments(prev => prev.filter(a => a.id !== id));
      setError('');
    } catch (err) {
      setError('Failed to delete assignment');
      console.error('Error deleting assignment:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      classroom: '',
      deadline: '',
      question_pdf: null,
      resource_pdf: null,
      questionMethod: 'upload',
      numQuestions: '5',
      difficultyLevel: 'moderate',
    });
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

  const isDeadlinePassed = (deadline) => {
    return new Date(deadline) < new Date();
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.classroom_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterClassroom === 'all' || assignment.classroom === filterClassroom;
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
          <h1 className="text-3xl font-bold text-white mb-2">Assignments</h1>
          <p className="text-gray-300">Manage and create assignments for your classrooms</p>
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
              placeholder="Search assignments..."
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
              New Assignment
            </button>
          </div>
        </div>

        {/* Assignments List */}
        {dataLoading ? (
          <div className="text-center py-12 text-gray-300">Loading assignments...</div>
        ) : filteredAssignments.length === 0 ? (
          <div className="text-center py-12 bg-gray-900 rounded-lg shadow">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-300 text-lg">No assignments found</p>
            <p className="text-gray-400 mt-2">Create your first assignment to get started</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredAssignments.map(assignment => (
              <div key={assignment.id} className="bg-gray-900 rounded-lg shadow hover:shadow-lg transition-shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-1">{assignment.title}</h3>
                    <span className="inline-block px-3 py-1 bg-blue-600 text-blue-100 text-sm rounded-full">
                      {assignment.classroom_name}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(assignment.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {assignment.description && (
                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">{assignment.description}</p>
                )}

                <div className="space-y-2 mb-4">
                  {assignment.question_pdf && (
                    <a
                      href={assignment.question_pdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm"
                    >
                      <FileText className="w-4 h-4" />
                      Question PDF
                    </a>
                  )}
                  {assignment.resource_pdf && (
                    <a
                      href={assignment.resource_pdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-green-400 hover:text-green-300 text-sm"
                    >
                      <FileText className="w-4 h-4" />
                      Resource PDF
                    </a>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                    <Calendar className="w-4 h-4" />
                    Created: {formatDate(assignment.created_at)}
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${isDeadlinePassed(assignment.deadline) ? 'text-red-400' : 'text-gray-300'}`}>
                    <Clock className="w-4 h-4" />
                    Due: {formatDate(assignment.deadline)}
                    {isDeadlinePassed(assignment.deadline) && (
                      <span className="ml-2 px-2 py-0.5 bg-red-900 text-red-200 text-xs rounded">Expired</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Assignment Modal */}
        {showModal && (
          <div className="fixed inset-0 backdrop-blur-2xl bg-opacity-50 flex items-center justify-center p-4 z-50 ">
            <div className="bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gray-900 border-b border-gray-700 px-6 py-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Create New Assignment</h2>
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
                    placeholder="e.g., Binary Trees Assignment"
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
                    placeholder="Provide additional details about the assignment..."
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

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Deadline <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white ${formErrors.deadline ? 'border-red-500' : 'border-gray-600'}`}
                  />
                  {formErrors.deadline && <p className="text-red-400 text-sm mt-1">{formErrors.deadline}</p>}
                </div>

                {/* Training Material (Resource PDF) - Now First */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Resource PDF (Training Material)
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex-1 cursor-pointer">
                      <div className={`flex items-center gap-3 px-4 py-3 border-2 border-dashed rounded-lg hover:border-green-500 transition-colors ${formErrors.resource_pdf ? 'border-red-500' : 'border-gray-600'}`}>
                        <Upload className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-300">
                          {formData.resource_pdf ? formData.resource_pdf.name : 'Upload resource PDF for RAG model'}
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
                  <p className="text-xs text-gray-400 mt-2">This PDF will be used to train the RAG model for plagiarism detection</p>
                </div>

                {/* Question Method Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Question Method <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => handleQuestionMethodChange('upload')}
                      className={`p-4 rounded-lg border-2 transition-all ${formData.questionMethod === 'upload'
                        ? 'border-blue-500 bg-blue-900 bg-opacity-20'
                        : 'border-gray-600 hover:border-gray-500'
                        }`}
                    >
                      <Upload className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-white">Upload Question PDF</p>
                      <p className="text-xs text-gray-400 mt-1">Upload pre-made questions</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuestionMethodChange('generate')}
                      className={`p-4 rounded-lg border-2 transition-all ${formData.questionMethod === 'generate'
                        ? 'border-purple-500 bg-purple-900 bg-opacity-20'
                        : 'border-gray-600 hover:border-gray-500'
                        }`}
                      disabled={!formData.resource_pdf}
                    >
                      <Wand2 className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-white">Generate from Material</p>
                      <p className="text-xs text-gray-400 mt-1">AI-powered generation</p>
                    </button>
                  </div>
                </div>

                {/* Question Upload/Generate Section */}
                {formData.questionMethod === 'upload' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Question PDF
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="flex-1 cursor-pointer">
                        <div className={`flex items-center gap-3 px-4 py-3 border-2 border-dashed rounded-lg hover:border-blue-500 transition-colors ${formErrors.question_pdf ? 'border-red-500' : 'border-gray-600'}`}>
                          <Upload className="w-5 h-5 text-gray-400" />
                          <span className="text-sm text-gray-300">
                            {formData.question_pdf ? formData.question_pdf.name : 'Upload question PDF'}
                          </span>
                        </div>
                        <input
                          type="file"
                          name="question_pdf"
                          accept=".pdf"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                      {formData.question_pdf && (
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, question_pdf: null }))}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    {formErrors.question_pdf && <p className="text-red-400 text-sm mt-1">{formErrors.question_pdf}</p>}
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Generate Questions from Training Material
                    </label>
                    <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 space-y-4">
                      <div className="flex items-start gap-3">
                        <Wand2 className="w-5 h-5 text-purple-400 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-300 mb-2">
                            AI will analyze your training material and generate relevant questions automatically.
                          </p>
                          <p className="text-xs text-yellow-400">
                            ⚠️ This process may take a few minutes depending on the material size
                          </p>
                        </div>
                      </div>

                      {/* Number of Questions */}
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

                      {/* Difficulty Level */}
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

                          <div className="space-y-3 overflow-y-auto pr-2">
                            {generatedQuestions.map((q, index) => (
                              <div key={q.question_number} className="bg-gray-700 rounded-lg p-3">
                                <label className="block text-xs font-medium text-gray-300 mb-1">
                                  Question {q.question_number}
                                </label>
                                <input
                                  type="text"
                                  value={q.question}
                                  onChange={(e) => handleQuestionChange(index, e.target.value)}
                                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white text-sm placeholder-gray-400"
                                  placeholder="Enter question text..."
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {formErrors.question_pdf && generatedQuestions.length === 0 && (
                        <p className="text-red-400 text-sm mt-2">{formErrors.question_pdf}</p>
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
                    {submitting ? 'Creating...' : 'Create Assignment'}
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

export default Assignments;