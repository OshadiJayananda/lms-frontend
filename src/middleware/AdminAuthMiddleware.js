import React from "react";
import { Navigate } from "react-router-dom";

function AdminAuthMiddleware({ children }) {
  const isAuthenticated = localStorage.getItem("admin_token"); // Check if admin exists

  return isAuthenticated ? children : <Navigate to="/login" />;
}

export default AdminAuthMiddleware;
