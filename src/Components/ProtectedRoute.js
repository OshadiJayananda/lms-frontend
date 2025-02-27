import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ element }) => {
  const isAuthenticated = localStorage.getItem("token"); // Check if the user is logged in
  return isAuthenticated ? element : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
