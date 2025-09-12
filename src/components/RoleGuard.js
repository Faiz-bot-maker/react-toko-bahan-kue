import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RoleGuard = ({ children, allowedRoles, fallbackPath }) => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <div className="text-center mt-20">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const userRole = user.role?.toLowerCase();
    const isAllowed = allowedRoles.some(role => role.toLowerCase() === userRole);

    if (!isAllowed) {
        // Redirect ke halaman default berdasarkan role
        if (fallbackPath) {
            return <Navigate to={fallbackPath} replace />;
        }
        
        // Default redirect berdasarkan role
        if (userRole === 'admin' || userRole === 'super_admin') {
            return <Navigate to="/admin/dashboard" replace />;
        } else {
            return <Navigate to="/dashboard" replace />;
        }
    }

    return children;
};

export default RoleGuard;
