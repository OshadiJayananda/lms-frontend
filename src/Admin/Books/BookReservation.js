import React, { useState, useEffect } from "react";
import SideBar from "../../Components/SideBar";
import HeaderBanner from "../../Components/HeaderBanner";
import Header from "../../Components/Header";
import { FaCheck, FaTimes, FaBell, FaBook } from "react-icons/fa";
import api from "../../Components/Api";
import { toast } from "react-toastify";

function BookReservation() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const heading_pic = process.env.PUBLIC_URL + "/images/heading_pic.jpg";

  const fetchReservations = async () => {
    try {
      const response = await api.get("/admin/book-reservations");
      setReservations(response.data);

      // Check for declined reservation notifications
      const declinedNotifications = await api.get("/admin/notifications", {
        params: { type: "reservation_declined" },
      });

      if (declinedNotifications.data.length > 0) {
        toast.info("Some reservations have been declined by users");
      }
    } catch (error) {
      console.error("Error fetching reservations:", error);
      toast.error("Failed to load reservations");
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/admin/notifications");
      setNotifications(response.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchReservations();
    fetchNotifications();

    // Set up polling for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleToggle = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleApprove = async (reservationId) => {
    try {
      const response = await api.post(
        `/admin/book-reservations/${reservationId}/approve`
      );
      toast.success(response.data.message);
      fetchReservations();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to approve reservation"
      );
    }
  };

  const handleReject = async (reservationId) => {
    try {
      await api.post(`/admin/book-reservations/${reservationId}/reject`);
      toast.success("Reservation rejected");
      fetchReservations();
      fetchNotifications();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to reject reservation"
      );
    }
  };

  const handleConfirmGiven = async (reservationId) => {
    try {
      // First create the borrow record
      const borrowResponse = await api.post(
        `/admin/book-reservations/${reservationId}/create-borrow`
      );

      // Then confirm it's given
      await api.post(`/admin/book-reservations/${reservationId}/confirm-given`);

      toast.success("Book confirmed as given to user");
      fetchReservations();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to confirm book given"
      );
    }
  };

  return (
    <div>
      <SideBar isCollapsed={isSidebarCollapsed} onToggle={handleToggle} />
      <div
        style={{
          marginLeft: isSidebarCollapsed ? "5%" : "20%",
          padding: "0px",
          transition: "margin-left 0.3s ease",
        }}
      >
        <HeaderBanner book={"Book Reservations"} heading_pic={heading_pic} />

        <div style={{ padding: "20px" }}>
          <div className="flex justify-between items-center">
            <Header />
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-600 hover:text-blue-600 relative"
              >
                <FaBell size={20} />
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {notifications.length}
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
                          className="p-3 border-b hover:bg-gray-50"
                        >
                          <div className="flex items-start">
                            <FaBook className="mt-1 mr-2 text-blue-500" />
                            <div>
                              <p className="text-sm">{notification.message}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(
                                  notification.created_at
                                ).toLocaleString()}
                              </p>
                            </div>
                          </div>
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
          </div>

          <h2 className="text-2xl font-bold mb-6">Book Reservations</h2>

          {loading ? (
            <p>Loading reservations...</p>
          ) : (
            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">User</th>
                    <th className="px-6 py-3 text-left">Book</th>
                    <th className="px-6 py-3 text-left">Copies Available</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reservations.map((reservation) => (
                    <tr key={reservation.id}>
                      <td className="px-6 py-4">{reservation.user.name}</td>
                      <td className="px-6 py-4">{reservation.book.name}</td>
                      <td className="px-6 py-4">
                        {reservation.book.no_of_copies}
                      </td>
                      <td className="px-6 py-4 capitalize">
                        {reservation.status}
                      </td>
                      <td className="px-6 py-4 flex gap-2">
                        {reservation.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(reservation.id)}
                              className="p-2 text-green-600 hover:text-green-800"
                              title="Approve"
                            >
                              <FaCheck />
                            </button>
                            <button
                              onClick={() => handleReject(reservation.id)}
                              className="p-2 text-red-600 hover:text-red-800"
                              title="Reject"
                            >
                              <FaTimes />
                            </button>
                          </>
                        )}
                        {reservation.status === "approved" && (
                          <button
                            onClick={() => handleConfirmGiven(reservation.id)}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                          >
                            Confirm Given
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookReservation;
