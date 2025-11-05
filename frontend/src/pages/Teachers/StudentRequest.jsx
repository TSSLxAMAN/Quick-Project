import React from 'react'
import { useAuth } from '../../utils/AuthContext';

const StudentRequest = () => {
    const { user, loading } = useAuth();

    

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">
            <div className="text-gray-300 text-xl">Loading...</div>
        </div>;
    }

    if (!user || user.role !== 'TEACHER') {
        return <Navigate to="/unauthorized" />;
    }
  return (
    <div>StudentRequest</div>
  )
}

export default StudentRequest