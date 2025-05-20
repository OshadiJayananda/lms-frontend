import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Home from "./Components/Home";
import Login from "./Components/Login";
import SignIn from "./Components/SignIn";
import Dashboard from "./User/Dashboard/Dashboard";
import Categories from "./Admin/Categories/Categories";
import AdminDashboard from "./Admin/Dashboard/AdminDashboard";
import AdminBooks from "./Admin/Books/AdminBooks";
import Books from "./User/Books/Books";
import Profile from "./User/Profile/Profile";
import BorrowedBooks from "./User/Books/BorrowedBooks";
import BookRequests from "./Admin/Books/BookRequests";
import AdminAuthMiddleware from "./middleware/AdminAuthMiddleware";
import UserAuthMiddleware from "./middleware/UserAuthMiddleware";
import ReturnedBooks from "./Admin/Books/ReturnedBooks";
import BorrowedHistory from "./Admin/Books/BorrowedHistory";
import RenewBook from "./Admin/Books/RenewBook";
import BookReservation from "./Admin/Books/BookReservation";
import AuthRedirectMiddleware from "./middleware/AuthRedirectMiddleware";
import Payments from "./User/Payments/Payments";
import ForgotPassword from "./Components/ForgotPassword";
import ResetPassword from "./Components/ResetPassword";
import AdminProfile from "./Admin/Profile/AdminProfile";
import Authors from "./Admin/Books/Authors";
import MemberDetails from "./Admin/Members/MemberDetails";
import PaymentSuccess from "./User/Payments/PaymentSuccess";
import PaymentCancel from "./User/Payments/PaymentCancel";
import AdminPayments from "./Admin/Payment/AdminPayments";
// import useBackButtonHandler from "./hooks/useBackButtonHandler";

function App() {
  return (
    <Router>
      <div>
        <ToastContainer />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/login"
            element={
              <AuthRedirectMiddleware>
                <Login />
              </AuthRedirectMiddleware>
            }
          />
          <Route
            path="/register"
            element={
              <AuthRedirectMiddleware>
                <SignIn />
              </AuthRedirectMiddleware>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <AuthRedirectMiddleware>
                <ForgotPassword />
              </AuthRedirectMiddleware>
            }
          />
          <Route
            path="/reset-password"
            element={
              <AuthRedirectMiddleware>
                <ResetPassword />
              </AuthRedirectMiddleware>
            }
          />
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
            path="/admin/authors"
            element={
              <AdminAuthMiddleware>
                <Authors />
              </AdminAuthMiddleware>
            }
          />
          <Route
            path="/admin/members"
            element={
              <AdminAuthMiddleware>
                <MemberDetails />
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
          <Route
            path="/returnedBooks"
            element={
              <AdminAuthMiddleware>
                <ReturnedBooks />
              </AdminAuthMiddleware>
            }
          />
          {/* //renewBooks */}
          <Route
            path="/renewBooks"
            element={
              <AdminAuthMiddleware>
                <RenewBook />
              </AdminAuthMiddleware>
            }
          />
          {/* bookReservation */}
          <Route
            path="/bookReservation"
            element={
              <AdminAuthMiddleware>
                <BookReservation />
              </AdminAuthMiddleware>
            }
          />
          <Route
            path="/admin/borrowed-history"
            element={
              <AdminAuthMiddleware>
                <BorrowedHistory />
              </AdminAuthMiddleware>
            }
          />
          <Route
            path="/admin/profile"
            element={
              <AdminAuthMiddleware>
                <AdminProfile />
              </AdminAuthMiddleware>
            }
          />
          <Route
            path="/admin/payments"
            element={
              <AdminAuthMiddleware>
                <AdminPayments />
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
          <Route
            path="/payments"
            element={
              <UserAuthMiddleware>
                <Payments />
              </UserAuthMiddleware>
            }
          />

          <Route
            path="/payment-success"
            element={
              <UserAuthMiddleware>
                <PaymentSuccess />
              </UserAuthMiddleware>
            }
          />
          <Route
            path="/payment-cancel"
            element={
              <UserAuthMiddleware>
                <PaymentCancel />
              </UserAuthMiddleware>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
