import React, { useState, useEffect, useCallback } from "react";
import HeaderBanner from "../../Components/HeaderBanner";
import ClientSidebar from "../../Components/ClientSidebar";
import {
  FaBell,
  FaBookOpen,
  FaClock,
  FaExchangeAlt,
  FaCheckCircle,
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
    text: "That’s the thing about books. They let you travel without moving your feet.",
    author: "Jhumpa Lahiri",
  },
];

function Dashboard() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [stats, setStats] = useState({
    borrowed: 0,
    returned: 0,
    overdue: 0,
    borrowLimit: 5,
    borrowDuration: "2 weeks",
    finePerDay: 50,
    latestBooks: [],
    monthlyStats: [],
  });
  const [quote, setQuote] = useState(QUOTES[0]);
  const navigate = useNavigate();

  const heading_pic = process.env.PUBLIC_URL + "/images/heading_pic.jpg";
  const COLORS = ["#4F46E5", "#10B981", "#F59E0B"]; // Purple, Emerald, Amber
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

  const fetchStats = async () => {
    try {
      const res = await api.get("/user/dashboard-stats");
      setStats(res.data);
    } catch (err) {
      toast.error("Failed to load dashboard data");
    }
  };

  useEffect(() => {
    // Load Inter font from Google Fonts
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

  const pieData = [
    { name: "Borrowed", value: stats.borrowed, icon: <FaBookOpen /> },
    { name: "Returned", value: stats.returned, icon: <FaCheckCircle /> },
    { name: "Overdue", value: stats.overdue, icon: <FaClock /> },
  ];

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
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline"
                  >
                    Mark all as read
                  </button>
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
                                : "bg-blue-100 text-blue-600"
                            }`}
                          >
                            <FaExchangeAlt size={14} />
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
              Welcome to Your Library
            </h2>
            <p className="text-gray-600">
              Track your reading journey and discover new books
            </p>
          </div>

          {/* Quote Card */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white mb-8 shadow-lg">
            <blockquote className="text-lg italic mb-2">
              "{quote.text}"
            </blockquote>
            <p className="text-sm opacity-80">– {quote.author}</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="p-3 bg-indigo-100 rounded-full mr-4 text-indigo-600">
                  <FaBookOpen size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Books Borrowed</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {stats.borrowed}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="p-3 bg-emerald-100 rounded-full mr-4 text-emerald-600">
                  <FaCheckCircle size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Books Returned</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {stats.returned}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="p-3 bg-amber-100 rounded-full mr-4 text-amber-600">
                  <FaClock size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Books Overdue</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {stats.overdue}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="flex flex-col lg:flex-row gap-6 mb-8">
            {/* Pie Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 w-full lg:w-1/2">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Your Reading Activity
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
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
                      {pieData.map((entry, index) => (
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
              </div>
            </div>

            {/* Bar Chart - Monthly Activity */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 w-full lg:w-1/2">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Monthly Reading
              </h3>
              <div className="h-64">
                {stats.monthlyStats && stats.monthlyStats.length > 0 ? (
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
                        tickCount={5} // Adjust the number of ticks
                        domain={[0, "dataMax + 1"]} // Ensure the axis starts at 0 and adds padding
                        allowDecimals={false} // This prevents decimal values
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "8px",
                          border: "none",
                          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                          background: "#ffffff",
                        }}
                        formatter={(value) => [
                          `${value} books`,
                          value === 1 ? "book" : "books",
                        ]}
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
                  <div className="h-full flex items-center justify-center text-gray-500">
                    {stats.monthlyStats
                      ? "No monthly data available"
                      : "Loading monthly data..."}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Policy Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Borrowing Policy
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-indigo-50 p-4 rounded-lg">
                <p className="text-sm text-indigo-600 font-medium">
                  Borrow Limit
                </p>
                <p className="text-2xl font-bold text-indigo-800">
                  {stats.borrowLimit} books
                </p>
              </div>
              <div className="bg-emerald-50 p-4 rounded-lg">
                <p className="text-sm text-emerald-600 font-medium">
                  Borrow Duration
                </p>
                <p className="text-2xl font-bold text-emerald-800">
                  {stats.borrowDuration}
                </p>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg">
                <p className="text-sm text-amber-600 font-medium">
                  Fine per Day
                </p>
                <p className="text-2xl font-bold text-amber-800">
                  Rs.{stats.finePerDay}
                </p>
              </div>
            </div>
          </div>

          {/* Latest Books */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Recently Added Books
              </h3>
              <Link
                to="/books"
                className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline flex items-center"
              >
                View all books
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {stats.latestBooks.map((book, index) => (
                <div
                  key={index}
                  className="group cursor-pointer transition-all hover:-translate-y-1"
                  // onClick={() => navigate(`/books/${book.id}`)}
                >
                  <div className="relative pb-[150%] rounded-lg overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                    <img
                      src={book.image || "/default-book-cover.png"}
                      alt={book.name}
                      className="absolute h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <p className="text-white text-sm font-medium truncate w-full">
                        {book.name}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Renewal Confirmation Modal */}
        {showConfirmationModal &&
          selectedNotification?.type === "renewal_date_changed" && (
            <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-xl shadow-xl w-96 max-w-full mx-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Renewal Request
                  </h2>
                  <button
                    onClick={() => setShowConfirmationModal(false)}
                    className="text-gray-500 hover:text-gray-700 text-xl"
                  >
                    &times;
                  </button>
                </div>
                <div className="mb-6">
                  <p className="text-gray-600 mb-4">
                    {selectedNotification.message}
                  </p>
                  <p className="font-medium text-gray-800">
                    Do you accept this new renewal date?
                  </p>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => handleRenewalResponse(false)}
                    className={`px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors ${
                      processing ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={processing}
                  >
                    {processing ? "Processing..." : "Decline"}
                  </button>
                  <button
                    onClick={() => handleRenewalResponse(true)}
                    className={`px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors ${
                      processing ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={processing}
                  >
                    {processing ? "Processing..." : "Accept"}
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
