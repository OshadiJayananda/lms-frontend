import React, { useState, useEffect } from "react";
import SideBar from "../../Components/SideBar";
import HeaderBanner from "../../Components/HeaderBanner";
import Header from "../../Components/Header";
import {
  FaCheck,
  FaTimes,
  FaCalendarAlt,
  FaInfoCircle,
  FaUser,
  FaSearch,
  FaTrash,
} from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../Components/Api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function RenewBook() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [renewRequests, setRenewRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [newDueDate, setNewDueDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const heading_pic = process.env.PUBLIC_URL + "/images/heading_pic.jpg";
  const [statusFilter, setStatusFilter] = useState("all");
  const STATUS_PENDING = "pending";
  const STATUS_PENDING_USER_CONFIRMATION = "pending_user_confirmation";
  const STATUS_APPROVED = "approved";
  const STATUS_REJECTED = "rejected";
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchRenewRequests = async (page = 1) => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/renew-requests?page=${page}`);
      setRenewRequests(response.data.data);
      setFilteredRequests(response.data.data);
      setTotalPages(response.data.last_page);
      setCurrentPage(response.data.current_page);
    } catch (error) {
      console.error("Error details:", {
        message: error.message,
        response: error.response,
        config: error.config,
      });
      toast.error(
        error.response?.data?.message ||
          "Failed to fetch renewal requests. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRenewRequests(currentPage);
  }, [currentPage]);

  // Search functionality
  useEffect(() => {
    let filtered = renewRequests;

    // Apply search filter
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter((request) => {
        const searchLower = searchQuery.toLowerCase();
        return (
          request.book.name.toLowerCase().includes(searchLower) ||
          request.book.isbn.toLowerCase().includes(searchLower) ||
          request.book.id.toString().includes(searchQuery) ||
          request.user.name.toLowerCase().includes(searchLower) ||
          request.user.id.toString().includes(searchQuery) ||
          request.status.toLowerCase().includes(searchLower)
        );
      });
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((request) => request.status === statusFilter);
    }

    setFilteredRequests(filtered);
  }, [searchQuery, statusFilter, renewRequests]);

  const handleToggle = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleApprove = async (requestId, directApprove = false) => {
    try {
      let response;

      if (directApprove) {
        response = await api.post(
          `/admin/renew-requests/${requestId}/approve`,
          { admin_proposed_date: null }
        );
      } else {
        const formattedDate =
          newDueDate.getFullYear() +
          "-" +
          String(newDueDate.getMonth() + 1).padStart(2, "0") +
          "-" +
          String(newDueDate.getDate()).padStart(2, "0");
        response = await api.post(
          `/admin/renew-requests/${requestId}/approve`,
          { admin_proposed_date: formattedDate }
        );
      }

      toast.success(response.data.message || "Renewal processed successfully");
      fetchRenewRequests();
      setIsDateModalOpen(false);
    } catch (error) {
      console.error("Approval error details:", error.response?.data);
      toast.error(
        error.response?.data?.message ||
          "Failed to process renewal. Please try again later."
      );
    }
  };

  const handleReject = async (requestId) => {
    try {
      await api.post(`/admin/renew-requests/${requestId}/reject`);
      toast.success("Renewal rejected");
      fetchRenewRequests();
    } catch (error) {
      toast.error("Failed to reject renewal");
    }
  };

  const openDateModal = (request) => {
    setSelectedRequest(request);
    setNewDueDate(new Date(request.requested_date || request.current_due_date));
    setIsDateModalOpen(true);
  };

  const handleDelete = async (requestId) => {
    if (
      window.confirm("Are you sure you want to delete this renewal request?")
    ) {
      try {
        await api.delete(`/admin/renew-requests/${requestId}`);
        toast.success("Renewal request deleted successfully");
        fetchRenewRequests(currentPage);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to delete renewal request"
        );
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <SideBar isCollapsed={isSidebarCollapsed} onToggle={handleToggle} />

      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        <HeaderBanner
          book={"Book Renewal Management"}
          heading_pic={heading_pic}
        />
        <Header />
        <div className="p-6">
          {/* Dashboard Header */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 font-serif">
                  Renewal Requests Dashboard
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage all book renewal requests from library patrons
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
                    placeholder="Search requests..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Status Filter */}
                <div className="relative w-full md:w-1/2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="block w-full pl-4 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value={STATUS_PENDING}>Pending</option>
                    <option value={STATUS_PENDING_USER_CONFIRMATION}>
                      Pending User Confirmation
                    </option>
                    <option value={STATUS_APPROVED}>Approved</option>
                    <option value={STATUS_REJECTED}>Rejected</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <FaInfoCircle className="text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-md">
              <FaInfoCircle className="mx-auto text-gray-400 text-4xl mb-3" />
              <h3 className="text-lg font-medium text-gray-900">
                {searchQuery
                  ? "No matching requests found"
                  : "No renewal requests found"}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery
                  ? "Try adjusting your search query"
                  : "There are currently no book renewal requests"}
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
                        Patron
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Due Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Requested Date
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
                      <tr key={request.id} className="hover:bg-gray-50">
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
                                ID: {request.book.id}
                              </div>
                              <div className="text-sm text-gray-500">
                                ISBN: {request.book.isbn}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <FaUser className="text-blue-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {request.user.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {request.user.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(
                            request.current_due_date
                          ).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(
                            request.requested_date
                          ).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              request.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : request.status === "pending_user_confirmation"
                                ? "bg-blue-100 text-blue-800"
                                : request.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : request.status === "rejected" &&
                                  request.admin_notes?.includes(
                                    "Automatically canceled"
                                  )
                                ? "bg-purple-100 text-purple-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {request.status.replace(/_/g, " ")}
                            {request.admin_notes?.includes(
                              "Automatically canceled"
                            ) && " (Expired)"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            {request.status === "pending" && (
                              <>
                                <button
                                  onClick={() => openDateModal(request)}
                                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                                  title="Propose New Date"
                                >
                                  <FaCalendarAlt />
                                </button>
                                <button
                                  onClick={() =>
                                    handleApprove(request.id, true)
                                  }
                                  className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                                  title="Approve As Requested"
                                >
                                  <FaCheck />
                                </button>
                                <button
                                  onClick={() => handleReject(request.id)}
                                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                                  title="Reject"
                                >
                                  <FaTimes />
                                </button>
                              </>
                            )}

                            <button
                              onClick={() => handleDelete(request.id)}
                              className="text-red-600 hover:text-red-900 rounded transition-colors duration-200"
                              title="Delete Request"
                            >
                              <FaTrash className="text-sm" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {filteredRequests.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-white rounded-b-xl shadow-sm">
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
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
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
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    currentPage === totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Date Adjustment Modal */}
        {isDateModalOpen && selectedRequest && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Adjust Renewal Date
                </h2>
                <button
                  onClick={() => setIsDateModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes />
                </button>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select New Due Date
                </label>
                <DatePicker
                  selected={newDueDate}
                  onChange={(date) => setNewDueDate(date)}
                  minDate={new Date(selectedRequest.current_due_date)}
                  maxDate={new Date(selectedRequest.requested_date)}
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  dateFormat="yyyy-MM-dd"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                />
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm font-medium text-gray-700">
                      Current Due Date:
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(
                        selectedRequest.current_due_date
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm font-medium text-gray-700">
                      Requested Date:
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(
                        selectedRequest.requested_date
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsDateModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleApprove(selectedRequest.id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  disabled={!newDueDate}
                >
                  Submit New Date
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RenewBook;
