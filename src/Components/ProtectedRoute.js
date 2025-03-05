// import React from "react";
// import { Navigate, Outlet } from "react-router-dom";

// const ProtectedRoute = ({ role, redirectPath = "/login" }) => {
//   const token = localStorage.getItem("token");
//   const userRole = localStorage.getItem("role"); // Assuming you store the role in localStorage

//   if (!token) {
//     return <Navigate to={redirectPath} replace />;
//   }

//   if (role && userRole !== role) {
//     return <Navigate to="/unauthorized" replace />;
//   }

//   return <Outlet />;
// };

// export default ProtectedRoute;
