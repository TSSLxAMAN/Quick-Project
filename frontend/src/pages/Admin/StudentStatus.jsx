import { useState, useEffect } from 'react';
import { useAuth } from '../../utils/AuthContext';
import { Navigate } from 'react-router-dom';
import api from '../../services/api';

const StudentStatus = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('pending');
  // Pending students state
  const [pendingStudents, setPendingStudents] = useState([]);
  const [filteredPending, setFilteredPending] = useState([]);

  // Verified students state
  const [verifiedStudents, setVerifiedStudents] = useState([]);
  const [filteredVerified, setFilteredVerified] = useState([]);

  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch both pending and verified students on mount
  useEffect(() => {
    fetchStudents();
  }, []);

  // Filter students when search query or tab changes
  useEffect(() => {
    const students = activeTab === 'pending' ? pendingStudents : verifiedStudents;

    if (searchQuery.trim() === '') {
      if (activeTab === 'pending') {
        setFilteredPending(students);
      } else {
        setFilteredVerified(students);
      }
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = students.filter(student =>
        student.first_name.toLowerCase().includes(query) ||
        student.last_name.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query) ||
        student.enroll_no.toLowerCase().includes(query) ||
        student.university.toLowerCase().includes(query)
      );

      if (activeTab === 'pending') {
        setFilteredPending(filtered);
      } else {
        setFilteredVerified(filtered);
      }
    }
  }, [searchQuery, activeTab, pendingStudents, verifiedStudents]);

  const fetchStudents = async () => {
    try {
      setDataLoading(true);
      const [pendingRes, verifiedRes] = await Promise.all([
        api.get('/student/studentStatus/'),
        api.get('/student/studentStatusVerified/')
      ]);

      setPendingStudents(pendingRes.data);
      setFilteredPending(pendingRes.data);

      setVerifiedStudents(verifiedRes.data);
      setFilteredVerified(verifiedRes.data);

      setError('');
    } catch (err) {
      setError('Failed to load student data');
      console.error('Error fetching students:', err);
    } finally {
      setDataLoading(false);
    }
  };

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const handleApprove = async (student) => {
    if (!window.confirm(`Are you sure you want to APPROVE ${student.first_name} ${student.last_name}?`)) {
      return;
    }

    setActionLoading(true);
    try {
      await api.post('/student/studentApprove/', {
        email: student.email,
      });

      setMessage({
        type: 'success',
        text: `${student.first_name} ${student.last_name} approved successfully!`
      });

      fetchStudents();
      setShowModal(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.error || 'Failed to approve student'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (student) => {
    if (!window.confirm(`Are you sure you want to REJECT ${student.first_name} ${student.last_name}?`)) {
      return;
    }

    setActionLoading(true);
    try {
      await api.post('/student/studentReject/', {
        email: student.email,
      });

      setMessage({
        type: 'success',
        text: `${student.first_name} ${student.last_name} rejected successfully!`
      });

      fetchStudents();
      setShowModal(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.error || 'Failed to reject student'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleBlock = async (student) => {
    if (!window.confirm(`Are you sure you want to BLOCK ${student.first_name} ${student.last_name}? This will revoke their access.`)) {
      return;
    }

    setActionLoading(true);
    try {
      await api.post('/student/studentBlock/', {
        email: student.email,
      });

      setMessage({
        type: 'success',
        text: `${student.first_name} ${student.last_name} blocked successfully!`
      });

      fetchStudents();
      setShowModal(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.error || 'Failed to block student'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
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
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-300 text-xl">Loading...</div>
    </div>;
  }

  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/unauthorized" />;
  }

  const currentStudents = activeTab === 'pending' ? filteredPending : filteredVerified;
  const currentCount = activeTab === 'pending' ? pendingStudents.length : verifiedStudents.length;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-100 mb-2">
            Student Management
          </h1>
          <p className="text-gray-400">
            Review and manage student registrations
          </p>
        </div>

        {/* Message Display */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'success'
            ? 'bg-green-900/30 border border-green-500/50 text-green-300'
            : 'bg-red-900/30 border border-red-500/50 text-red-300'
            }`}>
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 flex space-x-2 border-b border-gray-700">
          <button
            onClick={() => {
              setActiveTab('pending');
              setSearchQuery('');
            }}
            className={`px-6 py-3 font-semibold transition-all ${activeTab === 'pending'
              ? 'text-indigo-400 border-b-2 border-indigo-400'
              : 'text-gray-500 hover:text-gray-300'
              }`}
          >
            Pending Requests ({pendingStudents.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('verified');
              setSearchQuery('');
            }}
            className={`px-6 py-3 font-semibold transition-all ${activeTab === 'verified'
              ? 'text-green-400 border-b-2 border-green-400'
              : 'text-gray-500 hover:text-gray-300'
              }`}
          >
            Verified Students ({verifiedStudents.length})
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name, email, enrollment number, or university..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-gray-900 w-full px-4 py-3 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
            <div className={`text-3xl mb-2 ${activeTab === 'pending' ? 'text-yellow-400' : 'text-green-400'}`}>
              {activeTab === 'pending' ? '⏳' : '✓'}
            </div>
            <h3 className="text-gray-400 text-sm">
              {activeTab === 'pending' ? 'Pending Requests' : 'Verified Students'}
            </h3>
            <p className="text-3xl font-bold text-gray-100">{currentCount}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
            <div className="text-indigo-400 text-3xl mb-2">🔍</div>
            <h3 className="text-gray-400 text-sm">Filtered Results</h3>
            <p className="text-3xl font-bold text-gray-100">{currentStudents.length}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
            <div className="text-blue-400 text-3xl mb-2">📊</div>
            <h3 className="text-gray-400 text-sm">Total Students</h3>
            <p className="text-3xl font-bold text-gray-100">{pendingStudents.length + verifiedStudents.length}</p>
          </div>
        </div>

        {/* Students Table */}
        {dataLoading ? (
          <div className="bg-gray-800 rounded-xl p-12 text-center border border-gray-700">
            <div className="text-gray-400 text-lg">Loading students...</div>
          </div>
        ) : error ? (
          <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        ) : currentStudents.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-12 text-center border border-gray-700">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              {searchQuery ? 'No matches found' : `No ${activeTab} students`}
            </h3>
            <p className="text-gray-500">
              {searchQuery
                ? 'No students match your search criteria.'
                : activeTab === 'pending'
                  ? 'All verification requests have been processed.'
                  : 'No verified students yet.'}
            </p>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Student Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Academic Info
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      {activeTab === 'pending' ? 'Requested' : 'Approved'}
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {currentStudents.map((student) => (
                    <tr key={student.email} className="hover:bg-gray-750 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-100">
                            {student.first_name} {student.middle_name || ''} {student.last_name}
                          </div>
                          <div className="text-sm text-gray-400">
                            {student.enroll_no}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-300">
                          <div className="font-medium">{student.university}</div>
                          <div className="text-gray-500">
                            {student.course} - Year {student.year}, Sem {student.semester}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-300">
                          <div>{student.email}</div>
                          <div className="text-gray-500">{student.phone_no}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-400">
                          {activeTab === 'pending'
                            ? formatDate(student.requested_at)
                            : formatDate(student.approved_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleViewDetails(student)}
                          className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition-all"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Details Modal */}
        {showModal && selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
              {/* Modal Header */}
              <div className={`bg-gradient-to-r ${activeTab === 'pending'
                ? 'from-yellow-600 to-orange-600'
                : 'from-green-600 to-emerald-600'
                } px-6 py-4 flex justify-between items-center`}>
                <h2 className="text-2xl font-bold text-white">
                  {activeTab === 'pending' ? 'Pending' : 'Verified'} Student Details
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white hover:text-gray-300 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold text-indigo-400 mb-3">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-500">Full Name</label>
                      <p className="text-gray-100">
                        {selectedStudent.first_name} {selectedStudent.middle_name || ''} {selectedStudent.last_name}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Enrollment Number</label>
                      <p className="text-gray-100">{selectedStudent.enroll_no}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Email</label>
                      <p className="text-gray-100">{selectedStudent.email}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Phone</label>
                      <p className="text-gray-100">{selectedStudent.phone_no}</p>
                    </div>
                  </div>
                </div>

                {/* Academic Information */}
                <div className="border-t border-gray-700 pt-4">
                  <h3 className="text-lg font-semibold text-indigo-400 mb-3">Academic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-500">University</label>
                      <p className="text-gray-100">{selectedStudent.university}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Course</label>
                      <p className="text-gray-100">{selectedStudent.course}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Year</label>
                      <p className="text-gray-100">Year {selectedStudent.year}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Semester</label>
                      <p className="text-gray-100">Semester {selectedStudent.semester}</p>
                    </div>
                  </div>
                </div>

                {/* Status Information */}
                <div className="border-t border-gray-700 pt-4">
                  <h3 className="text-lg font-semibold text-indigo-400 mb-3">Status Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-500">Status</label>
                      <p className={`font-semibold ${selectedStudent.status === 'PENDING' ? 'text-yellow-400' : 'text-green-400'
                        }`}>
                        {selectedStudent.status}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">
                        {activeTab === 'pending' ? 'Requested At' : 'Approved At'}
                      </label>
                      <p className="text-gray-100">
                        {formatDate(activeTab === 'pending' ? selectedStudent.requested_at : selectedStudent.approved_at)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="border-t border-gray-700 pt-6 flex gap-4">
                  {activeTab === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleApprove(selectedStudent)}
                        disabled={actionLoading}
                        className="flex-1 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-all"
                      >
                        {actionLoading ? 'Processing...' : '✓ Approve'}
                      </button>
                      <button
                        onClick={() => handleReject(selectedStudent)}
                        disabled={actionLoading}
                        className="flex-1 bg-red-600 hover:bg-red-500 disabled:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-all"
                      >
                        {actionLoading ? 'Processing...' : '✗ Reject'}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleBlock(selectedStudent)}
                      disabled={actionLoading}
                      className="flex-1 bg-red-600 hover:bg-red-500 disabled:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-all"
                    >
                      {actionLoading ? 'Processing...' : '🚫 Block Student'}
                    </button>
                  )}
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-6 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-all"
                  >
                    Cancel
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

export default StudentStatus;