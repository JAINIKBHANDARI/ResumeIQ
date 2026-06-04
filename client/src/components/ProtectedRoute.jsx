import { Navigate } from "react-router-dom";
import AppLoader from "./AppLoader";
import { useAuth } from "../context/useAuth";

function ProtectedRoute({ children }) {
    const { loading, isAuthenticated } = useAuth();

    if (loading) {
        return <AppLoader message="Checking your session..." />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtectedRoute;
