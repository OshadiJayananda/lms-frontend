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
  const [activeTab, setActiveTab] = useState("overdue");
  const heading_pic =
    process.env.REACT_APP_PUBLIC_URL + "/images/heading_pic.jpg";

  const handleToggle = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setContentLoading(true);
        if (activeTab === "overdue") {
          const overdueResponse = await api.get("/borrows/overdue");
          setOverdueBooks(overdueResponse.data);
        }
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
        <HeaderBanner book="Payments" heading_pic={heading_pic} />

        <div className="p-4 sm:p-6">
          {/* Header Section */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
              Payment Center
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Manage your overdue fines and view payment history
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="mb-4 sm:mb-6 border-b border-gray-200 overflow-x-auto">
            <nav className="flex space-x-4 sm:space-x-8 min-w-max">
              <button
                onClick={() => setActiveTab("overdue")}
                className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center ${
                  activeTab === "overdue"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FaExclamationTriangle className="mr-1 sm:mr-2" />
                Overdue Fines
                {overdueBooks.length > 0 && (
                  <span className="ml-1 sm:ml-2 inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-2xs sm:text-xs font-medium bg-red-100 text-red-800">
                    {overdueBooks.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center ${
                  activeTab === "history"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FaReceipt className="mr-1 sm:mr-2" />
                Payment History
              </button>
            </nav>
          </div>

          {/* Loading state */}
          {contentLoading ? (
            <div className="flex justify-center items-center py-12 sm:py-20">
              <div className="animate-spin rounded-full h-10 sm:h-12 w-10 sm:w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <>
              {activeTab === "overdue" ? (
                /* Overdue Books Section */
                <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 mb-6 border border-gray-100">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                      Your Overdue Books
                    </h2>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                      <span className="text-xs sm:text-sm text-gray-500">
                        Total fines:{" "}
                        <span className="font-bold text-red-600">
                          Rs.
                          {overdueBooks
                            .reduce((sum, book) => sum + book.fine_amount, 0)
                            .toFixed(2)}
                        </span>
                      </span>
                    </div>
                  </div>

                  {overdueBooks.length > 0 ? (
                    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                      {overdueBooks.map((book) => (
                        <div
                          key={book.id}
                          className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                        >
                          <div className="p-3 sm:p-5">
                            <div className="flex items-start space-x-3 sm:space-x-4">
                              <div className="flex-shrink-0">
                                <img
                                  src={
                                    book.book.image || "/default-book-cover.png"
                                  }
                                  alt={book.book.name}
                                  className="w-12 sm:w-16 h-16 sm:h-20 object-cover rounded"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm sm:text-base font-medium text-gray-900 line-clamp-2">
                                  {book.book.name}
                                </h3>
                                <div className="mt-1 sm:mt-2 space-y-1 text-xs sm:text-sm">
                                  <div className="flex items-center text-gray-600">
                                    <FaCalendarAlt className="mr-1 sm:mr-2 text-gray-400" />
                                    <span>
                                      Due:{" "}
                                      {new Date(
                                        book.due_date
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <div className="flex items-center text-red-600 font-medium">
                                    <FaMoneyBillWave className="mr-1 sm:mr-2" />
                                    <span>
                                      Fine: Rs.{book.fine_amount.toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="bg-gray-50 px-3 sm:px-5 py-2 sm:py-3">
                            <button
                              onClick={() => handlePayFine(book.id)}
                              className="w-full py-1.5 sm:py-2 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded hover:opacity-90 transition flex items-center justify-center text-xs sm:text-sm"
                              disabled={contentLoading}
                            >
                              {contentLoading ? (
                                <>
                                  <svg
                                    className="animate-spin -ml-1 mr-2 h-3 sm:h-4 w-3 sm:w-4 text-white"
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
                    <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg">
                      <FaCheckCircle className="mx-auto text-green-400 text-4xl sm:text-5xl mb-3 sm:mb-4" />
                      <h3 className="text-lg sm:text-xl font-medium text-gray-700 mb-1 sm:mb-2">
                        No Overdue Books
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
                        You don't have any overdue books or pending fines at
                        this time.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* Payment History Section */
                <div className="bg-white rounded-lg sm:rounded-xl shadow-sm overflow-hidden border border-gray-100">
                  <div className="p-4 sm:p-6 border-b border-gray-200">
                    <div className="flex flex-col gap-3 sm:gap-4 md:flex-row justify-between items-start md:items-center">
                      <div>
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                          Payment History
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">
                          {totalPayments} total payment
                          {totalPayments !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="relative w-full md:w-64 lg:w-80">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaSearch className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          placeholder="Search payments..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="block w-full pl-10 pr-3 sm:pr-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  {error ? (
                    <div className="p-6 sm:p-8 text-center">
                      <div className="inline-flex items-center justify-center w-12 sm:w-16 h-12 sm:h-16 bg-red-100 rounded-full mb-3 sm:mb-4">
                        <FaExclamationTriangle className="text-red-500 text-xl sm:text-2xl" />
                      </div>
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1">
                        Unable to load payments
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto mb-3 sm:mb-4">
                        {error}
                      </p>
                      <button
                        onClick={() => window.location.reload()}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-xs sm:text-sm"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : filteredPayments.length === 0 ? (
                    <div className="text-center py-8 sm:py-12">
                      <FaReceipt className="mx-auto text-gray-300 text-4xl sm:text-5xl mb-3 sm:mb-4" />
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">
                        No payment history found
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
                        {searchQuery
                          ? "No payments match your search."
                          : "Your payment history will appear here after you make payments."}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Book
                              </th>
                              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Details
                              </th>
                              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Amount
                              </th>
                              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {filteredPayments.map((payment) => (
                              <tr
                                key={payment.id}
                                className="hover:bg-gray-50 transition-colors"
                              >
                                <td className="px-4 sm:px-6 py-4">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-12 w-8 sm:h-14 sm:w-10">
                                      <img
                                        className="h-full w-full object-cover rounded"
                                        src={
                                          payment.borrow?.book?.image ||
                                          "/default-book-cover.png"
                                        }
                                        alt={payment.borrow?.book?.name}
                                      />
                                    </div>
                                    <div className="ml-3 sm:ml-4 min-w-0">
                                      <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                                        {payment.borrow?.book?.name ||
                                          "Unknown Book"}
                                      </div>
                                      <div className="text-2xs sm:text-xs text-gray-500 mt-1 truncate">
                                        {payment.borrow?.book?.author?.name ||
                                          "Unknown Author"}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 sm:px-6 py-4">
                                  <div className="text-xs sm:text-sm text-gray-900 truncate">
                                    {payment.description ||
                                      "Library fine payment"}
                                  </div>
                                  <div className="text-2xs sm:text-xs text-gray-500 mt-1 font-mono truncate">
                                    ID: {payment.stripe_payment_id}
                                  </div>
                                </td>
                                <td className="px-4 sm:px-6 py-4">
                                  <span className="text-xs sm:text-sm font-medium text-gray-900">
                                    Rs.
                                    {parseFloat(payment.amount || 0).toFixed(2)}
                                  </span>
                                </td>
                                <td className="px-4 sm:px-6 py-4">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                      {payment.status === "completed" ? (
                                        <FaCheckCircle className="text-green-500 text-xs sm:text-sm" />
                                      ) : (
                                        <FaClock className="text-amber-500 text-xs sm:text-sm" />
                                      )}
                                    </div>
                                    <div className="ml-2">
                                      <div className="text-2xs sm:text-xs text-gray-500">
                                        {new Date(
                                          payment.created_at
                                        ).toLocaleDateString()}
                                      </div>
                                      <div
                                        className={`text-2xs sm:text-xs mt-0.5 ${
                                          payment.status === "completed"
                                            ? "text-green-600"
                                            : "text-amber-600"
                                        }`}
                                      >
                                        {payment.status === "completed"
                                          ? "Paid"
                                          : "Pending"}
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
                      <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 bg-gray-50">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                          <div className="text-xs sm:text-sm text-gray-700">
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
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            <button
                              onClick={() =>
                                setCurrentPage((prev) => Math.max(prev - 1, 1))
                              }
                              disabled={currentPage === 1}
                              className={`px-2 sm:px-3 py-1 rounded-md border text-xs ${
                                currentPage === 1
                                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              <FaChevronLeft className="h-2.5 sm:h-3 w-2.5 sm:w-3" />
                            </button>
                            <div className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-700">
                              {currentPage}/{totalPages}
                            </div>
                            <button
                              onClick={() =>
                                setCurrentPage((prev) =>
                                  Math.min(prev + 1, totalPages)
                                )
                              }
                              disabled={currentPage === totalPages}
                              className={`px-2 sm:px-3 py-1 rounded-md border text-xs ${
                                currentPage === totalPages
                                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              <FaChevronRight className="h-2.5 sm:h-3 w-2.5 sm:w-3" />
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
