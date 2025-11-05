import { useEffect, useState } from 'react';
import axios from 'axios';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { useAuth } from '../../utils/AuthContext'; // <-- use your AuthContext

const College = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  console.log(user)
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingCollege, setEditingCollege] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    point_of_contact: '',
  });

  // ✅ Automatically include Bearer token from localStorage (authService stores it)
  const headers = {
    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    'Content-Type': 'application/json',
  };

  // ✅ Fetch colleges from backend
  const fetchColleges = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://127.0.0.1:8000/api/users/colleges/', { headers });
      setColleges(res.data);
    } catch (error) {
      console.error('Error fetching colleges:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchColleges();
    }
  }, [isAuthenticated, authLoading]);

  // ✅ Form Input Handling
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Add or Update college
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCollege) {
        await axios.put(
          `http://127.0.0.1:8000/api/users/colleges/${editingCollege.id}/`,
          formData,
          { headers }
        );
      } else {
        await axios.post('http://127.0.0.1:8000/api/users/colleges/', formData, { headers });
      }
      setFormData({ name: '', address: '', point_of_contact: '' });
      setEditingCollege(null);
      fetchColleges();
    } catch (error) {
      console.error('Error saving college:', error);
    }
  };

  // ✅ Edit
  const handleEdit = (college) => {
    setEditingCollege(college);
    setFormData({
      name: college.name,
      address: college.address,
      point_of_contact: college.point_of_contact,
    });
  };

  // ✅ Delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this college?')) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/users/colleges/${id}/`, { headers });
      fetchColleges();
    } catch (error) {
      console.error('Error deleting college:', error);
    }
  };

  if (authLoading) {
    return <p className="text-gray-400 text-center mt-10">Loading authentication...</p>;
  }

  if (!isAuthenticated) {
    return <p className="text-gray-400 text-center mt-10">Please login as admin to manage colleges.</p>;
  }

  return (
    <div className="space-y-6 py-6">
      {/* Header Section */}
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-2xl blur opacity-30"></div>
        <div className="relative bg-gradient-to-r from-indigo-600 to-pink-600 text-white rounded-2xl shadow-2xl p-6">
          <h2 className="text-3xl font-bold mb-2">Manage Colleges</h2>
          <p className="text-indigo-100">Add, edit, or delete college information</p>
        </div>
      </div>

      {/* Add/Edit Form */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-xl blur opacity-20"></div>
        <form
          onSubmit={handleSubmit}
          className="relative bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-700"
        >
          <h3 className="text-xl font-semibold text-gray-100 mb-4">
            {editingCollege ? 'Edit College' : 'Add New College'}
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="College Name"
              className="bg-gray-800 text-gray-200 p-2 rounded-lg border border-gray-700 focus:outline-none focus:border-indigo-500"
              required
            />
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Address"
              className="bg-gray-800 text-gray-200 p-2 rounded-lg border border-gray-700 focus:outline-none focus:border-indigo-500"
              required
            />
            <input
              type="number"
              name="point_of_contact"
              value={formData.point_of_contact}
              onChange={handleChange}
              placeholder="Contact Number"
              className="bg-gray-800 text-gray-200 p-2 rounded-lg border border-gray-700 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>
          <div className="flex justify-end mt-4">
            <button
              type="submit"
              className="flex items-center gap-2 bg-indigo-800  px-4 py-2 rounded-lg text-white font-medium hover:from-indigo-500 hover:to-pink-500 transition"
            >
              <Plus className="w-4 h-4" />
              {editingCollege ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>

      {/* College List */}
      <div className="grid gap-4">
        {loading ? (
          <p className="text-gray-400 text-center">Loading colleges...</p>
        ) : colleges.length === 0 ? (
          <p className="text-gray-400 text-center">No colleges found.</p>
        ) : (
          colleges.map((college) => (
            <div
              key={college.id}
              className="relative group bg-gray-900 rounded-xl shadow-lg p-5 border border-gray-700 hover:border-indigo-500 transition-all"
            >
              <h3 className="text-lg font-semibold text-gray-100">{college.name}</h3>
              <p className="text-gray-400">{college.address}</p>
              <p className="text-gray-400">📞 {college.point_of_contact}</p>
              <div className="flex gap-3 mt-3">
                <button
                  onClick={() => handleEdit(college)}
                  className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition"
                >
                  <Pencil size={18} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(college.id)}
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

export default College;
