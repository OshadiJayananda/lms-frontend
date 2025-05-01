import React from "react";
import { Navigate } from "react-router-dom";
import { cleanupInvalidToken, isTokenValid } from "../utils/authUtils";

const AuthRedirectMiddleware = ({ children }) => {
  const token = localStorage.getItem("token");
  const isAuthenticated = token && isTokenValid(token);

  if (!isAuthenticated) {
    cleanupInvalidToken();
    return children;
  }

  const userRole = localStorage.getItem("role");

  if (userRole === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/dashboard" replace />;
};

export default AuthRedirectMiddleware;
