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
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  const heading_pic = process.env.PUBLIC_URL + "/images/heading_pic.jpg";

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/user/notifications");
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

  // In Dashboard.js, update the handleNotificationClick function
  const handleNotificationClick = (notification) => {
    if (
      notification.type === "renewal_date_changed" ||
      notification.type === "renewal_confirmed" ||
      notification.type === "renewal_declined"
    ) {
      setSelectedNotification(notification);
      if (notification.type === "renewal_date_changed") {
        setShowConfirmationModal(true);
      }
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
        `/renew-requests/${selectedNotification.renew_request_id}/confirm`,
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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <ClientSidebar isCollapsed={isSidebarCollapsed} onToggle={handleToggle} />

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        <HeaderBanner
          book={"Dashboard"}
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
                  {notifications.map((notification) => (
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
                      )}
                      <p className="text-xs text-gray-500">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <h2 className="text-xl font-semibold">Welcome to the Dashboard</h2>
        </div>

        {/* Renewal Confirmation Modal */}
        {showConfirmationModal && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {selectedNotification?.type === "renewal_date_changed"
                    ? "Renewal Date Change"
                    : selectedNotification?.type === "renewal_confirmed"
                    ? "Renewal Confirmed"
                    : "Renewal Declined"}
                </h2>
                <button
                  onClick={() => setShowConfirmationModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              <div className="mb-4">
                <p>{selectedNotification.message}</p>
                {selectedNotification?.type === "renewal_date_changed" && (
                  <>
                    <p className="mt-4 font-medium">
                      Do you accept this new renewal date?
                    </p>
                    <div className="mt-2 bg-blue-50 p-3 rounded">
                      <p className="text-sm font-medium">Proposed Date:</p>
                      <p className="text-sm">
                        {new Date(
                          selectedNotification.metadata?.proposed_date
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </>
                )}
              </div>
              {selectedNotification?.type === "renewal_date_changed" && (
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
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
