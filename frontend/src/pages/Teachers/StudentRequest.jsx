import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';
import api from '../../services/api';
import { CheckCircle, XCircle, Clock, Users, UserCheck, UserX } from 'lucide-react';

const StudentRequest = () => {
  const { user, loading } = useAuth();
  const [classrooms, setClassrooms] = useState([]);
  const [requests, setRequests] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingRequest, setProcessingRequest] = useState(null);

  useEffect(() => {
    if (user && user.role === 'TEACHER') {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setDataLoading(true);
      const [classroomsRes, requestsRes] = await Promise.all([
        api.get('/classroom/classrooms/'),
        api.get('/classroom/teacher/joinRequests/')
      ]);

      setClassrooms(classroomsRes.data);
      setRequests(requestsRes.data);
      setError('');
    } catch (err) {
      setError('Failed to load data');
      console.error('Error fetching data:', err);
    } finally {
      setDataLoading(false);
    }
  };

  const handleRequestAction = async (requestId, status) => {
    try {
      setProcessingRequest(requestId);
      await api.patch(`/classroom/joinRequest/${requestId}/update/`, {
        status: status
      });

      // Refresh data after action
      await fetchData();
    } catch (err) {
      setError(`Failed to ${status} request`);
      console.error(`Error ${status} request:`, err);
    } finally {
      setProcessingRequest(null);
    }
  };

  const getFilteredRequests = () => {
    let filtered = requests.filter(req => req.status === activeTab);

    if (selectedClassroom) {
      filtered = filtered.filter(req => req.classroom === selectedClassroom);
    }

    return filtered;
  };

  const getRequestCountsByStatus = () => {
    const counts = {
      pending: 0,
      approved: 0,
      rejected: 0
    };

    const filteredByClassroom = selectedClassroom
      ? requests.filter(req => req.classroom === selectedClassroom)
      : requests;

    filteredByClassroom.forEach(req => {
      if (counts[req.status] !== undefined) {
        counts[req.status]++;
      }
    });

    return counts;
  };

  const getRequestCountsByClassroom = (status) => {
    const counts = {};
    requests.forEach(req => {
      if (req.status === status) {
        counts[req.classroom] = (counts[req.classroom] || 0) + 1;
      }
    });
    return counts;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-gray-300 text-xl">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== 'TEACHER') {
    return <Navigate to="/unauthorized" />;
  }

  if (dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-gray-300 text-xl">Loading student requests...</div>
      </div>
    );
  }

  const statusCounts = getRequestCountsByStatus();
  const classroomCounts = getRequestCountsByClassroom(activeTab);
  const filteredRequests = getFilteredRequests();

  return (
    <div className="min-h-screen bg-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Student Join Requests</h1>

        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Classrooms Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Your Classrooms</h2>

              <button
                onClick={() => setSelectedClassroom(null)}
                className={`w-full text-left px-4 py-3 rounded-lg mb-2 transition-colors ${selectedClassroom === null
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">All Classrooms</span>
                  {classroomCounts && Object.keys(classroomCounts).length > 0 && (
                    <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {Object.values(classroomCounts).reduce((a, b) => a + b, 0)}
                    </span>
                  )}
                </div>
              </button>

              <div className="space-y-2">
                {classrooms.map(classroom => (
                  <button
                    key={classroom.id}
                    onClick={() => setSelectedClassroom(classroom.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${selectedClassroom === classroom.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{classroom.name}</div>
                        <div className="text-sm opacity-75">{classroom.subject_code}</div>
                      </div>
                      {classroomCounts[classroom.id] > 0 && (
                        <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          {classroomCounts[classroom.id]}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Requests Section with Tabs */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 rounded-lg shadow-lg overflow-hidden">
              {/* Tabs Header */}
              <div className="flex border-b border-gray-700">
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`flex-1 px-6 py-4 font-medium transition-colors ${activeTab === 'pending'
                      ? 'bg-gray-700 text-white border-b-2 border-blue-500'
                      : 'text-gray-400 hover:text-gray-300 hover:bg-gray-750'
                    }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span>Pending</span>
                    {statusCounts.pending > 0 && (
                      <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {statusCounts.pending}
                      </span>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('approved')}
                  className={`flex-1 px-6 py-4 font-medium transition-colors ${activeTab === 'approved'
                      ? 'bg-gray-700 text-white border-b-2 border-green-500'
                      : 'text-gray-400 hover:text-gray-300 hover:bg-gray-750'
                    }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <UserCheck className="w-5 h-5" />
                    <span>Approved</span>
                    {statusCounts.approved > 0 && (
                      <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {statusCounts.approved}
                      </span>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('rejected')}
                  className={`flex-1 px-6 py-4 font-medium transition-colors ${activeTab === 'rejected'
                      ? 'bg-gray-700 text-white border-b-2 border-red-500'
                      : 'text-gray-400 hover:text-gray-300 hover:bg-gray-750'
                    }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <UserX className="w-5 h-5" />
                    <span>Rejected</span>
                    {statusCounts.rejected > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {statusCounts.rejected}
                      </span>
                    )}
                  </div>
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">
                    {selectedClassroom
                      ? classrooms.find(c => c.id === selectedClassroom)?.name + ' - '
                      : ''
                    }
                    {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Requests
                  </h2>
                  <div className="flex items-center text-gray-400">
                    <Users className="w-5 h-5 mr-2" />
                    <span>{filteredRequests.length} {activeTab}</span>
                  </div>
                </div>

                {filteredRequests.length === 0 ? (
                  <div className="text-center py-12">
                    {activeTab === 'pending' && <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />}
                    {activeTab === 'approved' && <UserCheck className="w-16 h-16 text-gray-600 mx-auto mb-4" />}
                    {activeTab === 'rejected' && <UserX className="w-16 h-16 text-gray-600 mx-auto mb-4" />}
                    <p className="text-gray-400 text-lg">No {activeTab} requests</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredRequests.map(request => (
                      <div
                        key={request.id}
                        className="bg-gray-700 rounded-lg p-4 hover:bg-gray-650 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white mb-1">
                              {request.student_name}
                            </h3>
                            <p className="text-gray-400 text-sm mb-2">
                              Classroom: {request.classroom_name}
                            </p>
                            <div className="flex gap-4 text-gray-500 text-xs">
                              <p>
                                Requested: {new Date(request.requested_at).toLocaleDateString()} at{' '}
                                {new Date(request.requested_at).toLocaleTimeString()}
                              </p>
                              {request.reviewed_at && (
                                <p>
                                  Reviewed: {new Date(request.reviewed_at).toLocaleDateString()} at{' '}
                                  {new Date(request.reviewed_at).toLocaleTimeString()}
                                </p>
                              )}
                            </div>
                          </div>

                          {activeTab === 'pending' && (
                            <div className="flex gap-2 ml-4">
                              <button
                                onClick={() => handleRequestAction(request.id, 'approved')}
                                disabled={processingRequest === request.id}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <CheckCircle className="w-4 h-4" />
                                {processingRequest === request.id ? 'Processing...' : 'Approve'}
                              </button>
                              <button
                                onClick={() => handleRequestAction(request.id, 'rejected')}
                                disabled={processingRequest === request.id}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <XCircle className="w-4 h-4" />
                                {processingRequest === request.id ? 'Processing...' : 'Reject'}
                              </button>
                            </div>
                          )}

                          {activeTab === 'approved' && (
                            <div className="flex items-center gap-2 text-green-400">
                              <CheckCircle className="w-5 h-5" />
                              <span className="font-medium">Approved</span>
                            </div>
                          )}

                          {activeTab === 'rejected' && (
                            <div className="flex items-center gap-2 text-red-400">
                              <XCircle className="w-5 h-5" />
                              <span className="font-medium">Rejected</span>
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
        </div>
      </div>
    </div>
  );
};

export default StudentRequest;