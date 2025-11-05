import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext.jsx'; // Import useAuth

const Dashboard = () => {
    const { user, loading } = useAuth(); 
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && user) {
            const role = user.role;
            console.log(role)
            switch (role) {
                case 'ADMIN':
                    navigate('/dashboard/adminDashboard', { replace: true });
                    break;
                case 'TEACHER':
                    navigate('/dashboard/teacherDashboard', { replace: true });
                    break;
                case 'STUDENT':
                    navigate('/dashboard/studentDashboard', { replace: true });
                    break;
                case 'USER':
                default:
                    navigate('/dashboard/userDashboard', { replace: true });
                    break;
            }
        }
    }, [loading, user, navigate]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-xl text-gray-300">Loading dashboard...</div>
            </div>
        );
    }

    return <div className="p-4">Redirecting...</div>;
};

export default Dashboard;