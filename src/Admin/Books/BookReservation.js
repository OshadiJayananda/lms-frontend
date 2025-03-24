import React, { useState, useEffect } from "react";
import SideBar from "../../Components/SideBar";
import HeaderBanner from "../components/HeaderBanner";
import Header from "../../Components/Header";
import { FaCheck, FaTimes, FaEye } from "react-icons/fa";
import api from "../../Components/Api";
import { toast } from "react-toastify";

function BookReservation() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const heading_pic = process.env.PUBLIC_URL + "/images/heading_pic.jpg";

  const fetchReservations = async () => {
    try {
      const response = await api.get("/admin/book-reservations");
      setReservations(response.data);
    } catch (error) {
      console.error("Error fetching reservations:", error);
      toast.error("Failed to load reservations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleToggle = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleApprove = async (reservationId) => {
    try {
      await api.post(`/admin/book-reservations/${reservationId}/approve`);
      toast.success("Reservation approved");
      fetchReservations();
    } catch (error) {
      toast.error("Failed to approve reservation");
    }
  };

  const handleReject = async (reservationId) => {
    try {
      await api.post(`/admin/book-reservations/${reservationId}/reject`);
      toast.success("Reservation rejected");
      fetchReservations();
    } catch (error) {
      toast.error("Failed to reject reservation");
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
          <div className="flex-1">
            <Header />
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
                    <th className="px-6 py-3 text-left">Reservation Date</th>
                    <th className="px-6 py-3 text-left">Expiry Date</th>
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
                        {new Date(
                          reservation.reservation_date
                        ).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        {new Date(reservation.expiry_date).toLocaleDateString()}
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
