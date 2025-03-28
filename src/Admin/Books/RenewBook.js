import React, { useState, useEffect } from "react";
import SideBar from "../../Components/SideBar";
import HeaderBanner from "../components/HeaderBanner";
import Header from "../../Components/Header";
import { FaCheck, FaTimes, FaCalendarAlt } from "react-icons/fa";
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

  const heading_pic = process.env.PUBLIC_URL + "/images/heading_pic.jpg";

  const fetchRenewRequests = async () => {
    try {
      const response = await api.get("/admin/renew-requests");
      setRenewRequests(response.data);
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
      // Format the date properly before sending
      const formattedDate = new Date(
        newDueDate || selectedRequest.requested_date
      )
        .toISOString()
        .split("T")[0]; // Gets just the YYYY-MM-DD part

      const response = await api.post(
        `/admin/renew-requests/${requestId}/approve`,
        {
          dueDate: formattedDate,
        }
      );

      toast.success(response.data.message || "Renewal approved successfully");
      fetchRenewRequests();
      setIsDateModalOpen(false);
    } catch (error) {
      console.error("Approval error details:", error.response?.data);
      toast.error(
        error.response?.data?.message ||
          "Failed to approve renewal. Please try again later."
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
    setNewDueDate(new Date(request.requested_date));
    setIsDateModalOpen(true);
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
        <HeaderBanner book={"Renew Book"} heading_pic={heading_pic} />

        <div style={{ padding: "20px" }}>
          <div className="flex-1">
            <Header />
          </div>

          <h2 className="text-2xl font-bold mb-6">Renewal Requests</h2>

          <div className="bg-white shadow-md rounded-lg overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">User</th>
                  <th className="px-6 py-3 text-left">Book</th>
                  <th className="px-6 py-3 text-left">Current Due Date</th>
                  <th className="px-6 py-3 text-left">Requested Date</th>
                  <th className="px-6 py-3 text-left">Copies Available</th>
                  <th className="px-6 py-3 text-left">Pending Reservations</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {renewRequests.map((request) => (
                  <tr key={request.id}>
                    <td className="px-6 py-4">{request.user.name}</td>
                    <td className="px-6 py-4">{request.book.name}</td>
                    <td className="px-6 py-4">
                      {new Date(request.current_due_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {new Date(request.requested_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">{request.book.no_of_copies}</td>
                    <td className="px-6 py-4">
                      {request.book.reservations?.length || 0}
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <button
                        onClick={() => openDateModal(request)}
                        className="p-2 text-blue-600 hover:text-blue-800"
                        title="Adjust Date"
                      >
                        <FaCalendarAlt />
                      </button>
                      <button
                        onClick={() => handleApprove(request.id)}
                        className="p-2 text-green-600 hover:text-green-800"
                        title="Approve"
                        disabled={request.book.reservations?.length > 0}
                      >
                        <FaCheck />
                      </button>
                      <button
                        onClick={() => handleReject(request.id)}
                        className="p-2 text-red-600 hover:text-red-800"
                        title="Reject"
                      >
                        <FaTimes />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Date Adjustment Modal */}
      {isDateModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Adjust Renewal Date</h2>
              <FaTimes
                className="text-gray-500 cursor-pointer"
                onClick={() => setIsDateModalOpen(false)}
              />
            </div>
            <div className="mt-4">
              <label className="block mb-2">New Due Date:</label>
              <DatePicker
                selected={newDueDate}
                onChange={(date) => setNewDueDate(date)}
                minDate={new Date(selectedRequest.current_due_date)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mt-6 flex justify-end gap-4">
              <button
                className="px-4 py-2 border rounded"
                onClick={() => setIsDateModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={() => handleApprove(selectedRequest.id)}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RenewBook;
