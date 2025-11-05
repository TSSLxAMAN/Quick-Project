import { useEffect, useState } from 'react';
import { useAuth } from '../../utils/AuthContext';
import axios from 'axios';
import { Pencil, Trash2, Plus } from 'lucide-react'; // Import icons

const API_URL = 'http://127.0.0.1:8000/api/users/courses/';

const Course = () => {
  const { isAuthenticated, loading: authLoading } = useAuth(); // Destructure authentication state
  const [courses, setCourses] = useState([]);
  const [courseData, setCourseData] = useState({ course_name: '', year: '', sem: '' });
  const [editingCourse, setEditingCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ✅ Automatically include Bearer token from localStorage
  const headers = {
    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    'Content-Type': 'application/json',
  };

  // ✅ Fetch courses from backend
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL, { headers });
      setCourses(res.data);
    } catch (err) {
      console.error('Error fetching courses:', err);
      // Optional: Handle error for unauthenticated access if API returns 401
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch courses only after authentication is confirmed
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchCourses();
    }
  }, [isAuthenticated, authLoading]);

  // ✅ Handle input changes
  const handleChange = (e) => {
    setCourseData({ ...courseData, [e.target.name]: e.target.value });
  };

  // ✅ Add / Update course
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (editingCourse) {
        await axios.put(`${API_URL}${editingCourse.id}/`, courseData, { headers });
      } else {
        await axios.post(API_URL, courseData, { headers });
      }
      setCourseData({ course_name: '', year: '', sem: '' });
      setEditingCourse(null);
      fetchCourses();
    } catch (err) {
      console.error(err);
      setError('Failed to save course. Check your network or admin permissions.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Edit course
  const handleEdit = (course) => {
    setEditingCourse(course);
    setCourseData({
      course_name: course.course_name,
      year: course.year,
      sem: course.sem,
    });
  };

  // ✅ Delete course
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await axios.delete(`${API_URL}${id}/`, { headers });
      fetchCourses();
    } catch (err) {
      console.error(err);
      setError('Failed to delete course.');
    }
  };

  // --- Authentication and Loading Checks ---
  if (authLoading) {
    return <p className="text-gray-400 text-center mt-10">Loading authentication...</p>;
  }

  if (!isAuthenticated) {
    return (
      <p className="text-gray-400 text-center mt-10">
        Please login as admin to manage courses.
      </p>
    );
  }
  // ------------------------------------------

  return (
    <div className="space-y-6 py-6">
      {/* Header Section (Similar to College.jsx) */}
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-2xl blur opacity-30"></div>
        <div className="relative bg-gradient-to-r from-indigo-600 to-pink-600 text-white rounded-2xl shadow-2xl p-6">
          <h2 className="text-3xl font-bold mb-2">Manage Courses</h2>
          <p className="text-indigo-100">Add, edit, or delete academic courses.</p>
        </div>
      </div>

      {/* Add/Edit Form (Similar to College.jsx) */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-xl blur opacity-20"></div>
        <form
          onSubmit={handleSubmit}
          className="relative bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-700"
        >
          <h3 className="text-xl font-semibold text-gray-100 mb-4">
            {editingCourse ? 'Edit Course' : 'Add New Course'}
          </h3>
          {error && <p className="text-red-400 mb-4">{error}</p>}
          <div className="grid md:grid-cols-3 gap-4">
            <input
              type="text"
              name="course_name"
              placeholder="Course Name"
              value={courseData.course_name}
              onChange={handleChange}
              required
              className="bg-gray-800 text-gray-200 p-2 rounded-lg border border-gray-700 focus:outline-none focus:border-indigo-500"
            />
            <input
              type="number"
              name="year"
              placeholder="Year"
              value={courseData.year}
              onChange={handleChange}
              required
              className="bg-gray-800 text-gray-200 p-2 rounded-lg border border-gray-700 focus:outline-none focus:border-indigo-500"
            />
            <input
              type="number"
              name="sem"
              placeholder="Semester"
              value={courseData.sem}
              onChange={handleChange}
              required
              className="bg-gray-800 text-gray-200 p-2 rounded-lg border border-gray-700 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex justify-end mt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-indigo-600 px-4 py-2 rounded-lg text-white font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              {loading
                ? 'Saving...'
                : editingCourse
                  ? 'Update'
                  : 'Add'}
            </button>
          </div>
        </form>
      </div>

      {/* Course List (Card-based, similar to College.jsx) */}
      <div className="grid gap-4">
        <h3 className="text-xl font-semibold text-gray-100">All Courses</h3>
        {loading && courses.length === 0 ? (
          <p className="text-gray-400 text-center">Loading courses...</p>
        ) : courses.length === 0 ? (
          <p className="text-gray-400 text-center">No courses found.</p>
        ) : (
          courses.map((course) => (
            <div
              key={course.id}
              className="relative group bg-gray-900 rounded-xl shadow-lg p-5 border border-gray-700 hover:border-indigo-500 transition-all"
            >
              <h3 className="text-lg font-semibold text-gray-100">{course.course_name}</h3>
              <p className="text-gray-400">
                Year: {course.year} Semester: {course.sem}
              </p>
              <div className="flex gap-3 mt-3">
                <button
                  onClick={() => handleEdit(course)}
                  className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition"
                >
                  <Pencil size={18} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(course.id)}
                  className="flex items-center gap-1 text-pink-400 hover:text-pink-300 transition"
                >
                  <Trash2 size={18} /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Course;