import React, { useState, useEffect } from 'react';
import { useAuth } from '../../utils/AuthContext';
import { Navigate } from 'react-router-dom';
import { X, PlusCircleIcon, Edit2, Trash2, BookOpen } from 'lucide-react';
import api from '../../services/api';

const MyClass = () => {
  const { user, loading } = useAuth();  
  const [classrooms, setClassrooms] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentClassroom, setCurrentClassroom] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    name: '',
    subject_code: '',
    description: ''
  });

  useEffect(() => {
    if (user && user.role === 'TEACHER') {
      fetchClassrooms();
    }
  }, [user]);

  const fetchClassrooms = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/classroom/classrooms/');
      setClassrooms(response.data);
    } catch (error) {
      console.error('Failed to fetch classrooms:', error);
      showMessage('error', 'Failed to load classrooms');
    } finally {
      setIsLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.subject_code.trim()) {
      showMessage('error', 'Name and Subject Code are required');
      return;
    }

    setIsLoading(true);
    try {
      if (isEditing && currentClassroom) {
        const response = await api.patch(
          `/classroom/classrooms/${currentClassroom.id}/update/`,
          formData
        );
        setClassrooms(classrooms.map(c =>
          c.id === currentClassroom.id ? response.data : c
        ));
        showMessage('success', 'Class updated successfully');
      } else {
        const response = await api.post('/classroom/classrooms/', formData);
        setClassrooms([...classrooms, response.data]);
        showMessage('success', 'Class created successfully');
      }

      closeModal();
    } catch (error) {
      console.error('Failed to save classroom:', error);
      const errorMsg = error.response?.data?.message ||
        (isEditing ? 'Failed to update class' : 'Failed to create class');
      showMessage('error', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (classroom) => {
    setCurrentClassroom(classroom);
    setFormData({
      name: classroom.name,
      subject_code: classroom.subject_code,
      description: classroom.description || ''
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    setIsLoading(true);
    try {
      await api.delete(`/classroom/classrooms/${id}/delete/`);
      setClassrooms(classrooms.filter(c => c.id !== id));
      showMessage('success', 'Class deleted successfully');
    } catch (error) {
      console.error('Failed to delete classroom:', error);
      showMessage('error', 'Failed to delete class');
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setFormData({ name: '', subject_code: '', description: '' });
    setCurrentClassroom(null);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setCurrentClassroom(null);
    setFormData({ name: '', subject_code: '', description: '' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600 text-xl">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== 'TEACHER') {
    return <Navigate to="/unauthorized" />;
  }

  return (
    <div className="min-h-screen bg-gray-800  py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">My Classes</h1>
              <p className="mt-2 text-gray-600">
                Manage your classrooms and subjects
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-semibold"
            >
              Create Class
              <PlusCircleIcon size={15} className='font-bold' />
            </button>
          </div>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg ${message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
              }`}
          >
            {message.text}
          </div>
        )}

        {/* Classrooms Grid */}
        {isLoading && classrooms.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Loading classrooms...</div>
          </div>
        ) : classrooms.length === 0 ? (
          <div className="text-center py-16 bg-gray-900 rounded-lg shadow-sm">
            <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No classes yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first classroom to get started
            </p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusCircleIcon size={20} />
              Create Class
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classrooms.map((classroom) => (
              <div
                key={classroom.id}
                className="bg-gray-900 rounded-lg shadow-sm border border-gray-600 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-1">
                      {classroom.name}
                    </h3>
                    <p className="text-sm text-blue-600 font-medium">
                      {classroom.subject_code}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(classroom)}
                      className="p-2 text-white hover:bg-gray-700 rounded-lg transition-colors"
                      title="Edit class"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(classroom.id, classroom.name)}
                      className="p-2 text-red-600 hover:bg-gray-700 rounded-lg transition-colors"
                      title="Delete class"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <div className="text-sm text-white">
                  <p>Instructor: {classroom.teacher_name}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 backdrop-blur-md bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-2xl font-bold text-white">
                  {isEditing ? 'Edit Class' : 'Create New Class'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      Class Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border text-white border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Advanced Data Structures"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      Subject Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="subject_code"
                      value={formData.subject_code}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., CS203"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Enter class description..."
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-color text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
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

export default MyClass;