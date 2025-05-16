import React, { useState, useEffect } from "react";
import SideBar from "../../Components/SideBar";
import HeaderBanner from "../../Components/HeaderBanner";
import Header from "../../Components/Header";
import { FaCheck, FaTimes, FaBook, FaUser, FaSearch } from "react-icons/fa";
import api from "../../Components/Api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function BookReservation() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredReservations = reservations.filter(
    (reservation) =>
      reservation.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reservation.book.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reservation.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SideBar isCollapsed={isSidebarCollapsed} onToggle={handleToggle} />
      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        <HeaderBanner
          book={"Book Reservations Management"}
          heading_pic={heading_pic}
        />
        <Header />

        <div className="p-6">
          {/* Dashboard Header */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 font-serif">
                  Reservations Dashboard
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage all book reservation requests from library patrons
                </p>
              </div>

              <div className="relative w-full md:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search reservations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Reservations Table */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredReservations.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-md">
              <FaBook className="mx-auto text-gray-400 text-4xl mb-3" />
              <h3 className="text-lg font-medium text-gray-900">
                No reservations found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery
                  ? "Try adjusting your search"
                  : "There are currently no book reservations"}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patron
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Book Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Availability
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredReservations.map((reservation) => (
                      <tr
                        key={reservation.id}
                        className="hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <FaUser className="text-blue-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {reservation.user.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {reservation.user.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-16 w-12">
                              <img
                                className="h-full w-full object-cover rounded"
                                src={
                                  reservation.book.image ||
                                  "/default-book-cover.png"
                                }
                                alt={reservation.book.name}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {reservation.book.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                ISBN: {reservation.book.isbn}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            <div className="flex items-center">
                              <span className="font-medium">Copies:</span>{" "}
                              <span
                                className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
                                  reservation.book.no_of_copies > 0
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {reservation.book.no_of_copies} available
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              reservation.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : reservation.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {reservation.status.charAt(0).toUpperCase() +
                              reservation.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            {reservation.status === "pending" && (
                              <>
                                <button
                                  onClick={() => handleApprove(reservation.id)}
                                  className="flex items-center bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition text-sm"
                                  title="Approve"
                                >
                                  <FaCheck className="mr-1" /> Approve
                                </button>
                                <button
                                  onClick={() => handleReject(reservation.id)}
                                  className="flex items-center bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition text-sm"
                                  title="Reject"
                                >
                                  <FaTimes className="mr-1" /> Reject
                                </button>
                              </>
                            )}
                            {reservation.status === "approved" && (
                              <button
                                onClick={() =>
                                  handleConfirmGiven(reservation.id)
                                }
                                className="flex items-center bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition text-sm"
                              >
                                Confirm Issued
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookReservation;
