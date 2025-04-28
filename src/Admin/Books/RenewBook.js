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
} from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../Components/Api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function RenewBook() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [renewRequests, setRenewRequests] = useState([]);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [newDueDate, setNewDueDate] = useState(null);
  const [loading, setLoading] = useState(true);

  const heading_pic = process.env.PUBLIC_URL + "/images/heading_pic.jpg";

  const fetchRenewRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/renew-requests");
      setRenewRequests(response.data);
    } catch (error) {
      console.error("Error fetching renewal requests:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to fetch renewal requests. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRenewRequests();
  }, []);

  const handleToggle = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleApprove = async (requestId) => {
    try {
      const formattedDate = new Date(newDueDate).toISOString().split("T")[0];

      const response = await api.post(
        `/admin/renew-requests/${requestId}/approve`,
        { dueDate: formattedDate }
      );

      toast.success(response.data.message || "Renewal approved successfully");
      fetchRenewRequests();
      setIsDateModalOpen(false);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to approve renewal. Please try again later."
      );
    }
  };

  const handleReject = async (requestId) => {
    try {
      await api.post(`/admin/renew-requests/${requestId}/reject`);
      toast.success("Renewal request rejected");
      fetchRenewRequests();
    } catch (error) {
      toast.error("Failed to reject renewal");
    }
  };

  const openDateModal = (request) => {
    setSelectedRequest(request);
    setNewDueDate(new Date(request.requested_date));
    setIsDateModalOpen(true);
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
            </div>
          </div>

          {/* Renewal Requests Table */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : renewRequests.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-md">
              <FaInfoCircle className="mx-auto text-gray-400 text-4xl mb-3" />
              <h3 className="text-lg font-medium text-gray-900">
                No renewal requests found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                There are currently no book renewal requests
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Book Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Patron
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Current Due Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Requested Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Availability
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {renewRequests.map((request) => (
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
                                  "/default-book-cover.jpg"
                                }
                                alt={request.book.name}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {request.book.name}
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(
                              request.current_due_date
                            ).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(
                              request.requested_date
                            ).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                request.book.no_of_copies > 0
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {request.book.no_of_copies} available
                            </span>
                            {request.book.reservations?.length > 0 && (
                              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                                {request.book.reservations.length} pending
                                reservations
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openDateModal(request)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition"
                              title="Adjust Date"
                            >
                              <FaCalendarAlt />
                            </button>
                            <button
                              onClick={() => handleApprove(request.id)}
                              className={`p-2 rounded-full transition ${
                                request.book.reservations?.length > 0
                                  ? "text-gray-400 cursor-not-allowed"
                                  : "text-green-600 hover:bg-green-50"
                              }`}
                              title="Approve"
                              disabled={request.book.reservations?.length > 0}
                            >
                              <FaCheck />
                            </button>
                            <button
                              onClick={() => handleReject(request.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-full transition"
                              title="Reject"
                            >
                              <FaTimes />
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
        </div>
      </div>

      {/* Date Adjustment Modal */}
      {isDateModalOpen && (
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
                New Due Date
              </label>
              <DatePicker
                selected={newDueDate}
                onChange={(date) => setNewDueDate(date)}
                minDate={new Date(selectedRequest.current_due_date)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                dateFormat="MMMM d, yyyy"
              />
              <p className="mt-2 text-sm text-gray-500">
                Current due date:{" "}
                {new Date(
                  selectedRequest.current_due_date
                ).toLocaleDateString()}
              </p>
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
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Confirm Renewal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RenewBook;
