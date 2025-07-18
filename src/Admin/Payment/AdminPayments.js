import React, { useState, useEffect } from "react";
import SideBar from "../../Components/SideBar";
import HeaderBanner from "../../Components/HeaderBanner";
import Header from "../../Components/Header";
import api from "../../Components/Api";
import { toast } from "react-toastify";
import {
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaMoneyBillWave,
  FaBook,
  FaCalendarAlt,
  FaInfoCircle,
  FaUser,
} from "react-icons/fa";
import { FiCreditCard } from "react-icons/fi";

function AdminPayments() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const heading_pic = process.env.PUBLIC_URL + "/images/heading_pic.jpg";

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/admin/payments?page=${currentPage}`);
        setPayments(response.data.data);
        setTotalPages(response.data.last_page);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load payments");
        toast.error("Failed to load payment information");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const filteredPayments = payments.filter(
    (payment) =>
      payment.borrow?.book?.name
        ?.toLowerCase()
        ?.includes(searchQuery.toLowerCase()) ||
      payment.stripe_payment_id
        ?.toLowerCase()
        ?.includes(searchQuery.toLowerCase()) ||
      payment.description?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
      payment.amount?.toString()?.includes(searchQuery) ||
      payment.borrow?.user?.name
        ?.toLowerCase()
        ?.includes(searchQuery.toLowerCase()) ||
      payment.borrow?.user?.email
        ?.toLowerCase()
        ?.includes(searchQuery.toLowerCase())
  );

  const renderPagination = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          Showing {payments.length} of {totalPages * 10} payments
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50"
            aria-label="First page"
          >
            «
          </button>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50"
            aria-label="Previous page"
          >
            <FaChevronLeft />
          </button>

          {startPage > 1 && (
            <span className="px-3 py-1 text-gray-500">...</span>
          )}

          {pageNumbers.map((number) => (
            <button
              key={number}
              onClick={() => handlePageChange(number)}
              className={`px-3 py-1 rounded-md ${
                currentPage === number
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {number}
            </button>
          ))}

          {endPage < totalPages && (
            <span className="px-3 py-1 text-gray-500">...</span>
          )}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50"
            aria-label="Next page"
          >
            <FaChevronRight />
          </button>
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50"
            aria-label="Last page"
          >
            »
          </button>
        </div>
      </div>
    );
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      completed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      failed: "bg-red-100 text-red-800",
      refunded: "bg-purple-100 text-purple-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
          statusClasses[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <SideBar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!isSidebarCollapsed)}
      />
      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        <HeaderBanner book={"Admin Payments"} heading_pic={heading_pic} />
        <Header />

        <div className="p-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2 font-serif">
                  Payment Center
                </h2>
                <p className="text-gray-600 text-lg">
                  Manage and view all payment transactions
                </p>
              </div>
              <div className="relative w-full md:w-80">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search payments by book, user, amount..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Loading payment data...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <div className="flex items-center">
                  <FaInfoCircle className="text-red-500 mr-2" />
                  <p className="text-red-700">{error}</p>
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Try again
                </button>
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <FiCreditCard className="mx-auto text-gray-400 text-4xl mb-3" />
                <h3 className="text-lg font-medium text-gray-900">
                  {searchQuery
                    ? "No matching payments found"
                    : "No payments recorded yet"}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery
                    ? "Try adjusting your search query"
                    : "Payments will appear here once processed"}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Book
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Transaction
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date & Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredPayments.map((payment) => (
                        <tr
                          key={payment.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-14 w-10 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                                {payment.borrow?.book?.image ? (
                                  <img
                                    className="h-full w-full object-cover"
                                    src={payment.borrow.book.image}
                                    alt={payment.borrow.book.name}
                                  />
                                ) : (
                                  <FaBook className="text-gray-400" />
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {payment.borrow?.book?.name || "Unknown Book"}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {payment.borrow?.book?.isbn || "N/A"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center">
                                <FaUser className="text-blue-500" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {payment.borrow?.user?.name || "Unknown User"}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {payment.borrow?.user?.email || "N/A"}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  ID: {payment.borrow?.user?.id || "N/A"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <FiCreditCard className="text-blue-500 mr-3" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {payment.description ||
                                    "Overdue fine payment"}
                                </div>
                                <div className="text-xs text-gray-500 font-mono mt-1">
                                  {payment.stripe_payment_id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <FaMoneyBillWave className="text-green-500 mr-2" />
                              <div>
                                <div className="text-sm font-semibold text-gray-900">
                                  Rs.{" "}
                                  {parseFloat(payment.amount || 0).toFixed(2)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {payment.payment_method || "Credit Card"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <FaCalendarAlt className="text-gray-400 mr-2" />
                              <div>
                                <div className="text-sm text-gray-900">
                                  {new Date(
                                    payment.created_at
                                  ).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </div>
                                <div className="mt-1">
                                  {getStatusBadge(payment.status)}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {totalPages > 1 && renderPagination()}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPayments;
