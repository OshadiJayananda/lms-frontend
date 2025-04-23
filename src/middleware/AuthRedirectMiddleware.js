import React from "react";
import { Navigate } from "react-router-dom";

const AuthRedirectMiddleware = ({ children }) => {
  const isAuthenticated = localStorage.getItem("token");

  if (isAuthenticated) {
    const userRole = localStorage.getItem("role");

    if (userRole === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }
  return children;
};

export default AuthRedirectMiddleware;
