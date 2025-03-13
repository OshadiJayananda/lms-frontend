import React from "react";
import { Navigate } from "react-router-dom";

function UserAuthMiddleware({ children }) {
  const isAuthenticated = localStorage.getItem("token"); // Check if user exists

  return isAuthenticated ? children : <Navigate to="/login" />;
}

export default UserAuthMiddleware;
