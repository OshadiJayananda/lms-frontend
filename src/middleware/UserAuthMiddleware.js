import React from "react";
import { Navigate } from "react-router-dom";

function UserAuthMiddleware({ children }) {
  const isAuthenticated = localStorage.getItem("token"); // Check if user exists
  const userRole = localStorage.getItem("role"); // Get the role from localStorage

  return isAuthenticated && userRole === "user" ? (
    children
  ) : (
    <Navigate to="/login" />
  );
}

export default UserAuthMiddleware;
