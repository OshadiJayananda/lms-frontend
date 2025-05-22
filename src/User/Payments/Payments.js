import React, { useState, useEffect } from "react";
import HeaderBanner from "../../Components/HeaderBanner";
import ClientSidebar from "../../Components/ClientSidebar";
import api from "../../Components/Api";
import { toast } from "react-toastify";
import {
  FaMoneyBillWave,
  FaReceipt,
  FaCalendarAlt,
  FaSearch,
  FaInfoCircle,
  FaChevronLeft,
  FaChevronRight,
  FaExclamationTriangle,
} from "react-icons/fa";
import { loadStripe } from "@stripe/stripe-js";

function Payments() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [overdueBooks, setOverdueBooks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPayments, setTotalPayments] = useState(0);
  const heading_pic = process.env.PUBLIC_URL + "/images/heading_pic.jpg";

  const handleToggle = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setContentLoading(true);
        // Fetch payment history with pagination
        const paymentsResponse = await api.get(
          `/payments/history?page=${currentPage}`
        );
        setPayments(paymentsResponse.data.data);
        setTotalPayments(paymentsResponse.data.total);
        setTotalPages(
          Math.ceil(
            paymentsResponse.data.total / paymentsResponse.data.per_page
          )
        );

        // Fetch overdue books
        const overdueResponse = await api.get("/borrows/overdue");
        setOverdueBooks(overdueResponse.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load payment data");
        toast.error("Failed to load payment information");
      } finally {
        setLoading(false);
        setContentLoading(false);
      }
    };

    fetchData();
  }, [currentPage]);

  const handlePayFine = async (borrowId) => {
    try {
      setContentLoading(true);
      const response = await api.post(
        `/payments/create-checkout-session/${borrowId}`
      );
      const { id } = response.data;

      const stripe = await loadStripe(
        process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY
      );
      const { error } = await stripe.redirectToCheckout({
        sessionId: id,
      });

      if (error) {
        toast.error(error.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Payment initiation failed");
    } finally {
      setContentLoading(false);
    }
  };

  const filteredPayments = payments.filter(
    (payment) =>
      payment.borrow?.book?.name
        ?.toLowerCase()
        ?.includes(searchQuery.toLowerCase()) ||
      payment.stripe_payment_id
        ?.toLowerCase()
        ?.includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      <ClientSidebar isCollapsed={isSidebarCollapsed} onToggle={handleToggle} />
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        <HeaderBanner
          book="Payments"
          heading_pic={heading_pic}
          className="w-full"
        />

        <div className="p-6">
          {/* Header Section - Always visible */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2 font-serif">
              Payment Center
            </h2>
            <p className="text-gray-600">
              View and manage your overdue fines and payment history
            </p>
          </div>

          {/* Loading state for content only */}
          {contentLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <>
              {/* Overdue Books Section */}
              <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                    <FaExclamationTriangle className="mr-3 text-amber-500" />
                    Overdue Books with Fines
                  </h3>
                  <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                    {overdueBooks.length} item
                    {overdueBooks.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {overdueBooks.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {overdueBooks.map((book) => (
                      <div
                        key={book.id}
                        className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start space-x-4">
                          <img
                            src={book.book.image || "/default-book-cover.png"}
                            alt={book.book.name}
                            className="w-16 h-20 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 line-clamp-2">
                              {book.book.name}
                            </h4>
                            <div className="mt-2 space-y-1 text-sm">
                              <p className="text-gray-600">
                                <span className="font-medium">Due:</span>{" "}
                                {new Date(book.due_date).toLocaleDateString()}
                              </p>
                              <p className="text-red-600 font-medium">
                                <span className="font-medium">Fine:</span> Rs.
                                {book.fine_amount.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handlePayFine(book.id)}
                          className="mt-4 w-full py-2 bg-gradient-to-r from-red-600 to-amber-600 text-white rounded-lg hover:opacity-90 transition flex items-center justify-center"
                          disabled={contentLoading}
                        >
                          {contentLoading ? "Processing..." : "Pay Fine Now"}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <FaMoneyBillWave className="mx-auto text-gray-300 text-4xl mb-3" />
                    <h3 className="text-lg font-medium text-gray-700">
                      No overdue fines
                    </h3>
                    <p className="mt-1 text-gray-500">
                      You don't have any outstanding fines at this time
                    </p>
                  </div>
                )}
              </div>

              {/* Payment History Section */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 font-serif">
                      Payment History
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {totalPayments} payment{totalPayments !== 1 ? "s" : ""} in
                      total
                    </p>
                  </div>
                  <div className="relative w-full md:w-72">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaSearch className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search by book or payment ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>

                {error ? (
                  <div className="p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                      <FaExclamationTriangle className="text-red-500 text-2xl" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      Unable to load payments
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto">{error}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                      Try Again
                    </button>
                  </div>
                ) : filteredPayments.length === 0 ? (
                  <div className="text-center py-12">
                    <FaReceipt className="mx-auto text-gray-300 text-4xl mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">
                      No payments found
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchQuery
                        ? "No matching payments found. Try a different search."
                        : "Your payment history will appear here once you make payments."}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-sans">
                              Book Details
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-sans">
                              Payment Info
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-sans">
                              Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-sans">
                              Date Paid
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
                                  <div className="flex-shrink-0 h-14 w-10">
                                    <img
                                      className="h-full w-full object-cover rounded"
                                      src={
                                        payment.borrow?.book?.image ||
                                        "/default-book-cover.png"
                                      }
                                      alt={payment.borrow?.book?.name}
                                    />
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {payment.borrow?.book?.name ||
                                        "Unknown Book"}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      {payment.borrow?.book?.author?.name ||
                                        "N/A"}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-start">
                                  <FaReceipt className="mt-1 mr-2 text-indigo-400" />
                                  <div>
                                    <div className="text-sm text-gray-900">
                                      {payment.description ||
                                        "Library fine payment"}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1 font-mono">
                                      {payment.stripe_payment_id}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    payment.status === "completed"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-amber-100 text-amber-800"
                                  }`}
                                >
                                  Rs.
                                  {parseFloat(payment.amount || 0).toFixed(2)}
                                </div>
                                <div className="text-xs text-gray-500 mt-1 capitalize">
                                  {payment.status}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <FaCalendarAlt className="mr-2 text-gray-400" />
                                  <div className="text-sm text-gray-900">
                                    {new Date(
                                      payment.created_at
                                    ).toLocaleString(undefined, {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Controls */}
                    <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 bg-gray-50">
                      <div className="flex-1 flex justify-between sm:hidden">
                        <button
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages)
                            )
                          }
                          disabled={currentPage === totalPages}
                          className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm text-gray-700">
                            Showing page{" "}
                            <span className="font-medium">{currentPage}</span>{" "}
                            of <span className="font-medium">{totalPages}</span>
                          </p>
                        </div>
                        <div>
                          <nav
                            className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                            aria-label="Pagination"
                          >
                            <button
                              onClick={() =>
                                setCurrentPage((prev) => Math.max(prev - 1, 1))
                              }
                              disabled={currentPage === 1}
                              className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-indigo-50 disabled:opacity-50 transition"
                            >
                              <span className="sr-only">Previous</span>
                              <FaChevronLeft className="h-4 w-4" />
                            </button>
                            {Array.from(
                              { length: Math.min(5, totalPages) },
                              (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                  pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                  pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                  pageNum = totalPages - 4 + i;
                                } else {
                                  pageNum = currentPage - 2 + i;
                                }
                                return (
                                  <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                      currentPage === pageNum
                                        ? "z-10 bg-indigo-600 border-indigo-600 text-white"
                                        : "bg-white border-gray-300 text-gray-700 hover:bg-indigo-50"
                                    }`}
                                  >
                                    {pageNum}
                                  </button>
                                );
                              }
                            )}
                            <button
                              onClick={() =>
                                setCurrentPage((prev) =>
                                  Math.min(prev + 1, totalPages)
                                )
                              }
                              disabled={currentPage === totalPages}
                              className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-indigo-50 disabled:opacity-50 transition"
                            >
                              <span className="sr-only">Next</span>
                              <FaChevronRight className="h-4 w-4" />
                            </button>
                          </nav>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Payments;
