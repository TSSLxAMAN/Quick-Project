import { Link } from 'react-router-dom';
import Teacher from '../../assets/Teacher.png'
import Student from '../../assets/Student.png'
import University from '../../assets/University.png'
import Course from '../../assets/Course.png'

const AdminDashboard = () => {

    return (
        <div className="space-y-6 py-6">
            <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-2xl blur opacity-30"></div>
                <div className="relative bg-gradient-to-r from-indigo-600 to-pink-600 text-white rounded-2xl shadow-2xl p-6">
                    <h2 className="text-3xl font-bold mb-2">Admin Dashboard</h2>
                    <p className="text-indigo-100">Manage users and monitor system-wide plagiarism checks</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
                <Link to="/dashboard/adminDashboard/teachersStatus" className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition"></div>
                    <div className="relative bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-700 hover:border-indigo-500 transition-all">
                        <div className="text-indigo-400 text-4xl mb-3"> <img src={Teacher} alt="" /> </div>
                        <h3 className="text-xl font-semibold text-gray-100 mb-2">Teacher's Status</h3>
                        <p className="text-gray-400">Verify, Block, Confirm, Pending Teachers  requests</p>
                    </div>
                </Link>

                <Link to="/dashboard/adminDashboard/studentsStatus" className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition"></div>
                    <div className="relative bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-700 hover:border-indigo-500 transition-all">
                        <div className="text-indigo-400 text-4xl mb-3"><img src={Student} alt="" /></div>
                        <h3 className="text-xl font-semibold text-gray-100 mb-2">Student's Status</h3>
                        <p className="text-gray-400">Verify, Block, Confirm, Pending Students requests</p>
                    </div>
                </Link>
            </div>

            {/* Manage */}
            <div className="grid md:grid-cols-4 gap-6">
                <Link to="/dashboard/adminDashboard/colleges" className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition"></div>
                    <div className="relative bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-700 hover:border-indigo-500 transition-all">
                        <div className="text-indigo-400 text-4xl mb-3"> <img src={University} alt="" /> </div>
                        <h3 className="text-lg font-semibold text-gray-100 mb-2">Manage College</h3>
                       
                    </div>
                </Link>

                <Link to="/dashboard/adminDashboard/courses" className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition"></div>
                    <div className="relative bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-700 hover:border-indigo-500 transition-all">
                        <div className="text-indigo-400 text-4xl mb-3"><img src={Course} alt="" /></div>
                        <h3 className="text-lg font-semibold text-gray-100 mb-2">Manage Course</h3>
                    </div>
                </Link>
            </div>
        </div>
    )
};

export default AdminDashboard