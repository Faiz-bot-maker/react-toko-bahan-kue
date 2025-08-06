// src/components/LoginCheck.js
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginCheck = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    const token = localStorage.getItem("authToken");

    if (isLoading) {
        return <div className="text-center mt-20">Loading...</div>;
    }

    if (!isAuthenticated && !token) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default LoginCheck;
