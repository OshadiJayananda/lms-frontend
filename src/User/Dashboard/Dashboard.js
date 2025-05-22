import React, { useState, useEffect, useCallback } from "react";
import HeaderBanner from "../../Components/HeaderBanner";
import ClientSidebar from "../../Components/ClientSidebar";
import {
  FaBell,
  FaBookOpen,
  FaClock,
  FaExchangeAlt,
  FaCheckCircle,
  FaCheck,
  FaArrowRight,
  FaSearch,
  FaBook,
  FaChartBar,
  FaTimes,
  FaInfoCircle,
} from "react-icons/fa";
import api from "../../Components/Api";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
  CartesianGrid,
} from "recharts";
import { motion } from "framer-motion";

const QUOTES = [
  {
    text: "A reader lives a thousand lives before he dies.",
    author: "George R.R. Martin",
  },
  {
    text: "So many books, so little time.",
    author: "Frank Zappa",
  },
  {
    text: "Until I feared I would lose it, I never loved to read. One does not love breathing.",
    author: "Harper Lee",
  },
  {
    text: "Reading is essential for those who seek to rise above the ordinary.",
    author: "Jim Rohn",
  },
  {
    text: "Books are a uniquely portable magic.",
    author: "Stephen King",
  },
  {
    text: "Once you learn to read, you will be forever free.",
    author: "Frederick Douglass",
  },
  {
    text: "There is no friend as loyal as a book.",
    author: "Ernest Hemingway",
  },
  {
    text: "The only thing that you absolutely have to know, is the location of the library.",
    author: "Albert Einstein",
  },
  {
    text: "I do believe something very magical can happen when you read a good book.",
    author: "J.K. Rowling",
  },
  {
    text: "That's the thing about books. They let you travel without moving your feet.",
    author: "Jhumpa Lahiri",
  },
];

