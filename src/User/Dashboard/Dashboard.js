import React, { useState, useEffect } from "react";
import HeaderBanner from "../../Components/HeaderBanner";
import ClientSidebar from "../../Components/ClientSidebar";
import { FaBell } from "react-icons/fa";
import api from "../../Components/Api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const navigate = useNavigate();

  const heading_pic = process.env.PUBLIC_URL + "/images/heading_pic.jpg";

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/user/notifications");
      console.log(response);
      setNotifications(response.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      if (error.response?.status === 401) {
        navigate("/login");
      }
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

  const handleNotificationClick = (notification) => {
    if (notification.type === "reservation_approved") {
      setSelectedNotification(notification);
      setShowConfirmationModal(true);
    }
    // Add this condition for renewal date changes
    else if (notification.type === "renewal_date_changed") {
      setSelectedNotification(notification);
      setShowConfirmationModal(true);
    }
    markNotificationAsRead(notification.id);
  };

  const handleRenewalResponse = async (confirm) => {
    try {
      await api.post(
        `/renew-requests/${selectedNotification.metadata.request_id}/confirm`,
        {
          confirm,
        }
      );

      if (confirm) {
        toast.success("You've accepted the new renewal date");
      } else {
        toast.info("You've declined the renewal date change");
      }

      fetchNotifications();
    } catch (error) {
      toast.error("Failed to process your response");
    } finally {
      setShowConfirmationModal(false);
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

  const handleConfirmReservation = async (confirm) => {
    try {
      const response = await api.post(
        `/reservations/${selectedNotification.reservation_id}/respond`,
        { confirm }
      );

      toast.success(
        confirm
          ? "Book reservation confirmed! Admin has been notified."
          : response.data.message || "Reservation cancelled"
      );

      fetchNotifications();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to process your response"
      );
    } finally {
      setShowConfirmationModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - width changes based on collapsed state */}
      <ClientSidebar isCollapsed={isSidebarCollapsed} onToggle={handleToggle} />

      {/* Main Content Area - adjusts margin based on sidebar state */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        {/* Header Banner - full width, stays connected to sidebar */}
        <HeaderBanner
          book={"Dashboard"}
          heading_pic={heading_pic}
          className="w-full"
        />

        <div style={{ padding: "20px" }}>
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
                <div className="p-2 border-b">
                  <h3 className="font-semibold">Notifications</h3>
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
                        {notification.type === "renewal_date_changed" && (
                          <div className="mt-2 flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRenewalResponse(notification, true);
                              }}
                              className="px-2 py-1 bg-green-500 text-white rounded text-sm"
                            >
                              Accept
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRenewalResponse(notification, false);
                              }}
                              className="px-2 py-1 bg-red-500 text-white rounded text-sm"
                            >
                              Decline
                            </button>
                          </div>
                        )}
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

          <h2>Welcome to the Dashboard</h2>
        </div>

        {/* Confirmation Modal */}
        {showConfirmationModal && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  {selectedNotification?.type === "reservation_approved"
                    ? "Reservation Approved"
                    : "Renewal Date Changed"}
                </h2>
                <button onClick={() => setShowConfirmationModal(false)}>
                  ×
                </button>
              </div>
              <div className="mt-4">
                <p>{selectedNotification?.message}</p>
                <p className="mt-4">
                  {selectedNotification?.type === "reservation_approved"
                    ? "Do you still want this book?"
                    : "Do you accept this new renewal date?"}
                </p>
              </div>
              <div className="mt-6 flex justify-end gap-4">
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded"
                  onClick={() =>
                    selectedNotification?.type === "reservation_approved"
                      ? handleConfirmReservation(false)
                      : handleRenewalResponse(false)
                  }
                >
                  No,{" "}
                  {selectedNotification?.type === "reservation_approved"
                    ? "Cancel"
                    : "Decline"}
                </button>
                <button
                  className="px-4 py-2 bg-green-500 text-white rounded"
                  onClick={() =>
                    selectedNotification?.type === "reservation_approved"
                      ? handleConfirmReservation(true)
                      : handleRenewalResponse(true)
                  }
                >
                  Yes,{" "}
                  {selectedNotification?.type === "reservation_approved"
                    ? "I Want It"
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
