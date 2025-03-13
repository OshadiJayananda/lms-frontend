import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import BorrowedBooks from "./User/BorrowedBooks";
import BookRequests from "./Admin/BookRequests";
import AdminAuthMiddleware from "./middleware/AdminAuthMiddleware";
import UserAuthMiddleware from "./middleware/UserAuthMiddleware";
// import useBackButtonHandler from "./hooks/useBackButtonHandler";

function App() {
  return (
    <Router>
      <div>
        <ToastContainer />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signIn" element={<SignIn />} />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminAuthMiddleware>
                <AdminDashboard />
              </AdminAuthMiddleware>
            }
          />
          <Route
            path="/admin/books"
            element={
              <AdminAuthMiddleware>
                <AdminBooks />
              </AdminAuthMiddleware>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <AdminAuthMiddleware>
                <Categories />
              </AdminAuthMiddleware>
            }
          />
          <Route
            path="/bookRequests"
            element={
              <AdminAuthMiddleware>
                <BookRequests />
              </AdminAuthMiddleware>
            }
          />

          {/* User Routes */}
          <Route
            path="/dashboard"
            element={
              <UserAuthMiddleware>
                <Dashboard />
              </UserAuthMiddleware>
            }
          />
          <Route
            path="/books"
            element={
              <UserAuthMiddleware>
                <Books />
              </UserAuthMiddleware>
            }
          />
          <Route
            path="/borrowedBook"
            element={
              <UserAuthMiddleware>
                <BorrowedBooks />
              </UserAuthMiddleware>
            }
          />
          <Route
            path="/profile"
            element={
              <UserAuthMiddleware>
                <Profile />
              </UserAuthMiddleware>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
