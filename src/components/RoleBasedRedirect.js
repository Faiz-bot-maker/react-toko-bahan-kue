import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleBasedRedirect = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <div className="text-center mt-20">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const userRole = user.role?.toLowerCase();

    // Redirect berdasarkan role
    if (userRole === 'admin' || userRole === 'super_admin') {
        return <Navigate to="/admin/dashboard" replace />;
    } else {
        return <Navigate to="/dashboard" replace />;
    }
};

export default RoleBasedRedirect;
