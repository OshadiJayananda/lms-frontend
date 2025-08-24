import React, { useState, useEffect, useMemo } from "react";
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
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
} from "react-icons/fa";
import { FiCreditCard } from "react-icons/fi";

function AdminPayments() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  // table data
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // query/pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [perPage, setPerPage] = useState(10);

  // backend totals summary
  const [totalsLoading, setTotalsLoading] = useState(false);
  const [totalsError, setTotalsError] = useState(null);
  const [totalOverdue, setTotalOverdue] = useState(0); // NEW: overdue fine
  const [totalCompleted, setTotalCompleted] = useState(0); // completed payments sum

  const heading_pic =
    process.env.REACT_APP_PUBLIC_URL + "/images/heading_pic.jpg";

  // ---------- Fetch paginated table ----------
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get(`/admin/payments`, {
          params: {
            page: currentPage,
            per_page: perPage,
            q: searchQuery,
          },
        });

        setPayments(response.data.data || []);
        setTotalPages(response.data.last_page || 1);
        setTotalItems(response.data.total || 0);
      } catch (err) {
        const msg = err.response?.data?.message || "Failed to load payments";
        setError(msg);
        toast.error("Failed to load payment information");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [currentPage, perPage, searchQuery]);

  // ---------- Fetch totals from backend summary ----------
  useEffect(() => {
    let cancelled = false;

    const fetchSummary = async () => {
      try {
        setTotalsLoading(true);
        setTotalsError(null);
        setTotalOverdue(0);
        setTotalCompleted(0);

        const { data } = await api.get(`/admin/payments/summary`, {
          params: { q: searchQuery },
        });

        if (!cancelled) {
          setTotalOverdue(Number(data?.total_overdue || 0));
          setTotalCompleted(Number(data?.total_completed || 0));
        }
      } catch (err) {
        if (!cancelled) {
          setTotalsError(
            err.response?.data?.message || "Failed to load totals"
          );
        }
      } finally {
        if (!cancelled) setTotalsLoading(false);
      }
    };

    fetchSummary();
    return () => {
      cancelled = true;
    };
  }, [searchQuery]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handlePerPageChange = (e) => {
    setPerPage(Number(e.target.value));
    setCurrentPage(1);
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

  // Page subtotal (only visible rows)
  const pageSubtotal = useMemo(
    () => payments.reduce((acc, p) => acc + Number(p.amount || 0), 0),
    [payments]
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
      <div className="flex flex-col md:flex-row items-center justify-between px-6 py-4 border-t border-gray-200 gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            Showing{" "}
            <span className="font-medium">
              {(currentPage - 1) * perPage + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min(currentPage * perPage, totalItems)}
            </span>{" "}
            of <span className="font-medium">{totalItems}</span> payments
          </span>

          <select
            value={perPage}
            onChange={handlePerPageChange}
            className="block w-20 pl-3 pr-8 py-1 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            {[5, 10, 20, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className={`p-2 rounded-md ${
              currentPage === 1
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            aria-label="First page"
          >
            <FaAngleDoubleLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`p-2 rounded-md ${
              currentPage === 1
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            aria-label="Previous page"
          >
            <FaChevronLeft className="w-4 h-4" />
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
            className={`p-2 rounded-md ${
              currentPage === totalPages
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            aria-label="Next page"
          >
            <FaChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-md ${
              currentPage === totalPages
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            aria-label="Last page"
          >
            <FaAngleDoubleRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  const formatRs = (n) =>
    `Rs. ${Number(n || 0).toLocaleString("en-LK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

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
            {/* Header + Search */}
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
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1); // reset to first page on new search
                  }}
                  className="block w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Totals Summary (from backend) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Completed payments total */}
              <div className="p-4 border rounded-lg bg-blue-50 border-blue-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-700">
                    Total (Completed Only)
                  </span>
                  <FaMoneyBillWave className="text-blue-600" />
                </div>
                <div className="mt-2 text-2xl font-bold text-blue-900">
                  {totalsLoading ? "Loading..." : formatRs(totalCompleted)}
                </div>
                <div className="text-xs text-blue-700 mt-1">
                  Filter applied: “{searchQuery || "none"}”
                </div>
                {totalsError && (
                  <div className="text-xs text-red-600 mt-1">{totalsError}</div>
                )}
              </div>

              {/* NEW: Overdue fines total */}
              <div className="p-4 border rounded-lg bg-rose-50 border-rose-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-rose-700">
                    Total Overdue Amount (Unpaid)
                  </span>
                  <FaMoneyBillWave className="text-rose-600" />
                </div>
                <div className="mt-2 text-2xl font-bold text-rose-900">
                  {totalsLoading ? "Loading..." : formatRs(totalOverdue)}
                </div>
                <div className="text-xs text-rose-700 mt-1">
                  Based on overdue borrows matching the filter.
                </div>
              </div>

              {/* Current page subtotal */}
              <div className="p-4 border rounded-lg bg-amber-50 border-amber-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-amber-700">
                    Page Subtotal (Visible Rows)
                  </span>
                  <FaMoneyBillWave className="text-amber-600" />
                </div>
                <div className="mt-2 text-2xl font-bold text-amber-900">
                  {loading ? "Loading..." : formatRs(pageSubtotal)}
                </div>
                <div className="text-xs text-amber-700 mt-1">
                  Page {currentPage} • {payments.length} items
                </div>
              </div>
            </div>

            {/* Table / States */}
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
            ) : payments.length === 0 ? (
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
                      {payments.map((payment) => (
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
                                  Book ID: {payment.borrow?.book?.id || "N/A"}
                                </div>
                                <div className="text-xs text-gray-500">
                                  ISBN: {payment.borrow?.book?.isbn || "N/A"}
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
                                  {formatRs(parseFloat(payment.amount || 0))}
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
