import React, { useState, useEffect } from "react";
import SideBar from "../../Components/SideBar";
import HeaderBanner from "../../Components/HeaderBanner";
import api from "../../Components/Api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "../../Components/Header";
import {
  FaCheck,
  FaTimes,
  FaHandshake,
  FaSearch,
  FaBook,
  FaUser,
  FaCalendarAlt,
} from "react-icons/fa";

function BookRequests() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const heading_pic = process.env.PUBLIC_URL + "/images/heading_pic.jpg";

  const fetchPendingRequests = async (page = 1) => {
    try {
      const response = await api.get(`/admin/book-requests?page=${page}`);
      setPendingRequests(response.data.data);
      setTotalPages(response.data.last_page);
      setCurrentPage(response.data.current_page);
    } catch (error) {
      setError("Failed to fetch pending requests. Please try again later.");
      toast.error("Failed to fetch pending requests. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests(currentPage);
  }, [currentPage]);

  const handleToggle = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleApprove = async (borrowId) => {
    try {
      await api.post(`/admin/book-requests/${borrowId}/approve`);
      setPendingRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.id === borrowId ? { ...request, status: "Approved" } : request
        )
      );
      toast.success("Request approved successfully!");
    } catch (error) {
      toast.error("Failed to approve request. Please try again later.");
    }
  };

  const handleReject = async (borrowId) => {
    try {
      await api.post(`/admin/book-requests/${borrowId}/reject`);
      setPendingRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.id === borrowId ? { ...request, status: "Rejected" } : request
        )
      );
      toast.success("Request rejected successfully!");
    } catch (error) {
      toast.error("Failed to reject request. Please try again later.");
    }
  };

  const handleConfirmGiven = async (borrowId) => {
    try {
      await api.post(`/admin/book-requests/${borrowId}/confirm`);
      setPendingRequests((prevRequests) =>
        prevRequests.filter((request) => request.id !== borrowId)
      );
      toast.success("Book issued successfully!");
    } catch (error) {
      toast.error("Failed to confirm book given. Please try again later.");
    }
  };

  const filteredRequests = pendingRequests.filter(
    (request) =>
      request.book.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.book.isbn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.user.id.toString().includes(searchQuery.toLowerCase())
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
          book={"Book Requests Management"}
          heading_pic={heading_pic}
        />
        <Header />

        <div className="p-6">
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 font-serif">
                  Book Requests Dashboard
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage all book borrowing requests from library patrons
                </p>
              </div>

              <div className="w-full md:w-1/3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search requests..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-md">
              <FaBook className="mx-auto text-gray-400 text-4xl mb-3" />
              <h3 className="text-lg font-medium text-gray-900">
                No book requests found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery
                  ? "Try adjusting your search"
                  : "There are currently no pending book requests"}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Book Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patron Info
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dates
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
                    {filteredRequests.map((request) => (
                      <tr
                        key={request.id}
                        className="hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-16 w-12">
                              <img
                                className="h-full w-full object-cover rounded"
                                src={
                                  request.book.image ||
                                  "/default-book-cover.png"
                                }
                                alt={request.book.name}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {request.book.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                <span className="font-medium">ID:</span>{" "}
                                {request.book.id}
                              </div>
                              <div className="text-sm text-gray-500">
                                <span className="font-medium">ISBN:</span>{" "}
                                {request.book.isbn}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            <div className="flex items-center">
                              <FaUser className="mr-2 text-gray-400" />
                              <span className="font-medium">ID: </span>{" "}
                              {request.user.id}
                            </div>
                            <div className="flex items-center">
                              <FaCheck className="mr-2 text-gray-400" />
                              <span className="font-medium">Name: </span>{" "}
                              {request.user.name}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            <div className="flex items-center mb-1">
                              <FaCalendarAlt className="mr-2 text-gray-400" />
                              <span className="font-medium">Issued:</span>{" "}
                              {request.issued_date
                                ? new Date(
                                    request.issued_date
                                  ).toLocaleDateString()
                                : "Not Issued Yet"}
                            </div>
                            <div className="flex items-center">
                              <FaCalendarAlt className="mr-2 text-gray-400" />
                              <span className="font-medium">Due:</span>{" "}
                              {request.due_date
                                ? new Date(
                                    request.due_date
                                  ).toLocaleDateString()
                                : "Not Issued Yet"}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              request.status === "Pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : request.status === "Approved"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {request.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            {request.status === "Pending" && (
                              <>
                                <button
                                  onClick={() => handleApprove(request.id)}
                                  className="flex items-center bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition text-sm"
                                >
                                  <FaCheck className="mr-1" /> Approve
                                </button>
                                <button
                                  onClick={() => handleReject(request.id)}
                                  className="flex items-center bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition text-sm"
                                >
                                  <FaTimes className="mr-1" /> Reject
                                </button>
                              </>
                            )}
                            {request.status === "Approved" && (
                              <button
                                onClick={() => handleConfirmGiven(request.id)}
                                className="flex items-center bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition text-sm"
                              >
                                <FaHandshake className="mr-1" /> Confirm Issue
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredRequests.length > 0 && (
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
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default BookRequests;
