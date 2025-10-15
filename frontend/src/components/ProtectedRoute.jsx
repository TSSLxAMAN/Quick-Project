import { Navigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext.jsx';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                Loading...
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Check if user has required role
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

export default ProtectedRoute;