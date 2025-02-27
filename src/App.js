import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import Home from "./Components/Home";
import Login from "./Components/Login";
import SignIn from "./Components/SignIn";
import Dashboard from "./User/Dashboard";
import Categories from "./Admin/Categories";
import AdminDashboard from "./Admin/AdminDashboard";
import AdminBooks from "./Admin/Books/AdminBooks";
import Books from "./User/Books";
import Profile from "./User/Profile";
import ProtectedRoute from "./Components/ProtectedRoute"; // ✅ Import only, no re-declaration!

function App() {
  return (
    <Router>
      <div>
        <ToastContainer />
        <Routes>
          {/* Prevent access to login, sign in, or home if logged in */}
          <Route path="/" element={<GuestOnly element={<Home />} />} />
          <Route path="/login" element={<GuestOnly element={<Login />} />} />
          <Route path="/signIn" element={<GuestOnly element={<SignIn />} />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={<ProtectedRoute element={<Dashboard />} />}
          />
          <Route
            path="/admin/dashboard"
            element={<ProtectedRoute element={<AdminDashboard />} />}
          />
          <Route
            path="/admin/books"
            element={<ProtectedRoute element={<AdminBooks />} />}
          />
          <Route
            path="/books"
            element={<ProtectedRoute element={<Books />} />}
          />
          <Route
            path="/admin/categories"
            element={<ProtectedRoute element={<Categories />} />}
          />
          <Route
            path="/profile"
            element={<ProtectedRoute element={<Profile />} />}
          />

          {/* Catch all - Redirect to dashboard if logged in, else home */}
          <Route path="*" element={<RedirectToDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

// 🔹 GuestOnly: Prevents access to login, sign in, or home if logged in
const GuestOnly = ({ element }) => {
  const isAuthenticated = localStorage.getItem("token");
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : element;
};

// 🔹 RedirectToDashboard: Ensures logged-in users go to dashboard, others go home
const RedirectToDashboard = () => {
  const isAuthenticated = localStorage.getItem("token");
  return isAuthenticated ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Navigate to="/" replace />
  );
};

export default App;
