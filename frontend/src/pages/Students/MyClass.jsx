import React, { useState, useEffect } from 'react';
import { useAuth } from '../../utils/AuthContext';
import api from '../../services/api';
import { User, BookOpen, Send, CheckCircle, Clock, Plus, X, FileText, AlertCircle } from 'lucide-react';

const MyClass = () => {
  const { user, loading } = useAuth();
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [sendingRequests, setSendingRequests] = useState({});

  useEffect(() => {
    if (user && user.role === 'STUDENT') {
      fetchEnrolledClasses();
    }
  }, [user]);

  const fetchEnrolledClasses = async () => {
    try {
      setDataLoading(true);
      const response = await api.get('/classroom/enrolledClasses/');
      setEnrolledClasses(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load enrolled classes');
      console.error('Error fetching enrolled classes:', err);
    } finally {
      setDataLoading(false);
    }
  };

  const fetchJoinRequests = async () => {
    try {
      setRequestsLoading(true);
      const response = await api.get('/classroom/myJoinRequests/');
      setJoinRequests(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load join requests');
      console.error('Error fetching join requests:', err);
    } finally {
      setRequestsLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      setDataLoading(true);
      const response = await api.get('/classrooms/university/');
      setTeachers(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load teachers from your university');
      console.error('Error fetching teachers:', err);
    } finally {
      setDataLoading(false);
    }
  };

  const fetchSubjects = async (teacherId) => {
    try {
      setSubjectsLoading(true);
      const response = await api.get(`/classroom/${teacherId}/classrooms/`);
      setSubjects(response.data);
      setSelectedTeacher(teacherId);
      setError('');
    } catch (err) {
      setError('Failed to load subjects for this teacher');
      console.error('Error fetching subjects:', err);
    } finally {
      setSubjectsLoading(false);
    }
  };

  const isAlreadyEnrolled = (subjectId) => {
    return enrolledClasses.some(cls => cls.class_id === subjectId);
  };

  const isPendingRequest = (subjectId) => {
    return joinRequests.some(req => req.classroom_id === subjectId && req.status === 'pending');
  };

  const handleJoinRequest = async (subjectId) => {
    if (isAlreadyEnrolled(subjectId)) {
      setError('You are already enrolled in this class');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      setSendingRequests(prev => ({ ...prev, [subjectId]: 'sending' }));

      await api.post('/classroom/join-request/', { classroom_id: subjectId });

      setSendingRequests(prev => ({ ...prev, [subjectId]: 'sent' }));
      setSuccessMessage('Join request sent successfully!');

      // Refresh join requests
      await fetchJoinRequests();

      setTimeout(() => {
        setSuccessMessage('');
        handleCloseJoinModal();
      }, 2000);
      setError('');
    } catch (err) {
      setSendingRequests(prev => ({ ...prev, [subjectId]: 'failed' }));
      setError(err.response?.data?.error || 'Failed to send join request. Please try again.');
      console.error('Error sending join request:', err);
      setTimeout(() => {
        setError('');
        setSendingRequests(prev => ({ ...prev, [subjectId]: null }));
      }, 3000);
    }
  };

  const handleOpenJoinModal = () => {
    setShowJoinModal(true);
    fetchTeachers();
    fetchJoinRequests();
  };

  const handleCloseJoinModal = () => {
    setShowJoinModal(false);
    setSelectedTeacher(null);
    setSubjects([]);
    setTeachers([]);
  };

  const handleOpenRequestsModal = () => {
    setShowRequestsModal(true);
    fetchJoinRequests();
  };

  const handleCloseRequestsModal = () => {
    setShowRequestsModal(false);
  };

  const handleBack = () => {
    setSelectedTeacher(null);
    setSubjects([]);
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-900/50 text-yellow-300 border-yellow-700',
      approved: 'bg-green-900/50 text-green-300 border-green-700',
      rejected: 'bg-red-900/50 text-red-300 border-red-700'
    };
    return styles[status] || styles.pending;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <X className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-800">
        <div className="text-gray-300 text-xl">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== 'STUDENT') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-800">
        <div className="text-red-400 text-xl">Unauthorized Access</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Action Buttons */}
        <div className="mb-8 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Classes</h1>
            <p className="text-gray-400">Manage your enrolled classes</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleOpenRequestsModal}
              className="bg-gray-700 hover:bg-gray-650 text-white px-5 py-3 rounded-lg font-medium transition-colors flex items-center border border-gray-600"
            >
              <FileText className="w-5 h-5 mr-2" />
              My Requests
            </button>
            <button
              onClick={handleOpenJoinModal}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Join Class
            </button>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && !showJoinModal && (
          <div className="mb-6 bg-green-900/50 border border-green-700 text-green-300 px-4 py-3 rounded-lg flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && !showJoinModal && (
          <div className="mb-6 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Enrolled Classes */}
        {dataLoading && !showJoinModal ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-gray-300 text-lg">Loading classes...</div>
          </div>
        ) : enrolledClasses.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-20 h-20 mx-auto text-gray-600 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-300 mb-2">
              Not Enrolled in Any Class
            </h2>
            <p className="text-gray-400 mb-6">
              Click the "Join Class" button above to browse and join classes
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledClasses.map((classItem) => (
              <div
                key={classItem.class_id}
                className="bg-gray-700 rounded-lg p-6 border border-gray-600 hover:border-gray-500 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-semibold text-white">
                    {classItem.class_name}
                  </h3>
                  {classItem.subject_code && (
                    <span className="bg-blue-900/50 text-blue-300 px-2 py-1 rounded text-xs font-medium">
                      {classItem.subject_code}
                    </span>
                  )}
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-400 text-sm">
                    <User className="w-4 h-4 mr-2" />
                    {classItem.teacher_name}
                  </div>
                  <div className="text-gray-500 text-xs">
                    Joined: {formatDate(classItem.joined_at)}
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-600">
                  <span className="inline-flex items-center text-green-400 text-sm">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Enrolled
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Join Class Modal */}
        {showJoinModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-700 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-gray-600">
                <h2 className="text-2xl font-bold text-white">
                  {selectedTeacher ? 'Select Subject' : 'Select Teacher'}
                </h2>
                <button
                  onClick={handleCloseJoinModal}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-88px)]">
                {successMessage && (
                  <div className="mb-4 bg-green-900/50 border border-green-700 text-green-300 px-4 py-3 rounded-lg flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    {successMessage}
                  </div>
                )}

                {error && (
                  <div className="mb-4 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                {dataLoading && (
                  <div className="flex justify-center items-center py-12">
                    <div className="text-gray-300 text-lg">Loading teachers...</div>
                  </div>
                )}

                {!selectedTeacher && !dataLoading && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teachers.length === 0 ? (
                      <div className="col-span-full text-center py-12">
                        <User className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                        <p className="text-gray-400 text-lg">No teachers found in your university</p>
                      </div>
                    ) : (
                      teachers.map((teacher) => (
                        <div
                          key={teacher.id}
                          className="bg-gray-800 rounded-lg p-5 hover:bg-gray-750 transition-colors cursor-pointer border border-gray-600 hover:border-blue-500"
                          onClick={() => fetchSubjects(teacher.id)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="bg-blue-600 rounded-full p-2">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-semibold text-white mb-1 truncate">
                                {teacher.full_name}
                              </h3>
                              <p className="text-gray-400 text-xs mb-2 truncate">{teacher.email}</p>
                              <div className="flex items-center text-gray-500 text-xs">
                                <BookOpen className="w-3 h-3 mr-1" />
                                <span className="truncate">{teacher.university}</span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 text-right">
                            <span className="text-blue-400 text-xs font-medium hover:text-blue-300">
                              View Subjects →
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {selectedTeacher && (
                  <div>
                    <button
                      onClick={handleBack}
                      className="mb-4 text-blue-400 hover:text-blue-300 flex items-center text-sm"
                    >
                      ← Back to Teachers
                    </button>

                    {subjectsLoading ? (
                      <div className="flex justify-center items-center py-12">
                        <div className="text-gray-300 text-lg">Loading subjects...</div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {subjects.length === 0 ? (
                          <div className="col-span-full text-center py-12">
                            <BookOpen className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                            <p className="text-gray-400 text-lg">No subjects available</p>
                          </div>
                        ) : (
                          subjects.map((subject) => {
                            const enrolled = isAlreadyEnrolled(subject.id);
                            const pending = isPendingRequest(subject.id);
                            const sending = sendingRequests[subject.id];

                            return (
                              <div
                                key={subject.id}
                                className="bg-gray-800 rounded-lg p-5 border border-gray-600"
                              >
                                <div className="mb-4">
                                  <div className="flex items-start justify-between mb-2">
                                    <h3 className="text-lg font-semibold text-white">
                                      {subject.name}
                                    </h3>
                                    {subject.subject_code && (
                                      <span className="bg-blue-900/50 text-blue-300 px-2 py-1 rounded text-xs font-medium">
                                        {subject.subject_code}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-gray-400 text-sm line-clamp-2">
                                    {subject.description || 'No description available'}
                                  </p>
                                </div>

                                <button
                                  onClick={() => handleJoinRequest(subject.id)}
                                  disabled={enrolled || pending || sending === 'sending' || sending === 'sent'}
                                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center text-sm ${enrolled
                                      ? 'bg-green-900/50 text-green-300 cursor-not-allowed border border-green-700'
                                      : pending || sending === 'sent'
                                        ? 'bg-yellow-900/50 text-yellow-300 cursor-not-allowed border border-yellow-700'
                                        : sending === 'sending'
                                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                          : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                                >
                                  {enrolled ? (
                                    <>
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Already Enrolled
                                    </>
                                  ) : pending || sending === 'sent' ? (
                                    <>
                                      <Clock className="w-4 h-4 mr-2" />
                                      Request Pending
                                    </>
                                  ) : sending === 'sending' ? (
                                    <>
                                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                                      Sending...
                                    </>
                                  ) : (
                                    <>
                                      <Send className="w-4 h-4 mr-2" />
                                      Send Join Request
                                    </>
                                  )}
                                </button>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* My Requests Modal */}
        {showRequestsModal && (
          <div className="fixed inset-0 backdrop-blur-2xl bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-700 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-gray-600">
                <h2 className="text-2xl font-bold text-white">My Join Requests</h2>
                <button
                  onClick={handleCloseRequestsModal}
                  className="text-gray-400 hover:text-white transition-colors hover:bg-gray-800 p-2 rounded-2xl"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-88px)]">
                {requestsLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="text-gray-300 text-lg">Loading requests...</div>
                  </div>
                ) : joinRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400 text-lg">No join requests found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {joinRequests.map((request) => (
                      <div
                        key={request.request_id}
                        className="bg-gray-800 rounded-lg p-5 border border-gray-600"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white mb-1">
                              {request.classroom_name}
                            </h3>
                            {request.subject_code && (
                              <span className="bg-blue-900/50 text-blue-300 px-2 py-1 rounded text-xs font-medium">
                                {request.subject_code}
                              </span>
                            )}
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusBadge(request.status)}`}>
                            {getStatusIcon(request.status)}
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center text-gray-400">
                            <User className="w-4 h-4 mr-2" />
                            Teacher: {request.teacher_name}
                          </div>
                          <div className="text-gray-500 text-xs">
                            Requested: {formatDate(request.requested_at)}
                          </div>
                          {request.reviewed_at && (
                            <div className="text-gray-500 text-xs">
                              Reviewed: {formatDate(request.reviewed_at)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyClass;