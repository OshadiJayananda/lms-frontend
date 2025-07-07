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
  FaCheckCircle,
  FaClock,
  FaBook,
} from "react-icons/fa";
import { loadStripe } from "@stripe/stripe-js";

function Payments() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [overdueBooks, setOverdueBooks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPayments, setTotalPayments] = useState(0);
  const [activeTab, setActiveTab] = useState("overdue"); // 'overdue' or 'history'
  const heading_pic = process.env.PUBLIC_URL + "/images/heading_pic.jpg";

  const handleToggle = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setContentLoading(true);

        // Fetch overdue books if on that tab
        if (activeTab === "overdue") {
          const overdueResponse = await api.get("/borrows/overdue");
          setOverdueBooks(overdueResponse.data);
        }

        // Always fetch payment history
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
  }, [currentPage, activeTab]);

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
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 font-serif">
              Payment Center
            </h1>
            <p className="text-gray-600">
              Manage your overdue fines and view payment history
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="mb-6 border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab("overdue")}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === "overdue"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FaExclamationTriangle className="mr-2" />
                Overdue Fines
                {overdueBooks.length > 0 && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {overdueBooks.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === "history"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FaReceipt className="mr-2" />
                Payment History
              </button>
            </nav>
          </div>

          {/* Loading state */}
          {contentLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <>
              {activeTab === "overdue" ? (
                /* Overdue Books Section */
                <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">
                      Your Overdue Books
                    </h2>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-3">
                        Total fines:{" "}
                        <span className="font-bold text-red-600">
                          Rs.
                          {overdueBooks
                            .reduce((sum, book) => sum + book.fine_amount, 0)
                            .toFixed(2)}
                        </span>
                      </span>
                      {/* {overdueBooks.length > 0 && (
                        <button
                          onClick={() => {
                            // Implement bulk payment if needed
                            if (overdueBooks.length > 0) {
                              handlePayFine(overdueBooks[0].id);
                            }
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-lg hover:opacity-90 transition flex items-center"
                        >
                          Pay All Fines
                        </button>
                      )} */}
                    </div>
                  </div>

                  {overdueBooks.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {overdueBooks.map((book) => (
                        <div
                          key={book.id}
                          className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                        >
                          <div className="p-5">
                            <div className="flex items-start space-x-4">
                              <div className="flex-shrink-0">
                                <img
                                  src={
                                    book.book.image || "/default-book-cover.png"
                                  }
                                  alt={book.book.name}
                                  className="w-16 h-20 object-cover rounded"
                                />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-medium text-gray-900 line-clamp-2">
                                  {book.book.name}
                                </h3>
                                <div className="mt-2 space-y-1 text-sm">
                                  <div className="flex items-center text-gray-600">
                                    <FaCalendarAlt className="mr-2 text-gray-400" />
                                    <span>
                                      Due:{" "}
                                      {new Date(
                                        book.due_date
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <div className="flex items-center text-red-600 font-medium">
                                    <FaMoneyBillWave className="mr-2" />
                                    <span>
                                      Fine: Rs.{book.fine_amount.toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="bg-gray-50 px-5 py-3">
                            <button
                              onClick={() => handlePayFine(book.id)}
                              className="w-full py-2 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded hover:opacity-90 transition flex items-center justify-center"
                              disabled={contentLoading}
                            >
                              {contentLoading ? (
                                <>
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
                                </>
                              ) : (
                                "Pay Now"
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <FaCheckCircle className="mx-auto text-green-400 text-5xl mb-4" />
                      <h3 className="text-xl font-medium text-gray-700 mb-2">
                        No Overdue Books
                      </h3>
                      <p className="text-gray-500 max-w-md mx-auto">
                        You don't have any overdue books or pending fines at
                        this time.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* Payment History Section */
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-800">
                          Payment History
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                          {totalPayments} total payment
                          {totalPayments !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="relative w-full md:w-80">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaSearch className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          placeholder="Search payments by book or ID..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        />
                      </div>
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
                      <FaReceipt className="mx-auto text-gray-300 text-5xl mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No payment history found
                      </h3>
                      <p className="text-gray-500 max-w-md mx-auto">
                        {searchQuery
                          ? "No payments match your search. Try different keywords."
                          : "Your payment history will appear here after you make payments."}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Book
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Payment Details
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
                                          "Unknown Author"}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-gray-900">
                                    {payment.description ||
                                      "Library fine payment"}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1 font-mono">
                                    ID: {payment.stripe_payment_id}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="font-medium text-gray-900">
                                    Rs.
                                    {parseFloat(payment.amount || 0).toFixed(2)}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center">
                                    <FaCalendarAlt className="text-gray-400 mr-2" />
                                    <div>
                                      <div className="text-sm text-gray-900">
                                        {new Date(
                                          payment.created_at
                                        ).toLocaleDateString()}
                                      </div>
                                      <div
                                        className={`text-xs mt-1 ${
                                          payment.status === "completed"
                                            ? "text-green-600"
                                            : "text-amber-600"
                                        }`}
                                      >
                                        {payment.status === "completed" ? (
                                          <span className="inline-flex items-center">
                                            <FaCheckCircle className="mr-1" />
                                            Paid
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center">
                                            <FaClock className="mr-1" />
                                            Pending
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="text-sm text-gray-700">
                            Showing{" "}
                            <span className="font-medium">
                              {(currentPage - 1) * 10 + 1}
                            </span>{" "}
                            to{" "}
                            <span className="font-medium">
                              {Math.min(currentPage * 10, totalPayments)}
                            </span>{" "}
                            of{" "}
                            <span className="font-medium">{totalPayments}</span>{" "}
                            payments
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() =>
                                setCurrentPage((prev) => Math.max(prev - 1, 1))
                              }
                              disabled={currentPage === 1}
                              className={`px-3 py-1 rounded-md border ${
                                currentPage === 1
                                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              <FaChevronLeft className="h-3 w-3" />
                            </button>
                            <div className="px-3 py-1 text-sm text-gray-700">
                              Page {currentPage} of {totalPages}
                            </div>
                            <button
                              onClick={() =>
                                setCurrentPage((prev) =>
                                  Math.min(prev + 1, totalPages)
                                )
                              }
                              disabled={currentPage === totalPages}
                              className={`px-3 py-1 rounded-md border ${
                                currentPage === totalPages
                                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              <FaChevronRight className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Payments;
