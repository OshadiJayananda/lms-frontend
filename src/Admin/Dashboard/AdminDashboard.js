import React, { useState, useEffect } from "react";
import SideBar from "../../Components/SideBar";
import HeaderBanner from "../../Components/HeaderBanner";
import Header from "../../Components/Header";
import {
  FaBell,
  FaChevronDown,
  FaUsers,
  FaBook,
  FaClipboardCheck,
  FaClock,
  FaCheck,
  FaTimes,
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

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/admin/notifications");
      setNotifications(response.data);

      // Check for specific notification types to show toasts
      response.data.forEach((notification) => {
        if (!notification.is_read) {
          if (notification.type === "reservation_declined") {
            toast.warning(notification.message);
          } else if (notification.type === "reservation_approved") {
            toast.success(notification.message);
          } else if (notification.type === "reservation_created") {
            toast.info(notification.message);
          }
        }
      });
    } catch (error) {
      if (error.response?.status === 401) navigate("/login");
      else toast.error("Failed to load notifications");
    }
  };

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/dashboard-stats");
      setStats(res.data);
    } catch (err) {
      toast.error("Failed to fetch dashboard stats");
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
      toast.error("Failed to fetch borrowing policies");
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
      // First mark the notification as read
      await api.post(`/notifications/${notificationId}/read`);

      // Then perform the reservation action
      const response = await api.post(
        `/admin/book-reservations/${notificationId}/${action}`
      );

      toast.success(response.data.message);
      fetchNotifications();
      fetchDashboardStats();
    } catch (error) {
      toast.error(
        error.response?.data?.message || `Failed to ${action} reservation`
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
      toast.success("Borrowing policy updated successfully!");
      closeModal();
      fetchBorrowingPolicy();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update borrowing policy"
      );
    }
  };

  const handleReset = async () => {
    try {
      const response = await api.delete("/borrowing-policies");
      toast.success("Borrowing policy reset to default values!");
      fetchBorrowingPolicy();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to reset borrowing policy"
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
          `There are ${response.data.count} pending reservations for this book`
        );
        return response.data.count;
      } else {
        toast.info("No pending reservations for this book");
        return 0;
      }
    } catch (error) {
      console.error("Error fetching pending reservations:", error);
      toast.error(
        error.response?.data?.message || "Failed to check pending reservations"
      );
      throw error;
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    fetchNotifications();
    fetchBorrowingPolicy();
    fetchPendingReservations();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const cards = [
    {
      title: "Total Books",
      value: stats.totalBooks,
      icon: <FaBook className="text-blue-500 text-xl" />,
    },
    {
      title: "Total Members",
      value: stats.totalMembers,
      icon: <FaUsers className="text-green-500 text-xl" />,
    },
    {
      title: "Borrowed Books",
      value: stats.borrowedBooks,
      icon: <FaClipboardCheck className="text-yellow-500 text-xl" />,
    },
    {
      title: "Overdue Books",
      value: stats.overdueBooks,
      icon: <FaClock className="text-red-500 text-xl" />,
    },
  ];

  const getNotificationIcon = (type) => {
    switch (type) {
      case "reservation_created":
        return <FaBook className="text-blue-500 mr-2" />;
      case "reservation_approved":
        return <FaCheck className="text-green-500 mr-2" />;
      case "reservation_declined":
        return <FaTimes className="text-red-500 mr-2" />;
      case "reservation_confirmed":
        return <FaCheck className="text-green-500 mr-2" />;
      default:
        return <FaBell className="text-yellow-500 mr-2" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
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
          <div className="flex justify-between items-center mb-6">
            <div className="text-xl font-bold text-gray-800">
              Dashboard Overview
            </div>
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-600 hover:text-blue-600 relative"
              >
                <FaBell size={20} className={loading ? "animate-spin" : ""} />
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {notifications.filter((n) => !n.is_read).length}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-10 border border-gray-200">
                  <div className="p-3 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
                    <h3 className="font-semibold text-gray-700">
                      Notifications
                    </h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={markAllNotificationsAsRead}
                        className="text-xs text-blue-500 hover:text-blue-700"
                      >
                        Mark all
                      </button>
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length ? (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-3 border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors ${
                            !n.is_read ? "bg-blue-50" : ""
                          }`}
                          onClick={() => markNotificationAsRead(n.id)}
                        >
                          <div className="flex items-start">
                            {getNotificationIcon(n.type)}
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-800">
                                {n.title}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {n.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(n.created_at).toLocaleString()}
                              </p>
                              {/* {n.type === "reservation_created" && (
                                <div className="flex space-x-2 mt-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleReservationAction(n.id, "approve");
                                    }}
                                    className="flex items-center bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                                  >
                                    <FaCheck className="mr-1" /> Approve
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleReservationAction(n.id, "reject");
                                    }}
                                    className="flex items-center bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                                  >
                                    <FaTimes className="mr-1" /> Reject
                                  </button>
                                </div>
                              )} */}
                              {n.type === "reservation_declined" && (
                                <div className="mt-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      fetchPendingReservations(n.book_id);
                                    }}
                                    className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200"
                                  >
                                    Check for pending reservations
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-gray-500">
                        No new notifications
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Borrowing Policy
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={openModal}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Update Policy
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Reset to Default
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-indigo-50 p-4 rounded-lg">
                <p className="text-sm text-indigo-600 font-medium">
                  Borrow Limit
                </p>
                <p className="text-2xl font-bold text-indigo-800">
                  {borrowingPolicy.borrow_limit} books
                </p>
              </div>
              <div className="bg-emerald-50 p-4 rounded-lg">
                <p className="text-sm text-emerald-600 font-medium">
                  Borrow Duration
                </p>
                <p className="text-2xl font-bold text-emerald-800">
                  {borrowingPolicy.borrow_duration_days} days
                </p>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg">
                <p className="text-sm text-amber-600 font-medium">
                  Fine per Day
                </p>
                <p className="text-2xl font-bold text-amber-800">
                  Rs.{borrowingPolicy.fine_per_day}
                </p>
              </div>
            </div>
          </div>

          {/* Update Policy Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Update Borrowing Policy
                  </h3>
                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div className="mb-4">
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div className="mb-6">
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Rest of the dashboard content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {cards.map((card, index) => (
              <div
                key={index}
                className="bg-white p-5 rounded-lg shadow hover:shadow-md transition-all duration-200 flex items-center justify-between"
              >
                <div>
                  <h4 className="text-sm text-gray-500">{card.title}</h4>
                  <p className="text-2xl font-bold text-gray-800">
                    {loading ? "..." : card.value}
                  </p>
                </div>
                <div>{card.icon}</div>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Borrowed Books Per Month
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.borrowedPerMonth || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tickFormatter={(m) => `M${m}`} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Top Lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Top Borrowing Members
              </h3>
              <ul className="space-y-2">
                {stats.topMembers?.map((member) => (
                  <li key={member.id} className="flex justify-between text-sm">
                    <span>{member.name}</span>
                    <span className="font-semibold">
                      {member.borrowed_books_count}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Most Borrowed Books
              </h3>
              <ul className="space-y-2">
                {stats.topBooks?.map((book) => (
                  <li key={book.id} className="flex justify-between text-sm">
                    <span>{book.name}</span>
                    <span className="font-semibold">{book.borrows_count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Latest Book Requests */}
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Latest Book Requests
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2">User</th>
                    <th className="px-4 py-2">Book</th>
                    <th className="px-4 py-2">Requested At</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentRequests && stats.recentRequests.length > 0 ? (
                    stats.recentRequests.map((req) => (
                      <tr key={req.id} className="border-t">
                        <td className="px-4 py-2">{req.user?.name}</td>
                        <td className="px-4 py-2">{req.book?.name}</td>
                        <td className="px-4 py-2">
                          {new Date(req.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="3"
                        className="px-4 py-2 text-center text-gray-500"
                      >
                        No recent requests found.
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
