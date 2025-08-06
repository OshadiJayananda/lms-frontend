import React, { useState, useEffect } from "react";
import SideBar from "../../Components/SideBar";
import HeaderBanner from "../../Components/HeaderBanner";
import Header from "../../Components/Header";
import {
  FaCheck,
  FaTimes,
  FaBook,
  FaUser,
  FaSearch,
  FaInfoCircle,
  FaTrash,
} from "react-icons/fa";
import api from "../../Components/Api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function BookReservation() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'pending', 'approved', 'rejected'
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const heading_pic =
    process.env.REACT_APP_PUBLIC_URL + "/images/heading_pic.jpg";

  const fetchReservations = async (page = 1) => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/book-reservations?page=${page}`);
      setReservations(response.data.data);
      setTotalPages(response.data.last_page);
      setCurrentPage(response.data.current_page);
    } catch (error) {
      console.error("Error fetching reservations:", error);
      toast.error("Failed to load reservations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations(currentPage);
  }, [currentPage]);

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
      setLoading(true);
      const response = await api.post(
        `/admin/book-reservations/${reservationId}/confirm-given`
      );
      toast.success(response.data.message);
      await fetchReservations(currentPage);
    } catch (error) {
      console.error("Confirm given error:", error);
      const errorMessage = error.response?.data?.error
        ? error.response.data.error
        : error.response?.data?.message
        ? error.response.data.message
        : "Failed to confirm book given";
      toast.error(errorMessage);
      if (error.response?.status === 400) {
        await fetchReservations(currentPage);
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredReservations = reservations.filter((reservation) => {
    const matchesSearch =
      reservation.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reservation.book.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reservation.status.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      reservation.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (reservationId) => {
    if (window.confirm("Are you sure you want to delete this reservation?")) {
      try {
        await api.delete(`/admin/book-reservations/${reservationId}`);
        toast.success("Reservation deleted successfully");
        fetchReservations(currentPage);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to delete reservation"
        );
      }
    }
  };

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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 font-serif">
                  Reservations Dashboard
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage all book reservation requests from library patrons
                </p>
              </div>

              <div className="flex flex-col md:flex-row gap-4 w-full md:w-2/3">
                {/* Search Bar */}
                <div className="relative w-full md:w-1/2">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search reservations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>

                {/* Status Filter */}
                <div className="relative w-full md:w-1/2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="block w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
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
                                className={`flex items-center bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition text-sm ${
                                  loading ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                                disabled={loading}
                              >
                                {loading ? (
                                  <span className="flex items-center">
                                    <svg
                                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                    >
                                      <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                      ></circle>
                                      <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                      ></path>
                                    </svg>
                                    Processing...
                                  </span>
                                ) : (
                                  "Confirm Issued"
                                )}
                              </button>
                            )}
                            {reservation.status === "rejected" && (
                              <button
                                onClick={() => handleDelete(reservation.id)}
                                className="flex items-center text-red-600 hover:text-red-900 px-3 py-1 rounded-md hover:bg-red-100 transition text-sm"
                                title="Delete"
                              >
                                <FaTrash className="mr-1" /> Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredReservations.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Showing page {currentPage} of {totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        const prevPage = Math.max(currentPage - 1, 1);
                        setCurrentPage(prevPage);
                      }}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === 1
                          ? "bg-gray-100 text-gray-400"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => {
                        const nextPage = Math.min(currentPage + 1, totalPages);
                        setCurrentPage(nextPage);
                      }}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === totalPages
                          ? "bg-gray-100 text-gray-400"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookReservation;
