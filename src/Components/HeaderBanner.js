import React, { useCallback, useEffect, useState } from "react";
import { FaBell, FaExchangeAlt, FaCheck } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "./Api";
import { toast } from "react-toastify";

function HeaderBanner({ book = "Books", heading_pic }) {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [processing, setProcessing] = useState(false); // ✅ fix

  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await api.get("/user/notifications");
      setNotifications(response.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      if (error.response?.status === 401) navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleNotificationClick = (notification) => {
    if (
      notification.type === "renewal_date_changed" ||
      notification.type === "reservation_approved"
    ) {
      setSelectedNotification(notification);
      setShowConfirmationModal(true);
    }
    markNotificationAsRead(notification.id);
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
      toast.error(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to process your response. Please try again later."
      );
    } finally {
      setProcessing(false);
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
      toast.error(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to process your response. Please try again later."
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <div
        className="h-28 md:h-30 w-full bg-cover bg-center relative overflow-visible"
        style={{ backgroundImage: `url(${heading_pic})` }}
      >
        {/* Overlays */}
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/50 to-transparent"></div>

        {/* Content container */}
        <div className="relative h-full flex items-center px-6 md:px-12 lg:px-16">
          <div className="max-w-7xl w-full">
            <div className="flex items-start justify-between">
              {/* Left: Title & Description */}
              <div>
                <h1 className="text-4xl md:text-5xl lg:text-4xl font-bold text-white font-serif drop-shadow-lg">
                  {book}
                </h1>
                <p className="text-lg md:text-xl text-white mt-2 max-w-2xl drop-shadow-md">
                  Explore our vast collection of books and resources
                </p>
              </div>

              {/* Right: Notification Bell */}
              <div className="relative ml-4">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-3 bg-white rounded-full shadow-sm hover:shadow-md transition-all relative"
                  aria-label="Notifications"
                >
                  <FaBell size={20} className="text-indigo-600" />
                  {notifications.filter((n) => !n.is_read).length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {notifications.filter((n) => !n.is_read).length}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 border border-gray-100">
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
                            onClick={() =>
                              handleNotificationClick(notification)
                            }
                          >
                            <div className="flex items-start">
                              <div
                                className={`p-2 rounded-full mr-3 ${
                                  notification.type === "renewal_date_changed"
                                    ? "bg-purple-100 text-purple-600"
                                    : notification.type ===
                                      "reservation_approved"
                                    ? "bg-green-100 text-green-600"
                                    : "bg-blue-100 text-blue-600"
                                }`}
                              >
                                {notification.type ===
                                "reservation_approved" ? (
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
            </div>
          </div>
        </div>
      </div>

      {/* Modal (outside banner) */}
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
                onClick={() =>
                  selectedNotification.type === "reservation_approved"
                    ? handleReservationResponse(false)
                    : handleRenewalResponse(false)
                }
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
                onClick={() =>
                  selectedNotification.type === "reservation_approved"
                    ? handleReservationResponse(true)
                    : handleRenewalResponse(true)
                }
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
    </>
  );
}

export default HeaderBanner;
