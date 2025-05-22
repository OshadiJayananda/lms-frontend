import React, { useState, useEffect } from "react";
import SideBar from "../../Components/SideBar";
import HeaderBanner from "../../Components/HeaderBanner";
import Header from "../../Components/Header";
import {
  FaBell,
  FaUsers,
  FaBook,
  FaClipboardCheck,
  FaClock,
  FaCheck,
  FaTimes,
  FaCog,
  FaUndo,
  FaChartLine,
  FaUserTie,
  FaBookOpen,
} from "react-icons/fa";
import api from "../../Components/Api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

function AdminDashboard() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalMembers: 0,
    borrowedBooks: 0,
    overdueBooks: 0,
    borrowedPerMonth: [],
    topMembers: [],
    topBooks: [],
    recentRequests: [],
  });
  const [borrowingPolicy, setBorrowingPolicy] = useState({
    borrow_limit: 0,
    borrow_duration_days: 0,
    fine_per_day: 0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    borrow_limit: 0,
    borrow_duration_days: 0,
    fine_per_day: 0,
  });

  const navigate = useNavigate();
  const heading_pic = process.env.PUBLIC_URL + "/images/heading_pic.jpg";

  // Custom font styling
  const fontStyles = {
    heading: "font-['Poppins'] font-semibold",
    body: "font-['Open_Sans']",
    numbers: "font-['Roboto'] font-medium",
  };

  // Color palette
  const colors = {
    primary: "#4F46E5", // Indigo
    secondary: "#10B981", // Emerald
    accent: "#F59E0B", // Amber
    danger: "#EF4444", // Red
    dark: "#1F2937", // Gray-800
    light: "#F9FAFB", // Gray-50
  };

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/admin/notifications");
      setNotifications(response.data);

      response.data.forEach((notification) => {
        if (!notification.is_read) {
          if (notification.type === "reservation_declined") {
            toast.warning(notification.message, { position: "top-right" });
          } else if (notification.type === "reservation_approved") {
            toast.success(notification.message, { position: "top-right" });
          } else if (notification.type === "reservation_created") {
            toast.info(notification.message, { position: "top-right" });
          }
        }
      });
    } catch (error) {
      if (error.response?.status === 401) navigate("/login");
      else
        toast.error("Failed to load notifications", { position: "top-right" });
    }
  };

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/dashboard-stats");
      setStats(res.data);
    } catch (err) {
      toast.error("Failed to fetch dashboard stats", { position: "top-right" });
    } finally {
      setLoading(false);
    }
  };

  const fetchBorrowingPolicy = async () => {
    setLoading(true);
    try {
      const res = await api.get("/borrowing-policies");
      setBorrowingPolicy(res.data);
      setFormData({
        borrow_limit: res.data.borrow_limit,
        borrow_duration_days: res.data.borrow_duration_days,
        fine_per_day: res.data.fine_per_day,
      });
    } catch (err) {
      toast.error("Failed to fetch borrowing policies", {
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  };

  const markNotificationAsRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error("Error marking notification:", err);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await api.post("/notifications/read-all");
      fetchNotifications();
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  const handleReservationAction = async (notificationId, action) => {
    try {
      await api.post(`/notifications/${notificationId}/read`);
      const response = await api.post(
        `/admin/book-reservations/${notificationId}/${action}`
      );
      toast.success(response.data.message, { position: "top-right" });
      fetchNotifications();
      fetchDashboardStats();
    } catch (error) {
      toast.error(
        error.response?.data?.message || `Failed to ${action} reservation`,
        { position: "top-right" }
      );
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put("/borrowing-policies", formData);
      setBorrowingPolicy(response.data);
      toast.success("Borrowing policy updated successfully!", {
        position: "top-right",
      });
      closeModal();
      fetchBorrowingPolicy();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update borrowing policy",
        { position: "top-right" }
      );
    }
  };

  const handleReset = async () => {
    try {
      const response = await api.delete("/borrowing-policies");
      toast.success("Borrowing policy reset to default values!", {
        position: "top-right",
      });
      fetchBorrowingPolicy();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to reset borrowing policy",
        { position: "top-right" }
      );
    }
  };

  const fetchPendingReservations = async (bookId) => {
    try {
      const response = await api.get(
        `/admin/book-reservations/pending/${bookId}`
      );
      if (response.data.count > 0) {
        toast.info(
          `There are ${response.data.count} pending reservations for this book`,
          { position: "top-right" }
        );
        return response.data.count;
      } else {
        toast.info("No pending reservations for this book", {
          position: "top-right",
        });
        return 0;
      }
    } catch (error) {
      console.error("Error fetching pending reservations:", error);
      toast.error(
        error.response?.data?.message || "Failed to check pending reservations",
        { position: "top-right" }
      );
      throw error;
    }
  };

  useEffect(() => {
    // Load fonts dynamically
    const loadFonts = () => {
      const link1 = document.createElement("link");
      link1.href =
        "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap";
      link1.rel = "stylesheet";

      const link2 = document.createElement("link");
      link2.href =
        "https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600&display=swap";
      link2.rel = "stylesheet";

      const link3 = document.createElement("link");
      link3.href =
        "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap";
      link3.rel = "stylesheet";

      document.head.appendChild(link1);
      document.head.appendChild(link2);
      document.head.appendChild(link3);
    };

    loadFonts();
    fetchDashboardStats();
    fetchNotifications();
    fetchBorrowingPolicy();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const cards = [
    {
      title: "Total Books",
      value: stats.totalBooks,
      icon: <FaBook className="text-blue-500 text-2xl" />,
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      title: "Total Members",
      value: stats.totalMembers,
      icon: <FaUsers className="text-green-500 text-2xl" />,
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      title: "Borrowed Books",
      value: stats.borrowedBooks,
      icon: <FaBookOpen className="text-purple-500 text-2xl" />,
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      title: "Overdue Books",
      value: stats.overdueBooks,
      icon: <FaClock className="text-red-500 text-2xl" />,
      bgColor: "bg-red-50",
      textColor: "text-red-600",
    },
  ];

  const getNotificationIcon = (type) => {
    switch (type) {
      case "reservation_created":
        return <FaBook className="text-blue-500 mr-3 text-lg" />;
      case "reservation_approved":
        return <FaCheck className="text-green-500 mr-3 text-lg" />;
      case "reservation_declined":
        return <FaTimes className="text-red-500 mr-3 text-lg" />;
      case "reservation_confirmed":
        return <FaCheck className="text-green-500 mr-3 text-lg" />;
      default:
        return <FaBell className="text-yellow-500 mr-3 text-lg" />;
    }
  };

  return (
    <div
      className="min-h-screen bg-gray-50 flex"
      style={{ fontFamily: "'Open Sans', sans-serif" }}
    >
      <SideBar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!isSidebarCollapsed)}
      />
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        <HeaderBanner book={"Admin Dashboard"} heading_pic={heading_pic} />
        <Header isCollapsed={isSidebarCollapsed} />

        <div className="flex-1 p-6 overflow-y-auto">
          {/* Dashboard Header */}
          <div className="flex justify-between items-center mb-8">
            <div className={`text-2xl ${fontStyles.heading} text-gray-800`}>
              Dashboard Overview
            </div>
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-3 rounded-full relative transition-all ${
                  showNotifications ? "bg-indigo-100" : "hover:bg-gray-100"
                }`}
                aria-label="Notifications"
              >
                <FaBell
                  size={20}
                  className={`${loading ? "animate-spin" : ""} ${
                    notifications.filter((n) => !n.is_read).length > 0
                      ? "text-indigo-600"
                      : "text-gray-500"
                  }`}
                />
                {notifications.filter((n) => !n.is_read).length > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {notifications.filter((n) => !n.is_read).length}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 border border-gray-200 transform origin-top-right transition-all">
                  <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
                    <h3
                      className={`font-semibold ${fontStyles.heading} text-gray-800`}
                    >
                      Notifications
                    </h3>
                    <div className="flex space-x-3">
                      {notifications.filter((n) => !n.is_read).length > 0 && (
                        <button
                          onClick={markAllNotificationsAsRead}
                          className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline"
                        >
                          Mark all as read
                        </button>
                      )}
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-4 border-b border-gray-100 hover:bg-indigo-50 cursor-pointer transition-colors ${
                            !n.is_read ? "bg-blue-50" : ""
                          }`}
                          onClick={() => markNotificationAsRead(n.id)}
                        >
                          <div className="flex items-start">
                            {getNotificationIcon(n.type)}
                            <div className="flex-1">
                              <p
                                className={`text-sm font-medium ${fontStyles.heading} text-gray-800`}
                              >
                                {n.title}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {n.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-2">
                                {new Date(n.created_at).toLocaleString()}
                              </p>
                              {n.type === "reservation_declined" && (
                                <div className="mt-3">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      fetchPendingReservations(n.book_id);
                                    }}
                                    className="text-xs bg-indigo-100 text-indigo-600 px-3 py-1 rounded hover:bg-indigo-200 transition-colors"
                                  >
                                    Check pending reservations
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-gray-500">
                        <FaBell className="mx-auto text-gray-300 text-2xl mb-2" />
                        <p>No new notifications</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {cards.map((card, index) => (
              <div
                key={index}
                className={`${card.bgColor} p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm text-gray-500 mb-1">{card.title}</h4>
                    <p
                      className={`text-3xl ${fontStyles.numbers} ${card.textColor}`}
                    >
                      {loading ? (
                        <span className="inline-block h-8 w-8 border-4 border-gray-300 border-t-indigo-500 rounded-full animate-spin"></span>
                      ) : (
                        card.value.toLocaleString()
                      )}
                    </p>
                  </div>
                  <div
                    className={`p-3 rounded-full ${card.bgColor.replace(
                      "50",
                      "100"
                    )}`}
                  >
                    {card.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Borrowing Policy Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-xl ${fontStyles.heading} text-gray-800`}>
                Borrowing Policy Settings
              </h3>
              <div className="flex space-x-3">
                <button
                  onClick={openModal}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <FaCog className="mr-2" /> Update Policy
                </button>
                <button
                  onClick={handleReset}
                  className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <FaUndo className="mr-2" /> Reset Defaults
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-indigo-50 p-5 rounded-lg hover:bg-indigo-100 transition-colors">
                <p className="text-sm text-indigo-600 font-medium mb-2">
                  Borrow Limit
                </p>
                <p className={`text-2xl ${fontStyles.numbers} text-indigo-800`}>
                  {borrowingPolicy.borrow_limit} books
                </p>
                <p className="text-xs text-indigo-500 mt-1">
                  Maximum at one time
                </p>
              </div>
              <div className="bg-emerald-50 p-5 rounded-lg hover:bg-emerald-100 transition-colors">
                <p className="text-sm text-emerald-600 font-medium mb-2">
                  Borrow Duration
                </p>
                <p
                  className={`text-2xl ${fontStyles.numbers} text-emerald-800`}
                >
                  {borrowingPolicy.borrow_duration_days} days
                </p>
                <p className="text-xs text-emerald-500 mt-1">Per book</p>
              </div>
              <div className="bg-amber-50 p-5 rounded-lg hover:bg-amber-100 transition-colors">
                <p className="text-sm text-amber-600 font-medium mb-2">
                  Fine per Day
                </p>
                <p className={`text-2xl ${fontStyles.numbers} text-amber-800`}>
                  Rs.{borrowingPolicy.fine_per_day}
                </p>
                <p className="text-xs text-amber-500 mt-1">For overdue books</p>
              </div>
            </div>
          </div>

          {/* Update Policy Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3
                      className={`text-xl ${fontStyles.heading} text-gray-800`}
                    >
                      Update Borrowing Policy
                    </h3>
                    <button
                      onClick={closeModal}
                      className="text-gray-500 hover:text-gray-700 text-xl"
                    >
                      &times;
                    </button>
                  </div>
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="borrow_limit"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Borrow Limit (books)
                        </label>
                        <input
                          type="number"
                          id="borrow_limit"
                          name="borrow_limit"
                          min="1"
                          value={formData.borrow_limit}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          required
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="borrow_duration_days"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Borrow Duration (days)
                        </label>
                        <input
                          type="number"
                          id="borrow_duration_days"
                          name="borrow_duration_days"
                          min="1"
                          value={formData.borrow_duration_days}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          required
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="fine_per_day"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Fine per Day (Rs.)
                        </label>
                        <input
                          type="number"
                          id="fine_per_day"
                          name="fine_per_day"
                          min="0"
                          step="0.01"
                          value={formData.fine_per_day}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Borrowed Books Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-lg ${fontStyles.heading} text-gray-800`}>
                  Borrowed Books Trend
                </h3>
                <div className="flex items-center text-sm text-indigo-600">
                  <FaChartLine className="mr-1" /> Monthly Overview
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.borrowedPerMonth || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: colors.dark }}
                      tickFormatter={(m) => `Month ${m}`}
                    />
                    <YAxis allowDecimals={false} tick={{ fill: colors.dark }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                        background: "#ffffff",
                      }}
                      formatter={(value) => [`${value} books`, "Borrowed"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke={colors.primary}
                      strokeWidth={2}
                      dot={{ r: 4, fill: colors.primary }}
                      activeDot={{ r: 6, fill: colors.primary }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Members/Books Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3
                className={`text-lg ${fontStyles.heading} text-gray-800 mb-4`}
              >
                Top Members & Books
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      ...(stats.topMembers?.slice(0, 3) || []).map((m) => ({
                        ...m,
                        type: "member",
                      })),
                      ...(stats.topBooks?.slice(0, 3) || []).map((b) => ({
                        ...b,
                        type: "book",
                      })),
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: colors.dark, fontSize: 12 }}
                    />
                    <YAxis allowDecimals={false} tick={{ fill: colors.dark }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                        background: "#ffffff",
                      }}
                      formatter={(value, name, props) => {
                        const label =
                          props.payload.type === "member"
                            ? "borrows"
                            : "times borrowed";
                        return [
                          `${value} ${label}`,
                          props.payload.type === "member" ? "Member" : "Book",
                        ];
                      }}
                    />
                    <Bar
                      dataKey={(d) => d.borrowed_books_count || d.borrows_count}
                      fill={colors.secondary}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Top Lists Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Top Members */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-lg ${fontStyles.heading} text-gray-800`}>
                  Top Borrowing Members
                </h3>
                <FaUserTie className="text-indigo-500" />
              </div>
              <div className="space-y-4">
                {stats.topMembers?.length > 0 ? (
                  stats.topMembers.slice(0, 5).map((member, index) => (
                    <div key={member.id} className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          index === 0
                            ? "bg-amber-100 text-amber-600"
                            : index === 1
                            ? "bg-gray-100 text-gray-600"
                            : index === 2
                            ? "bg-amber-50 text-amber-500"
                            : "bg-gray-50 text-gray-500"
                        } mr-3`}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">
                          {member.name}
                        </p>
                        <p className="text-sm text-gray-500">{member.email}</p>
                      </div>
                      <div className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-sm font-medium">
                        {member.borrowed_books_count} borrows
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    No member data available
                  </div>
                )}
              </div>
            </div>

            {/* Top Books */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-lg ${fontStyles.heading} text-gray-800`}>
                  Most Borrowed Books
                </h3>
                <FaBook className="text-indigo-500" />
              </div>
              <div className="space-y-4">
                {stats.topBooks?.length > 0 ? (
                  stats.topBooks.slice(0, 5).map((book, index) => (
                    <div key={book.id} className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          index === 0
                            ? "bg-amber-100 text-amber-600"
                            : index === 1
                            ? "bg-gray-100 text-gray-600"
                            : index === 2
                            ? "bg-amber-50 text-amber-500"
                            : "bg-gray-50 text-gray-500"
                        } mr-3`}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">
                          {book.name}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {book.author}
                        </p>
                      </div>
                      <div className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
                        {book.borrows_count} times
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    No book data available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Requests Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg ${fontStyles.heading} text-gray-800`}>
                Recent Book Requests
              </h3>
              <span className="text-sm text-indigo-600">
                Last {stats.recentRequests?.length || 0} requests
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      User
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Book
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.recentRequests && stats.recentRequests.length > 0 ? (
                    stats.recentRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                              {req.user?.name?.charAt(0) || "U"}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {req.user?.name || "Unknown"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {req.user?.email || ""}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {req.book?.name || "Unknown"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {req.book?.author || ""}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(req.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              req.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : req.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {req.status || "unknown"}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        No recent requests found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
