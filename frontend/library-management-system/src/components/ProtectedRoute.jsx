import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, requireLibrarian = false }) => {
    const { isAuthenticated, isLibrarian, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (requireLibrarian && !isLibrarian) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