function Dashboard() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [stats, setStats] = useState({
    borrowed: 0,
    returned: 0,
    overdue: 0,
    active_borrowed: 0,
    borrowLimit: 5,
    borrowDuration: "2 weeks",
    finePerDay: 50,
    latestBooks: [],
    monthlyStats: [],
  });
  const [borrowingPolicy, setBorrowingPolicy] = useState({
    borrow_limit: 0,
    borrow_duration_days: 0,
    fine_per_day: 0,
  });
  const [quote, setQuote] = useState(QUOTES[0]);
  const [isNewUser, setIsNewUser] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const navigate = useNavigate();

  const heading_pic = process.env.PUBLIC_URL + "/images/heading_pic.jpg";
  const COLORS = ["#4F46E5", "#10B981", "#F59E0B"];
  const FONT_FAMILY =
    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await api.get("/user/notifications");
      setNotifications(response.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      if (error.response?.status === 401) navigate("/login");
    }
  }, [navigate]);

  const fetchBorrowingPolicy = async () => {
    setLoading(true);
    try {
      const res = await api.get("/borrowing-policies");
      setBorrowingPolicy(res.data);
    } catch (err) {
      toast.error("Failed to fetch borrowing policies");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get("/user/dashboard-stats");
      setStats(res.data);

      const isNew =
        res.data.borrowed === 0 &&
        res.data.returned === 0 &&
        res.data.overdue === 0;
      setIsNewUser(isNew);

      // Show welcome modal only if it's a new user and we haven't shown it before
      if (isNew && !localStorage.getItem("welcomeModalShown")) {
        setShowWelcomeModal(true);
        localStorage.setItem("welcomeModalShown", "true");
      }
    } catch (err) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    const randomIndex = Math.floor(Math.random() * QUOTES.length);
    setQuote(QUOTES[randomIndex]);
  }, []);

  useEffect(() => {
    fetchNotifications();
    fetchBorrowingPolicy();
    fetchStats();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleToggle = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleNotificationClick = (notification) => {
    if (notification.type === "renewal_date_changed") {
      setSelectedNotification(notification);
      setShowConfirmationModal(true);
    } else if (notification.type === "reservation_approved") {
      setSelectedNotification(notification);
      setShowConfirmationModal(true);
    }
    markNotificationAsRead(notification.id);
  };

  const handleRenewalResponse = async (confirm) => {
    if (!selectedNotification?.id) {
      toast.error("Notification information is missing");
      return;
    }

    try {
      setProcessing(true);
      const response = await api.post(
        `/notifications/${selectedNotification.id}/renewal-response`,
        { confirm }
      );

      toast.success(
        response.data.message ||
          (confirm
            ? "Renewal request approved successfully"
            : "Renewal request declined")
      );

      await fetchNotifications();
      setShowConfirmationModal(false);
    } catch (error) {
      console.error("Renewal response error:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to process your response. Please try again later.";
      toast.error(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await api.post(`/notifications/${notificationId}/read`);
      fetchNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post("/notifications/read-all");
      fetchNotifications();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const handleReservationResponse = async (confirm) => {
    if (!selectedNotification?.reservation_id) {
      toast.error("Reservation information is missing");
      return;
    }

    try {
      setProcessing(true);
      const response = await api.post(
        `/book-reservations/${selectedNotification.reservation_id}/response`,
        { confirm }
      );

      toast.success(response.data.message);

      await fetchNotifications();
      setShowConfirmationModal(false);
    } catch (error) {
      console.error("Reservation response error:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to process your response. Please try again later.";
      toast.error(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const pieData = [
    { name: "Total Borrowed", value: stats.borrowed, icon: <FaBookOpen /> },
    { name: "Total Returned", value: stats.returned, icon: <FaCheckCircle /> },
    { name: "Overdue", value: stats.overdue, icon: <FaClock /> },
  ];

  const filteredPieData = pieData.filter((entry) => entry.value > 0);

  return (
    <div
      className="min-h-screen bg-gray-50 flex"
      style={{ fontFamily: FONT_FAMILY }}
    >
      <ClientSidebar isCollapsed={isSidebarCollapsed} onToggle={handleToggle} />
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        <HeaderBanner
          book="Dashboard"
          heading_pic={heading_pic}
          className="w-full"
        />

        <div className="p-6">
          {/* Notification Bell */}
          <div className="relative float-right mb-6">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-3 bg-white rounded-full shadow-sm hover:shadow-md transition-all relative"
              aria-label="Notifications"
            >
              <FaBell size={20} className="text-indigo-600" />
              {notifications.filter((n) => !n.is_read).length > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {notifications.filter((n) => !n.is_read).length}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-10 border border-gray-100">
                <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-indigo-50 rounded-t-lg">
                  <h3 className="font-semibold text-indigo-700">
                    Notifications
                  </h3>
                  {notifications.filter((n) => !n.is_read).length > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 border-b border-gray-100 hover:bg-indigo-50 cursor-pointer transition-colors ${
                          !notification.is_read ? "bg-blue-50" : ""
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start">
                          <div
                            className={`p-2 rounded-full mr-3 ${
                              notification.type === "renewal_date_changed"
                                ? "bg-purple-100 text-purple-600"
                                : notification.type === "reservation_approved"
                                ? "bg-green-100 text-green-600"
                                : "bg-blue-100 text-blue-600"
                            }`}
                          >
                            {notification.type === "reservation_approved" ? (
                              <FaCheck size={14} />
                            ) : (
                              <FaExchangeAlt size={14} />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              {new Date(
                                notification.created_at
                              ).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No new notifications
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {isNewUser
                ? "Welcome to Your Library Journey!"
                : "Welcome Back to Your Library"}
            </h2>
            <p className="text-gray-600">
              {isNewUser
                ? "Get started by exploring our collection and borrowing your first book"
                : "Track your reading journey and discover new books"}
            </p>

            {isNewUser && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-4"
              >
                <div className="flex items-start">
                  <FaInfoCircle className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-blue-800 mb-2">
                      Quick Start Guide
                    </h3>
                    <button
                      onClick={() => setShowWelcomeModal(true)}
                      className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
                    >
                      View detailed guide
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Quote Card */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white mb-8 shadow-lg hover:shadow-xl transition-shadow">
            <blockquote className="text-lg italic mb-2">
              "{quote.text}"
            </blockquote>
            <p className="text-sm opacity-80">– {quote.author}</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
              <div className="flex items-center">
                <div className="p-3 bg-indigo-100 rounded-full mr-4 text-indigo-600 group-hover:bg-indigo-200 transition-colors">
                  <FaBookOpen size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Borrowed Books</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {stats.borrowed}
                  </p>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {stats.borrowed === 0
                  ? "You haven’t borrowed any books yet"
                  : `Total books borrowed so far`}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
              <div className="flex items-center">
                <div className="p-3 bg-indigo-100 rounded-full mr-4 text-indigo-600 group-hover:bg-indigo-200 transition-colors">
                  <FaBookOpen size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Active Borrowed Books</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {stats.active_borrowed}
                  </p>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {stats.active_borrowed === 0
                  ? "No books currently borrowed"
                  : `You can borrow ${Math.max(
                      0,
                      borrowingPolicy.borrow_limit - stats.active_borrowed
                    )} more`}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
              <div className="flex items-center">
                <div className="p-3 bg-emerald-100 rounded-full mr-4 text-emerald-600 group-hover:bg-emerald-200 transition-colors">
                  <FaCheckCircle size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Books Returned</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {stats.returned}
                  </p>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {stats.returned === 0
                  ? "No books returned yet"
                  : `Great job returning books on time!`}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
              <div className="flex items-center">
                <div className="p-3 bg-amber-100 rounded-full mr-4 text-amber-600 group-hover:bg-amber-200 transition-colors">
                  <FaClock size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Books Overdue</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {stats.overdue}
                  </p>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {stats.overdue === 0
                  ? "All books returned on time"
                  : `Please return overdue books to avoid fines`}
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="flex flex-col lg:flex-row gap-6 mb-8">
            {/* Pie Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 w-full lg:w-1/2 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Your Reading Activity
              </h3>
              <div className="h-64 flex items-center justify-center">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <span className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
                  </div>
                ) : filteredPieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={filteredPieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={50}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        labelLine={false}
                      >
                        {filteredPieData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${value} books`, "Count"]}
                        contentStyle={{
                          borderRadius: "8px",
                          border: "none",
                          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center p-4">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                      <FaBook className="text-gray-400 text-xl" />
                    </div>
                    <h4 className="font-medium text-gray-700 mb-1">
                      No Reading Activity Yet
                    </h4>
                    <p className="text-sm text-gray-500 mb-3">
                      {isNewUser
                        ? "Borrow your first book to see your reading activity"
                        : "Your reading history will appear here"}
                    </p>
                    <Link
                      to="/books"
                      className="inline-flex items-center text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    >
                      Browse books <FaSearch className="ml-1" />
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Bar Chart - Monthly Activity */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 w-full lg:w-1/2 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Monthly Reading
              </h3>
              <div className="h-64 flex items-center justify-center">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <span className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full" />
                  </div>
                ) : stats.monthlyStats &&
                  stats.monthlyStats.length > 0 &&
                  !(
                    stats.monthlyStats.length === 1 &&
                    stats.monthlyStats[0].borrowed === 0 &&
                    stats.monthlyStats[0].returned === 0
                  ) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stats.monthlyStats}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="month"
                        tick={{ fill: "#6b7280" }}
                        axisLine={{ stroke: "#d1d5db" }}
                      />
                      <YAxis
                        tick={{ fill: "#6b7280" }}
                        axisLine={{ stroke: "#d1d5db" }}
                        tickCount={5}
                        domain={[0, "dataMax + 1"]}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "8px",
                          border: "none",
                          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                          background: "#ffffff",
                        }}
                        formatter={(value, name) => {
                          const label = value === 1 ? "book" : "books";
                          const action =
                            name === "Borrowed" ? "Borrowed" : "Returned";
                          return [`${value} ${label}`, action];
                        }}
                      />
                      <Legend wrapperStyle={{ paddingTop: "20px" }} />
                      <Bar
                        dataKey="borrowed"
                        fill="#4F46E5"
                        name="Borrowed"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="returned"
                        fill="#10B981"
                        name="Returned"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center p-4">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                      <FaChartBar className="text-gray-400 text-xl" />
                    </div>
                    <h4 className="font-medium text-gray-700 mb-1">
                      No Monthly Data
                    </h4>
                    <p className="text-sm text-gray-500 mb-3">
                      {isNewUser
                        ? "Your monthly reading stats will appear after you borrow books"
                        : "No reading activity recorded for recent months"}
                    </p>
                    {isNewUser && (
                      <Link
                        to="/books"
                        className="inline-flex items-center text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      >
                        Start reading <FaBookOpen className="ml-1" />
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Policy Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Borrowing Policy
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-indigo-50 p-4 rounded-lg hover:bg-indigo-100 transition-colors">
                <p className="text-sm text-indigo-600 font-medium">
                  Borrow Limit
                </p>
                <p className="text-2xl font-bold text-indigo-800">
                  {borrowingPolicy.borrow_limit} books
                </p>
                <p className="text-xs text-indigo-500 mt-1">
                  Maximum at one time
                </p>
              </div>
              <div className="bg-emerald-50 p-4 rounded-lg hover:bg-emerald-100 transition-colors">
                <p className="text-sm text-emerald-600 font-medium">
                  Borrow Duration
                </p>
                <p className="text-2xl font-bold text-emerald-800">
                  {borrowingPolicy.borrow_duration_days} days
                </p>
                <p className="text-xs text-emerald-500 mt-1">Per book</p>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg hover:bg-amber-100 transition-colors">
                <p className="text-sm text-amber-600 font-medium">
                  Fine per Day
                </p>
                <p className="text-2xl font-bold text-amber-800">
                  Rs.{borrowingPolicy.fine_per_day}
                </p>
                <p className="text-xs text-amber-500 mt-1">For overdue books</p>
              </div>
            </div>
            {isNewUser && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600">
                  As a new member, you can borrow up to{" "}
                  {borrowingPolicy.borrow_limit} books at a time. Each book can
                  be kept for {borrowingPolicy.borrow_duration_days} days.
                </p>
              </div>
            )}
          </div>

          {/* Latest Books */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {isNewUser
                  ? "Popular Books to Get You Started"
                  : "Recently Added Books"}
              </h3>
              <Link
                to="/books"
                className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline flex items-center"
              >
                View all books <FaArrowRight className="ml-1" />
              </Link>
            </div>
            {stats.latestBooks.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {stats.latestBooks.map((book, index) => (
                  <Link
                    to={`/books/${book.id}`}
                    key={index}
                    className="group cursor-pointer transition-all hover:-translate-y-1"
                  >
                    <div className="relative pb-[150%] rounded-lg overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                      <img
                        src={book.image || "/default-book-cover.png"}
                        alt={book.name}
                        className="absolute h-full w-full object-cover"
                        onError={(e) => {
                          e.target.src = "/default-book-cover.png";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                        <p className="text-white text-sm font-medium truncate w-full">
                          {book.name}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <FaBook className="text-gray-400 text-xl" />
                </div>
                <h4 className="font-medium text-gray-700 mb-1">
                  No Books Available
                </h4>
                <p className="text-sm text-gray-500 mb-3">
                  We're currently updating our collection
                </p>
                <Link
                  to="/books"
                  className="inline-flex items-center text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  Check back later <FaArrowRight className="ml-1" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Welcome Modal for New Users */}
        {showWelcomeModal && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Welcome to Our Library!
                  </h2>
                  <button
                    onClick={() => setShowWelcomeModal(false)}
                    className="text-gray-500 hover:text-gray-700 text-xl"
                    aria-label="Close welcome modal"
                  >
                    <FaTimes />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-800 mb-3 text-lg">
                      Getting Started Guide
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                          1
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">
                            Browse Our Collection
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Explore thousands of books in our digital library.
                            Use the search feature to find specific titles or
                            browse by categories.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                          2
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">
                            Borrowing Books
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Click "Borrow" on any available book. You can borrow
                            up to {borrowingPolicy.borrow_limit} books at a time
                            for {borrowingPolicy.borrow_duration_days} days
                            each.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                          3
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">
                            Reading Your Books
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Access your borrowed books from "My Books" section.
                            Some books may be available for online reading while
                            others are physical copies.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                          4
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">
                            Returning Books
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Return books on time to avoid fines. You can renew
                            books if no one else has reserved them.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
                    <h3 className="font-semibold text-indigo-800 mb-3 text-lg">
                      Quick Tips
                    </h3>
                    <ul className="space-y-2 list-disc list-inside text-sm text-gray-700">
                      <li>
                        Check your dashboard regularly for updates on your
                        borrowed books
                      </li>
                      <li>Set up notifications to remind you of due dates</li>
                      <li>
                        Explore our recommendations based on your reading
                        history
                      </li>
                      <li>
                        Create reading lists to organize books you want to read
                      </li>
                    </ul>
                  </div>

                  <div className="flex justify-center mt-6">
                    <Link
                      to="/books"
                      className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center"
                      onClick={() => setShowWelcomeModal(false)}
                    >
                      Start Exploring Books <FaArrowRight className="ml-2" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Renewal Confirmation Modal */}
        {showConfirmationModal && selectedNotification && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-xl w-96 max-w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  {selectedNotification.type === "reservation_approved"
                    ? "Reservation Approved"
                    : "Renewal Request"}
                </h2>
                <button
                  onClick={() => setShowConfirmationModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                  aria-label="Close modal"
                >
                  &times;
                </button>
              </div>
              <div className="mb-6">
                <p className="text-gray-600 mb-4">
                  {selectedNotification.message}
                </p>
                <p className="font-medium text-gray-800">
                  {selectedNotification.type === "reservation_approved"
                    ? "Do you still want to borrow this book?"
                    : "Do you accept this new renewal date?"}
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    if (selectedNotification.type === "reservation_approved") {
                      handleReservationResponse(false);
                    } else {
                      handleRenewalResponse(false);
                    }
                  }}
                  className={`px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors ${
                    processing ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={processing}
                >
                  {processing
                    ? "Processing..."
                    : selectedNotification.type === "reservation_approved"
                    ? "No, Cancel"
                    : "Decline"}
                </button>
                <button
                  onClick={() => {
                    if (selectedNotification.type === "reservation_approved") {
                      handleReservationResponse(true);
                    } else {
                      handleRenewalResponse(true);
                    }
                  }}
                  className={`px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors ${
                    processing ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={processing}
                >
                  {processing
                    ? "Processing..."
                    : selectedNotification.type === "reservation_approved"
                    ? "Yes, Confirm"
                    : "Accept"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
