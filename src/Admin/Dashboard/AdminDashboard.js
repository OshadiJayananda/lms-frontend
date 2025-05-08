import React, { useState, useEffect } from "react";
import SideBar from "../../Components/SideBar";
import HeaderBanner from "../../Components/HeaderBanner";
import Header from "../../Components/Header";
import { FaBell, FaChevronDown } from "react-icons/fa";
import api from "../../Components/Api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const heading_pic = process.env.PUBLIC_URL + "/images/heading_pic.jpg";

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/notifications");
      setNotifications(response.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      if (error.response?.status === 401) {
        navigate("/login");
      } else {
        toast.error("Failed to load notifications");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleToggle = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await api.post(`/notifications/${notificationId}/read`);
      fetchNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await api.post("/notifications/read-all");
      fetchNotifications();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - width changes based on collapsed state */}
      <SideBar isCollapsed={isSidebarCollapsed} onToggle={handleToggle} />

      {/* Main Content Area - adjusts margin based on sidebar state */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        {/* Header Banner - full width, stays connected to sidebar */}
        <HeaderBanner
          book={"Admin Dashboard"}
          heading_pic={heading_pic}
          className="w-full"
        />

        {/* Navigation Header - full width, stays connected to sidebar */}
        <Header isCollapsed={isSidebarCollapsed} />

        {/* Scrollable Content Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <div></div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-600 hover:text-blue-600 relative"
              >
                <div className="flex items-center">
                  <FaBell size={20} className={loading ? "animate-spin" : ""} />
                  {notifications.length > 0 && (
                    <span className="ml-1">
                      <FaChevronDown size={12} />
                    </span>
                  )}
                </div>
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {notifications.length}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
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
                        Mark all as read
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
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3 border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors ${
                            !notification.is_read ? "bg-blue-50" : ""
                          }`}
                          onClick={() =>
                            markNotificationAsRead(notification.id)
                          }
                        >
                          <p className="text-sm font-medium text-gray-800">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(notification.created_at).toLocaleString()}
                          </p>
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

          {/* Main Dashboard Content */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Welcome to the Dashboard
            </h2>
            {/* Add your dashboard widgets/content here */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
