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
} from "react-icons/fa";
import { loadStripe } from "@stripe/stripe-js";

function Payments() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [overdueBooks, setOverdueBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const heading_pic = process.env.PUBLIC_URL + "/images/heading_pic.jpg";

  const handleToggle = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch payment history
        const paymentsResponse = await api.get("/payments/history");
        setPayments(paymentsResponse.data);

        // Fetch overdue books
        const overdueResponse = await api.get("/borrows/overdue");
        setOverdueBooks(overdueResponse.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load data");
        toast.error("Failed to load payment information");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePayFine = async (borrowId) => {
    try {
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
      toast.error(err.response?.data?.message || "Failed to initiate payment");
    }
  };

  const filteredPayments = payments.filter(
    (payment) =>
      payment.borrow?.book?.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      payment.stripe_payment_id
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <ClientSidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={handleToggle}
        />
        <div className={`flex-1 ${isSidebarCollapsed ? "ml-20" : "ml-64"}`}>
          <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
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
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Payment Center
            </h2>
            <p className="text-gray-600">
              Manage your overdue fines and view payment history
            </p>
          </div>

          {/* Overdue Books Section */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaInfoCircle className="mr-2 text-blue-500" />
              Overdue Books with Fines
            </h3>

            {overdueBooks.length > 0 ? (
              <div className="space-y-4">
                {overdueBooks.map((book) => (
                  <div
                    key={book.id}
                    className="flex justify-between items-center p-4 border border-gray-200 rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium">{book.book.name}</h4>
                      <p className="text-sm text-gray-600">
                        Due: {new Date(book.due_date).toLocaleDateString()} |
                        Fine: ${book.calculateFine().toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => handlePayFine(book.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      Pay Fine
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                No overdue books with unpaid fines
              </div>
            )}
          </div>

          {/* Payment History Section */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Payment History
                </h3>
                <p className="text-sm text-gray-600">
                  Showing {filteredPayments.length} payment
                  {filteredPayments.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="relative w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search payments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {error ? (
              <div className="p-6 text-red-500">{error}</div>
            ) : filteredPayments.length === 0 ? (
              <div className="text-center py-12">
                <FaMoneyBillWave className="mx-auto text-gray-400 text-4xl mb-3" />
                <h3 className="text-lg font-medium text-gray-900">
                  No payments found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery
                    ? "Try adjusting your search"
                    : "You haven't made any payments yet"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Book
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPayments.map((payment) => (
                      <tr
                        key={payment.id}
                        className="hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-10">
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
                                {payment.borrow?.book?.name || "Unknown Book"}
                              </div>
                              <div className="text-xs text-gray-500">
                                ID: {payment.borrow?.book?.id || "N/A"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <FaReceipt className="mr-2 text-gray-400" />
                            <div>
                              <div className="text-sm text-gray-900">
                                {payment.description || "Overdue fine payment"}
                              </div>
                              <div className="text-xs text-gray-500">
                                {payment.stripe_payment_id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div
                            className={`text-sm font-medium ${
                              payment.status === "completed"
                                ? "text-green-600"
                                : "text-yellow-600"
                            }`}
                          >
                            ${payment.amount.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500 capitalize">
                            {payment.status}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <FaCalendarAlt className="mr-2 text-gray-400" />
                            <div className="text-sm text-gray-900">
                              {new Date(
                                payment.created_at
                              ).toLocaleDateString()}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payments;
