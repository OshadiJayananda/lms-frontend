import {
  BrowserRouter as Router,
  Routes,
  Route,
  // Navigate,
  // useNavigate,
} from "react-router-dom";
// import { useEffect } from "react";
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

function App() {
  return (
    <Router>
      <div>
        <ToastContainer />
        <Routes>
          {/* Prevent access to login, sign in, or home if logged in */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signIn" element={<SignIn />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/books" element={<AdminBooks />} />
          <Route path="/books" element={<Books />} />
          <Route path="/admin/categories" element={<Categories />} />
          <Route path="/profile" element={<Profile />} />

          {/* Catch all - Redirect to dashboard if logged in, else home */}
          {/* <Route path="*" element={<RedirectToDashboard />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
