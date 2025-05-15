import React, { useState, useEffect, useCallback } from "react";
import HeaderBanner from "../../Components/HeaderBanner";
import ClientSidebar from "../../Components/ClientSidebar";
import { FaBell } from "react-icons/fa";
import api from "../../Components/Api";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

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
  });
  const [quote, setQuote] = useState(QUOTES[0]);
  const navigate = useNavigate();

  const heading_pic = process.env.PUBLIC_URL + "/images/heading_pic.jpg";
  const COLORS = ["#1E3A8A", "#0284C7", "#94A3B8"];

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
    { name: "Borrowed", value: stats.borrowed },
    { name: "Returned", value: stats.returned },
    { name: "Overdue", value: stats.overdue },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
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
          <div className="relative float-right">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-gray-600 hover:text-blue-600 relative"
            >
              <FaBell size={20} />
              {notifications.filter((n) => !n.is_read).length > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {notifications.filter((n) => !n.is_read).length}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-10">
                <div className="p-2 border-b flex justify-between items-center">
                  <h3 className="font-semibold">Notifications</h3>
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Mark all as read
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${
                          !notification.is_read ? "bg-blue-50" : ""
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <p className="text-sm font-medium">
                          {notification.title}
                        </p>
                        <p className="text-sm">{notification.message}</p>
                        {/* {notification.type === "renewal_date_changed" && (
                          <div className="mt-2 flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRenewalResponse(true);
                              }}
                              className="px-2 py-1 bg-green-500 text-white rounded text-sm"
                              disabled={processing}
                            >
                              Accept
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRenewalResponse(false);
                              }}
                              className="px-2 py-1 bg-red-500 text-white rounded text-sm"
                              disabled={processing}
                            >
                              Decline
                            </button>
                          </div>
                        )} */}
                        <p className="text-xs text-gray-500">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-sm text-gray-500">
                      No new notifications
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <h2 className="text-xl font-semibold mb-6">
            Welcome to the Dashboard
          </h2>

          <blockquote className="italic text-lg mb-6 text-gray-700">
            "{quote.text}" <br />
            <span className="text-sm">– {quote.author}</span>
          </blockquote>

          {/* Chart + Policy Info */}
          <div className="flex flex-wrap md:flex-nowrap gap-6 mb-10">
            <div className="w-full md:w-2/3 h-72">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 flex justify-center space-x-4 text-sm">
                <span className="text-blue-900 font-medium">■ Borrowed</span>
                <span className="text-sky-600 font-medium">■ Returned</span>
                <span className="text-slate-400 font-medium">■ Overdue</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-100 to-slate-200 p-6 rounded-xl shadow-md w-full md:w-1/3 hover:shadow-lg transition duration-300 flex flex-col items-center justify-center">
              <h3 className="text-lg font-semibold text-gray-700 mb-8 text-center">
                Borrowing Policy
              </h3>
              <div className="space-y-3 text-sm text-gray-700 w-full max-w-xs">
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Borrow Limit:</span>
                  <span className="text-gray-900">{stats.borrowLimit}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Keep Duration:</span>
                  <span className="text-gray-900">{stats.borrowDuration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Fine per Day:</span>
                  <span className="text-red-600 font-semibold">
                    Rs.{stats.finePerDay}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Latest Books */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Latest Books</h3>
            <div className="flex overflow-x-auto space-x-4">
              {stats.latestBooks.map((book, index) => (
                <div key={index} className="w-64 flex-shrink-0">
                  <img
                    src={book.image || "/default-book-cover.png"}
                    alt={book.name}
                    className="w-full h-48 object-cover rounded"
                  />
                  <p className="mt-2 text-center text-sm font-medium">
                    {book.name}
                  </p>
                </div>
              ))}
              <Link
                to="/books"
                className="w-60 flex-shrink-0 bg-gray-100 flex items-center justify-center text-sm text-gray-600 rounded hover:bg-gray-200 transition"
              >
                see more
              </Link>
            </div>
          </div>
        </div>

        {/* Renewal Confirmation Modal */}
        {showConfirmationModal &&
          selectedNotification?.type === "renewal_date_changed" && (
            <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Renewal Date Change</h2>
                  <button
                    onClick={() => setShowConfirmationModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </div>
                <div className="mb-4">
                  <p>{selectedNotification.message}</p>
                  <p className="mt-4 font-medium">
                    Do you accept this new renewal date?
                  </p>
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => handleRenewalResponse(false)}
                    className={`px-4 py-2 bg-red-500 text-white rounded ${
                      processing ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={processing}
                  >
                    {processing ? "Processing..." : "No, Decline"}
                  </button>
                  <button
                    onClick={() => handleRenewalResponse(true)}
                    className={`px-4 py-2 bg-green-500 text-white rounded ${
                      processing ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={processing}
                  >
                    {processing ? "Processing..." : "Yes, Accept"}
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
