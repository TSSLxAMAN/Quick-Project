import { useState, useEffect } from "react";
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext.jsx';
import api from '../../services/api.js';

const UserDashboard = () => {
  const [formData, setFormData] = useState({});
  const { user, loading } = useAuth();
  const [role, setRole] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loader, setLoading] = useState(false);
  const navigate = useNavigate();

  // Verification status state
  const [verificationStatus, setVerificationStatus] = useState({
    student: null,
    teacher: null,
    checking: true
  });

  // Data from backend
  const [colleges, setColleges] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [availableYears, setAvailableYears] = useState([]);
  const [availableSemesters, setAvailableSemesters] = useState([]);

  // Check verification status on mount
  useEffect(() => {
    const checkVerificationStatus = async () => {
      try {
        const [studentCheck, teacherCheck] = await Promise.all([
          api.get('/student/verifyCheck/').catch(() => ({ data: { status: 'NOT_FOUND', found: false } })),
          api.get('/teacher/verifyCheck/').catch(() => ({ data: { status: 'NOT_FOUND', found: false } }))
        ]);

        setVerificationStatus({
          student: studentCheck.data,
          teacher: teacherCheck.data,
          checking: false
        });

        if (verificationStatus.student.status != 'NOT_FOUND' && verificationStatus.student.found == true) {
          navigate()
        }
      } catch (error) {
        console.error('Failed to check verification status:', error);
        setVerificationStatus({ student: null, teacher: null, checking: false });
      }
    };

    if (user) {
      checkVerificationStatus();
    }
  }, [user]);

  // Fetch colleges and courses on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [collegesRes, coursesRes] = await Promise.all([
          api.get('/users/colleges/'),
          api.get('/users/courses/')
        ]);
        setColleges(collegesRes.data);
        setCourses(coursesRes.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setMessage({ type: 'error', text: 'Failed to load colleges and courses' });
      }
    };
    fetchData();
  }, []);

  // Set user email when loaded
  useEffect(() => {
    if (!loading && user) {
      setFormData(prev => ({ email: user.email, ...prev }));
    }
  }, [user, loading]);

  // Handle course selection
  const handleCourseChange = (e) => {
    const courseId = e.target.value;
    const course = courses.find(c => c.id === parseInt(courseId));

    if (course) {
      setSelectedCourse(course);
      const years = Array.from({ length: course.year }, (_, i) => i + 1);
      setAvailableYears(years);
      const semesters = Array.from({ length: course.sem }, (_, i) => i + 1);
      setAvailableSemesters(semesters);

      setFormData(prev => ({
        ...prev,
        course_name: courseId,
        course: course.course_name,
        year: '',
        semester: ''
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await api.post('/student/verify/', formData);
      setMessage({
        type: 'success',
        text: 'Student verification request submitted successfully! Please wait for admin approval.'
      });

      // Refresh verification status
      const studentCheck = await api.get('/student/verifyCheck/');
      setVerificationStatus(prev => ({
        ...prev,
        student: studentCheck.data
      }));

      setFormData({ email: user.email });
      setRole(null);
      setSelectedCourse(null);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Submission failed. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await api.post('/teacher/verify/', formData);
      setMessage({
        type: 'success',
        text: 'Teacher verification request submitted successfully! Please wait for admin approval.'
      });

      // Refresh verification status
      const teacherCheck = await api.get('/teacher/verifyCheck/');
      setVerificationStatus(prev => ({
        ...prev,
        teacher: teacherCheck.data
      }));

      setFormData({ email: user.email });
      setRole(null);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Submission failed. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReapply = async (type) => {
    setLoading(true);
    try {
      const endpoint = type === 'student'
        ? '/student/reapply/'
        : '/teacher/reapply/';

      await api.post(endpoint);

      // Refresh status
      if (type === 'student') {
        const studentCheck = await api.get('/student/verifyCheck/');
        setVerificationStatus(prev => ({
          ...prev,
          student: studentCheck.data
        }));
      } else {
        const teacherCheck = await api.get('/teacher/verifyCheck/');
        setVerificationStatus(prev => ({
          ...prev,
          teacher: teacherCheck.data
        }));
      }

      setMessage({ type: 'success', text: 'You can now reapply!' });
      setRole(type);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to reset application' });
    } finally {
      setLoading(false);
    }
  };

  if (loading || verificationStatus.checking) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-300 text-xl">Loading...</div>
    </div>;
  }

  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'USER') {
    if (user.role === 'ADMIN') return <Navigate to="/dashboard/adminDashboard" />;
    if (user.role === 'TEACHER') return <Navigate to="/dashboard/teacherDashboard" />;
    if (user.role === 'STUDENT') return <Navigate to="/dashboard/studentDashboard" />;
  }

  // Check if any application is pending
  const studentPending = verificationStatus.student?.status === 'PENDING';
  const teacherPending = verificationStatus.teacher?.status === 'PENDING';
  const studentRejected = verificationStatus.student?.status === 'REJECTED';
  const teacherRejected = verificationStatus.teacher?.status === 'REJECTED';
  const bothNotFound = verificationStatus.student?.status === 'NOT_FOUND' &&
    verificationStatus.teacher?.status === 'NOT_FOUND';

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-2xl blur opacity-20"></div>

        <div className="relative bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-800">
          {/* Header */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-pink-500 blur opacity-30"></div>
            <div className="relative bg-gradient-to-r from-indigo-600 to-pink-600 px-6 py-8 text-white text-center">
              <h1 className="text-3xl font-bold">Verify Your Identity</h1>
              <p className="text-indigo-100 mt-2">
                Welcome {user.username}! Complete your profile verification
              </p>
            </div>
          </div>

          {/* Status Display - Show if any application exists */}
          {(studentPending || teacherPending || studentRejected || teacherRejected) && (
            <div className="p-6">
              {/* Student Status */}
              {verificationStatus.student?.found && (
                <div className={`mb-4 p-6 rounded-lg border-2 ${studentPending
                  ? 'bg-yellow-900/30 border-yellow-500'
                  : 'bg-red-900/30 border-red-500'
                  }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={`text-xl font-semibold ${studentPending ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                        Student Verification {studentPending ? 'Pending' : 'Rejected'}
                      </h3>
                      <p className={`mt-2 ${studentPending ? 'text-yellow-200' : 'text-red-200'
                        }`}>
                        {studentPending
                          ? '⏳ Your student verification request is under review by the administrator.'
                          : '❌ Your student verification request was rejected.'}
                      </p>
                    </div>
                    {studentRejected && (
                      <button
                        onClick={() => handleReapply('student')}
                        disabled={loader}
                        className="ml-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 px-6 py-2 rounded-lg font-medium text-white transition-all"
                      >
                        Reapply
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Teacher Status */}
              {verificationStatus.teacher?.found && (
                <div className={`mb-4 p-6 rounded-lg border-2 ${teacherPending
                  ? 'bg-yellow-900/30 border-yellow-500'
                  : 'bg-red-900/30 border-red-500'
                  }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={`text-xl font-semibold ${teacherPending ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                        Teacher Verification {teacherPending ? 'Pending' : 'Rejected'}
                      </h3>
                      <p className={`mt-2 ${teacherPending ? 'text-yellow-200' : 'text-red-200'
                        }`}>
                        {teacherPending
                          ? '⏳ Your teacher verification request is under review by the administrator.'
                          : '❌ Your teacher verification request was rejected.'}
                      </p>
                    </div>
                    {teacherRejected && (
                      <button
                        onClick={() => handleReapply('teacher')}
                        disabled={loader}
                        className="ml-4 bg-pink-600 hover:bg-pink-500 disabled:bg-gray-700 px-6 py-2 rounded-lg font-medium text-white transition-all"
                      >
                        Reapply
                      </button>
                    )}
                  </div>
                </div>
              )}

              {(studentPending || teacherPending) && (
                <div className="text-center mt-6">
                  <p className="text-gray-400 text-sm">
                    You will be notified once your application is reviewed. Please check back later.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Show forms only if both are not found OR if rejected (after clicking reapply) */}
          {(bothNotFound || (role && (studentRejected || teacherRejected))) && (
            <>
              {/* Message Display */}
              {message.text && (
                <div className={`mx-6 mt-6 p-4 rounded-lg ${message.type === 'success'
                  ? 'bg-green-900/50 border border-green-600 text-green-200'
                  : 'bg-red-900/50 border border-red-600 text-red-200'
                  }`}>
                  {message.text}
                </div>
              )}

              {/* Role Selection */}
              <div className="p-6 space-y-6">
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => {
                      setRole("student");
                      setFormData({ email: user.email });
                      setMessage({ type: '', text: '' });
                      setSelectedCourse(null);
                    }}
                    disabled={studentPending}
                    className={`px-6 py-3 rounded-lg font-medium transition-all shadow-md text-white ${studentPending
                      ? 'bg-gray-700 cursor-not-allowed opacity-50'
                      : role === "student"
                        ? "bg-indigo-600 hover:bg-indigo-500 ring-2 ring-indigo-400"
                        : "bg-gray-800 hover:bg-gray-700 border border-gray-700"
                      }`}
                  >
                    Verify as Student
                  </button>
                  <button
                    onClick={() => {
                      setRole("teacher");
                      setFormData({ email: user.email });
                      setMessage({ type: '', text: '' });
                    }}
                    disabled={teacherPending}
                    className={`px-6 py-3 rounded-lg font-medium transition-all shadow-md text-white ${teacherPending
                      ? 'bg-gray-700 cursor-not-allowed opacity-50'
                      : role === "teacher"
                        ? "bg-pink-600 hover:bg-pink-500 ring-2 ring-pink-400"
                        : "bg-gray-800 hover:bg-gray-700 border border-gray-700"
                      }`}
                  >
                    Verify as Teacher
                  </button>
                </div>

                {/* Forms */}
                <div className="border-t border-gray-700 pt-6">
                  {role === "student" && !studentPending && (
                    <form onSubmit={handleStudentSubmit} className="space-y-6">
                      <h2 className="text-2xl font-semibold text-gray-100 text-center mb-6">
                        Student Verification Form
                      </h2>

                      {/* Personal Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-indigo-400">Personal Information</h3>
                        <div className="grid md:grid-cols-3 gap-4">
                          <input
                            type="text"
                            name="first_name"
                            placeholder="First Name *"
                            required
                            value={formData.first_name || ''}
                            onChange={handleInputChange}
                            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-100 placeholder-gray-500"
                          />
                          <input
                            type="text"
                            name="middle_name"
                            placeholder="Middle Name"
                            value={formData.middle_name || ''}
                            onChange={handleInputChange}
                            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-100 placeholder-gray-500"
                          />
                          <input
                            type="text"
                            name="last_name"
                            placeholder="Last Name *"
                            required
                            value={formData.last_name || ''}
                            onChange={handleInputChange}
                            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-100 placeholder-gray-500"
                          />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <input
                            type="email"
                            name="email"
                            placeholder="Email Address *"
                            required
                            value={formData.email || ''}
                            readOnly
                            className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-500 cursor-not-allowed"
                          />
                          <input
                            type="tel"
                            name="phone_no"
                            placeholder="Phone Number *"
                            required
                            value={formData.phone_no || ''}
                            onChange={handleInputChange}
                            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-100 placeholder-gray-500"
                          />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <select
                            name="gender"
                            required
                            value={formData.gender || ''}
                            onChange={handleInputChange}
                            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-100"
                          >
                            <option value="">Select Gender *</option>
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                          </select>
                          <input
                            type="date"
                            name="date_of_birth"
                            required
                            value={formData.date_of_birth || ''}
                            onChange={handleInputChange}
                            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-100"
                          />
                        </div>
                      </div>

                      {/* Academic Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-indigo-400">Academic Information</h3>

                        <select
                          name="university"
                          required
                          value={formData.university || ''}
                          onChange={handleInputChange}
                          className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-100"
                        >
                          <option value="">Select College/University *</option>
                          {colleges.map(college => (
                            <option key={college.id} value={college.name}>
                              {college.name}
                            </option>
                          ))}
                        </select>

                        <input
                          type="text"
                          name="enroll_no"
                          placeholder="Enrollment Number *"
                          required
                          value={formData.enroll_no || ''}
                          onChange={handleInputChange}
                          className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-100 placeholder-gray-500"
                        />

                        <select
                          name="course"
                          required
                          value={formData.course_name || ''}
                          onChange={handleCourseChange}
                          className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-100"
                        >
                          <option value="">Select Course *</option>
                          {courses.map(course => (
                            <option key={course.id} value={course.id}>
                              {course.course_name}
                            </option>
                          ))}
                        </select>

                        {selectedCourse && (
                          <div className="grid md:grid-cols-2 gap-4">
                            <select
                              name="year"
                              required
                              value={formData.year || ''}
                              onChange={handleInputChange}
                              className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-100"
                            >
                              <option value="">Select Year *</option>
                              {availableYears.map(year => (
                                <option key={year} value={year}>
                                  Year {year}
                                </option>
                              ))}
                            </select>

                            <select
                              name="semester"
                              required
                              value={formData.semester || ''}
                              onChange={handleInputChange}
                              className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-100"
                            >
                              <option value="">Select Semester *</option>
                              {availableSemesters.map(sem => (
                                <option key={sem} value={sem}>
                                  Semester {sem}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={loader}
                        className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:cursor-not-allowed py-3 rounded-lg font-medium text-white transition-all shadow-lg shadow-indigo-500/20"
                      >
                        {loader ? 'Submitting...' : 'Submit for Verification'}
                      </button>
                    </form>
                  )}

                  {role === "teacher" && !teacherPending && (
                    <form onSubmit={handleTeacherSubmit} className="space-y-6">
                      <h2 className="text-2xl font-semibold text-gray-100 text-center mb-6">
                        Teacher Verification Form
                      </h2>

                      {/* Personal Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-pink-400">Personal Information</h3>
                        <div className="grid md:grid-cols-3 gap-4">
                          <input
                            type="text"
                            name="first_name"
                            placeholder="First Name *"
                            required
                            value={formData.first_name || ''}
                            onChange={handleInputChange}
                            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-100 placeholder-gray-500"
                          />
                          <input
                            type="text"
                            name="middle_name"
                            placeholder="Middle Name"
                            value={formData.middle_name || ''}
                            onChange={handleInputChange}
                            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-100 placeholder-gray-500"
                          />
                          <input
                            type="text"
                            name="last_name"
                            placeholder="Last Name *"
                            required
                            value={formData.last_name || ''}
                            onChange={handleInputChange}
                            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-100 placeholder-gray-500"
                          />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <input
                            type="email"
                            name="email"
                            placeholder="Email Address *"
                            required
                            value={formData.email || ''}
                            readOnly
                            className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-500 cursor-not-allowed"
                          />
                          <input
                            type="tel"
                            name="phone_no"
                            placeholder="Phone Number *"
                            required
                            value={formData.phone_no || ''}
                            onChange={handleInputChange}
                            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-100 placeholder-gray-500"
                          />
                        </div>

                        <select
                          name="gender"
                          required
                          value={formData.gender || ''}
                          onChange={handleInputChange}
                          className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-100"
                        >
                          <option value="">Select Gender *</option>
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                        </select>
                      </div>

                      {/* Professional Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-pink-400">Professional Information</h3>
                        <select
                          name="university"
                          required
                          value={formData.university || ''}
                          onChange={handleInputChange}
                          className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-100"
                        >
                          <option value="">Select College/University *</option>
                          {colleges.map(college => (
                            <option key={college.id} value={college.name}>
                              {college.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="submit"
                        disabled={loader}
                        className="w-full mt-6 bg-pink-600 hover:bg-pink-500 disabled:bg-gray-700 disabled:cursor-not-allowed py-3 rounded-lg font-medium text-white transition-all shadow-lg shadow-pink-500/20"
                      >
                        {loader ? 'Submitting...' : 'Submit for Verification'}
                      </button>
                    </form>
                  )}

                  {!role && (
                    <div className="text-center py-8">
                      <p className="text-gray-400 text-lg">
                        Please select your role above to proceed with verification.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;