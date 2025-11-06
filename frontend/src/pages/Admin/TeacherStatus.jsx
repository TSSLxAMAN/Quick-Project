import { useState, useEffect } from 'react';
import { useAuth } from '../../utils/AuthContext';
import { Navigate } from 'react-router-dom';
import api from '../../services/api';

const TeacherStatus = () => {
    const { user, loading } = useAuth();
    const [activeTab, setActiveTab] = useState('pending');

    // Pending teachers state
    const [pendingTeachers, setPendingTeachers] = useState([]);
    const [filteredPending, setFilteredPending] = useState([]);

    // Verified teachers state
    const [verifiedTeachers, setVerifiedTeachers] = useState([]);
    const [filteredVerified, setFilteredVerified] = useState([]);

    // Rejected teachers state
    const [rejectedTeachers, setRejectedTeachers] = useState([]);
    const [filteredRejected, setFilteredRejected] = useState([]);

    const [dataLoading, setDataLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Fetch all teachers on mount
    useEffect(() => {
        fetchTeachers();
    }, []);

    // Filter teachers when search query or tab changes
    useEffect(() => {
        let teachers = [];
        if (activeTab === 'pending') teachers = pendingTeachers;
        else if (activeTab === 'verified') teachers = verifiedTeachers;
        else teachers = rejectedTeachers;

        if (searchQuery.trim() === '') {
            if (activeTab === 'pending') setFilteredPending(teachers);
            else if (activeTab === 'verified') setFilteredVerified(teachers);
            else setFilteredRejected(teachers);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = teachers.filter(teacher =>
                teacher.first_name.toLowerCase().includes(query) ||
                teacher.last_name.toLowerCase().includes(query) ||
                teacher.email.toLowerCase().includes(query) ||
                teacher.university.toLowerCase().includes(query) ||
                (teacher.middle_name && teacher.middle_name.toLowerCase().includes(query))
            );

            if (activeTab === 'pending') setFilteredPending(filtered);
            else if (activeTab === 'verified') setFilteredVerified(filtered);
            else setFilteredRejected(filtered);
        }
    }, [searchQuery, activeTab, pendingTeachers, verifiedTeachers, rejectedTeachers]);

    const fetchTeachers = async () => {
        try {
            setDataLoading(true);
            const [pendingRes, verifiedRes] = await Promise.all([
                api.get('/teacher/teacherStatus/'),
                api.get('/teacher/teacherStatusVerified/')
            ]);

            setPendingTeachers(pendingRes.data);
            setFilteredPending(pendingRes.data);

            setVerifiedTeachers(verifiedRes.data);
            setFilteredVerified(verifiedRes.data);

            setError('');
        } catch (err) {
            setError('Failed to load student data');
            console.error('Error fetching students:', err);
        } finally {
            setDataLoading(false);
        }
    };

    const handleViewDetails = (teacher) => {
        setSelectedTeacher(teacher);
        setShowModal(true);
    };

    const handleApprove = async (teacher) => {
        if (!window.confirm(`Are you sure you want to APPROVE ${teacher.first_name} ${teacher.last_name}?`)) {
            return;
        }

        setActionLoading(true);
        try {
            await api.post('/teacher/teacherApprove/', {
                email: teacher.email,
            });

            setMessage({
                type: 'success',
                text: `${teacher.first_name} ${teacher.last_name} approved successfully!`
            });

            fetchTeachers();
            setShowModal(false);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            setMessage({
                type: 'error',
                text: err.response?.data?.error || 'Failed to approve teacher'
            });
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async (teacher) => {
        if (!window.confirm(`Are you sure you want to REJECT ${teacher.first_name} ${teacher.last_name}?`)) {
            return;
        }

        setActionLoading(true);
        try {
            await api.post('/teacher/teacherReject/', {
                email: teacher.email,
            });

            setMessage({
                type: 'success',
                text: `${teacher.first_name} ${teacher.last_name} rejected successfully!`
            });

            fetchTeachers();
            setShowModal(false);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            setMessage({
                type: 'error',
                text: err.response?.data?.error || 'Failed to reject teacher'
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

    const getCurrentTeachers = () => {
        if (activeTab === 'pending') return filteredPending;
        if (activeTab === 'verified') return filteredVerified;
        return filteredRejected;
    };

    const getCurrentCount = () => {
        if (activeTab === 'pending') return pendingTeachers.length;
        if (activeTab === 'verified') return verifiedTeachers.length;
        return rejectedTeachers.length;
    };

    const currentTeachers = getCurrentTeachers();
    const currentCount = getCurrentCount();

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-100 mb-2">
                        Teacher Management
                    </h1>
                    <p className="text-gray-400">
                        Review and manage teacher registrations
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
                        Pending Requests ({pendingTeachers.length})
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
                        Verified Teachers ({verifiedTeachers.length})
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('rejected');
                            setSearchQuery('');
                        }}
                        className={`px-6 py-3 font-semibold transition-all ${activeTab === 'rejected'
                            ? 'text-red-400 border-b-2 border-red-400'
                            : 'text-gray-500 hover:text-gray-300'
                            }`}
                    >
                        Rejected Teachers ({rejectedTeachers.length})
                    </button>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Search by name, email, or university..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-gray-900 w-full px-4 py-3 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
                        <div className={`text-3xl mb-2 ${activeTab === 'pending' ? 'text-yellow-400' :
                            activeTab === 'verified' ? 'text-green-400' : 'text-red-400'
                            }`}>
                            {activeTab === 'pending' ? '⏳' : activeTab === 'verified' ? '✓' : '✗'}
                        </div>
                        <h3 className="text-gray-400 text-sm">
                            {activeTab === 'pending' ? 'Pending Requests' :
                                activeTab === 'verified' ? 'Verified Teachers' : 'Rejected Teachers'}
                        </h3>
                        <p className="text-3xl font-bold text-gray-100">{currentCount}</p>
                    </div>
                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
                        <div className="text-indigo-400 text-3xl mb-2">🔍</div>
                        <h3 className="text-gray-400 text-sm">Filtered Results</h3>
                        <p className="text-3xl font-bold text-gray-100">{currentTeachers.length}</p>
                    </div>
                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
                        <div className="text-blue-400 text-3xl mb-2">📊</div>
                        <h3 className="text-gray-400 text-sm">Total Teachers</h3>
                        <p className="text-3xl font-bold text-gray-100">
                            {pendingTeachers.length + verifiedTeachers.length + rejectedTeachers.length}
                        </p>
                    </div>
                </div>

                {/* Teachers Table */}
                {dataLoading ? (
                    <div className="bg-gray-800 rounded-xl p-12 text-center border border-gray-700">
                        <div className="text-gray-400 text-lg">Loading teachers...</div>
                    </div>
                ) : error ? (
                    <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                ) : currentTeachers.length === 0 ? (
                    <div className="bg-gray-800 rounded-xl p-12 text-center border border-gray-700">
                        <div className="text-6xl mb-4">📭</div>
                        <h3 className="text-xl font-semibold text-gray-300 mb-2">
                            {searchQuery ? 'No matches found' : `No ${activeTab} teachers`}
                        </h3>
                        <p className="text-gray-500">
                            {searchQuery
                                ? 'No teachers match your search criteria.'
                                : activeTab === 'pending'
                                    ? 'All verification requests have been processed.'
                                    : activeTab === 'verified'
                                        ? 'No verified teachers yet.'
                                        : 'No rejected teachers.'}
                        </p>
                    </div>
                ) : (
                    <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-900">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Teacher Details
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            University
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Contact
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {currentTeachers.map((teacher) => (
                                        <tr key={teacher.email} className="hover:bg-gray-750 transition-colors">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-100">
                                                        {teacher.first_name} {teacher.middle_name || ''} {teacher.last_name}
                                                    </div>
                                                    <div className="text-sm text-gray-400">
                                                        {teacher.email}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-300">
                                                    {teacher.university}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-300">
                                                    {teacher.phone_no}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${teacher.status === 'PENDING'
                                                    ? 'bg-yellow-900/30 text-yellow-400'
                                                    : teacher.status === 'APPROVED' || teacher.verified
                                                        ? 'bg-green-900/30 text-green-400'
                                                        : 'bg-red-900/30 text-red-400'
                                                    }`}>
                                                    {teacher.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <button
                                                    onClick={() => handleViewDetails(teacher)}
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
                {showModal && selectedTeacher && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
                            {/* Modal Header */}
                            <div className={`bg-gradient-to-r ${activeTab === 'pending'
                                ? 'from-yellow-600 to-orange-600'
                                : activeTab === 'verified'
                                    ? 'from-green-600 to-emerald-600'
                                    : 'from-red-600 to-rose-600'
                                } px-6 py-4 flex justify-between items-center`}>
                                <h2 className="text-2xl font-bold text-white">
                                    {activeTab === 'pending' ? 'Pending' :
                                        activeTab === 'verified' ? 'Verified' : 'Rejected'} Teacher Details
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
                                                {selectedTeacher.first_name} {selectedTeacher.middle_name || ''} {selectedTeacher.last_name}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-500">Email</label>
                                            <p className="text-gray-100">{selectedTeacher.email}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-500">Phone</label>
                                            <p className="text-gray-100">{selectedTeacher.phone_no}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-500">University</label>
                                            <p className="text-gray-100">{selectedTeacher.university}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Status Information */}
                                <div className="border-t border-gray-700 pt-4">
                                    <h3 className="text-lg font-semibold text-indigo-400 mb-3">Status Information</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm text-gray-500">Status</label>
                                            <p className={`font-semibold ${selectedTeacher.status === 'PENDING'
                                                ? 'text-yellow-400'
                                                : selectedTeacher.status === 'APPROVED' || selectedTeacher.verified
                                                    ? 'text-green-400'
                                                    : 'text-red-400'
                                                }`}>
                                                {selectedTeacher.status}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-500">Verified</label>
                                            <p className="text-gray-100">
                                                {selectedTeacher.verified ? 'Yes' : 'No'}
                                            </p>
                                        </div>
                                        {selectedTeacher.requested_at && (
                                            <div>
                                                <label className="text-sm text-gray-500">Requested At</label>
                                                <p className="text-gray-100">
                                                    {formatDate(selectedTeacher.requested_at)}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="border-t border-gray-700 pt-6 flex gap-4">
                                    {activeTab === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => handleApprove(selectedTeacher)}
                                                disabled={actionLoading}
                                                className="flex-1 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-all"
                                            >
                                                {actionLoading ? 'Processing...' : '✓ Approve'}
                                            </button>
                                            <button
                                                onClick={() => handleReject(selectedTeacher)}
                                                disabled={actionLoading}
                                                className="flex-1 bg-red-600 hover:bg-red-500 disabled:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-all"
                                            >
                                                {actionLoading ? 'Processing...' : '✗ Reject'}
                                            </button>
                                        </>
                                    )}
                                    {activeTab === 'rejected' && (
                                        <button
                                            onClick={() => handleApprove(selectedTeacher)}
                                            disabled={actionLoading}
                                            className="flex-1 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-all"
                                        >
                                            {actionLoading ? 'Processing...' : '✓ Approve Teacher'}
                                        </button>
                                    )}
                                    {activeTab === 'verified' && (
                                        <button
                                            onClick={() => handleReject(selectedTeacher)}
                                            disabled={actionLoading}
                                            className="flex-1 bg-red-600 hover:bg-red-500 disabled:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-all"
                                        >
                                            {actionLoading ? 'Processing...' : '✗ Revoke Access'}
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

export default TeacherStatus;