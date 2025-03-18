import React, { useState, useEffect } from "react";
import SideBar from "../../Components/SideBar";
import HeaderBanner from "../components/HeaderBanner";
import api from "../../Components/Api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "../../Components/Header";

function BookRequests() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const heading_pic = process.env.PUBLIC_URL + "/images/heading_pic.jpg";

  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const response = await api.get("/admin/book-requests");
        setPendingRequests(response.data);
      } catch (error) {
        setError("Failed to fetch pending requests. Please try again later.");
        toast.error(
          "Failed to fetch pending requests. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchPendingRequests();
  }, []);

  const handleToggle = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleApprove = async (borrowId) => {
    try {
      await api.post(`/admin/book-requests/${borrowId}/approve`);
      // Update the status of the request to "Approved" instead of removing it
      setPendingRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.id === borrowId ? { ...request, status: "Approved" } : request
        )
      );
      toast.success("Request approved successfully!");
    } catch (error) {
      setError("Failed to approve request. Please try again later.");
      toast.error("Failed to approve request. Please try again later.");
    }
  };

  const handleReject = async (borrowId) => {
    try {
      await api.post(`/admin/book-requests/${borrowId}/reject`);
      // Update the status of the request to "Rejected" instead of removing it
      setPendingRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.id === borrowId ? { ...request, status: "Rejected" } : request
        )
      );
      toast.success("Request rejected successfully!");
    } catch (error) {
      setError("Failed to reject request. Please try again later.");
      toast.error("Failed to reject request. Please try again later.");
    }
  };

  const handleConfirmGiven = async (borrowId) => {
    try {
      await api.post(`/admin/book-requests/${borrowId}/confirm`);
      // Remove the request from the list after confirming the book is given
      setPendingRequests((prevRequests) =>
        prevRequests.filter((request) => request.id !== borrowId)
      );
      toast.success("Book issued successfully!");
    } catch (error) {
      toast.error("Failed to confirm book given. Please try again later.");
    }
  };

  return (
    <div className="flex">
      <SideBar isCollapsed={isSidebarCollapsed} onToggle={handleToggle} />
      <div
        className={`transition-all duration-300 ${
          isSidebarCollapsed ? "ml-[5%]" : "ml-[20%]"
        } w-full`}
      >
        <HeaderBanner book={"Book Requests"} heading_pic={heading_pic} />

        <div className="p-6">
          <div className="flex-1">
            <Header />
          </div>
          <h2 className="text-2xl font-bold mb-4">
            Welcome to the Book Requests
          </h2>
          {loading ? (
            <p className="text-gray-600">Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      BID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      MID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ISBN
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Issued Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
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
                  {pendingRequests.map((request) => (
                    <tr
                      key={request.id}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.book.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.book.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.user.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.book.isbn}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(request.issued_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(request.due_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {request.status === "Pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(request.id)}
                              className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(request.id)}
                              className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition ml-2"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {request.status === "Approved" && (
                          <button
                            onClick={() => handleConfirmGiven(request.id)}
                            className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition"
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
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default BookRequests;
