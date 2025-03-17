import React from "react";
import { Navigate } from "react-router-dom";

function AdminAuthMiddleware({ children }) {
  const isAuthenticated = localStorage.getItem("admin_token"); // Check if admin exists
  const userRole = localStorage.getItem("role"); // Get the role from localStorage

  return isAuthenticated && userRole === "admin" ? (
    children
  ) : (
    <Navigate to="/login" />
  );
}

export default AdminAuthMiddleware;
