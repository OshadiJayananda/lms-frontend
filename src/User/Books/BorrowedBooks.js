import React, { useState, useEffect } from "react";
import api from "../../Components/Api";
import ClientSidebar from "../../Components/ClientSidebar";
import {
  FaSearch,
  FaUndo,
  FaSyncAlt,
  FaTimes,
  FaBook,
  FaCalendarAlt,
  FaInfoCircle,
  FaUserAlt,
} from "react-icons/fa";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import HeaderBanner from "../../Components/HeaderBanner";

function BorrowedBooks() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [exactReturnDate, setExactReturnDate] = useState(null);
  const [renewDate, setRenewDate] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [bookAvailability] = useState(null);
  const [selectedBookIdInput, setSelectedBookIdInput] = useState("");

  const heading_pic = process.env.PUBLIC_URL + "/images/heading_pic.jpg";

  const fetchBorrowedBooks = async () => {
    try {
      const response = await api.get("/borrowed-books");
      setBorrowedBooks(response.data);
    } catch (error) {
      setError("Failed to fetch borrowed books. Please try again later.");
      toast.error("Failed to load your borrowed books");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowedBooks();
  }, []);

  const handleToggle = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const filteredBooks = borrowedBooks.filter(
    (borrow) =>
      borrow.book.name.toLowerCase().includes(searchQuery) ||
      borrow.book.isbn.toLowerCase().includes(searchQuery) ||
      borrow.book.id.toString().includes(searchQuery)
  );

  const handleReturnBook = async () => {
    if (!selectedBookIdInput) {
      toast.error("Please enter a book ID.");
      return;
    }

    try {
      const response = await api.post(
        `/borrowed-books/${selectedBookIdInput}/return`
      );
      toast.success(response.data.message);
      setSelectedBookIdInput("");
      fetchBorrowedBooks();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to return the book."
      );
    }
  };

  const handleRenewBook = async () => {
    if (!selectedBookIdInput) {
      toast.error("Please enter a book ID.");
      return;
    }

    const selectedBook = borrowedBooks.find(
      (borrow) => borrow.book.id.toString() === selectedBookIdInput
    );

    if (selectedBook) {
      setExactReturnDate(new Date(selectedBook.due_date));
      setSelectedBookId(selectedBookIdInput);
      setIsModalOpen(true);
    } else {
      toast.error("Book not found in your borrowed items.");
    }
  };

  const handleRenewSubmit = async () => {
    if (!renewDate) {
      toast.error("Please select a renewal date.");
      return;
    }

    const formattedDate =
      renewDate.getFullYear() +
      "-" +
      String(renewDate.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(renewDate.getDate()).padStart(2, "0");

    try {
      const response = await api.post(
        `/borrowed-books/${selectedBookId}/renew-request`,
        { renewDate: formattedDate }
      );
      toast.success(
        response.data.message || "Renewal request sent to admin for approval"
      );
      setIsModalOpen(false);
      setSelectedBookIdInput("");
      fetchBorrowedBooks();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to send renewal request."
      );
    }
  };

  const confirmUnavailableRenewal = async () => {
    try {
      await api.post(
        `/borrowed-books/${bookAvailability.bookId}/notify-admin`,
        {
          requestedDate: bookAvailability.requestedDate,
        }
      );
      toast.info(
        "We've notified the admin about your interest. You'll be notified when copies become available."
      );
      setIsConfirmModalOpen(false);
      setSelectedBookIdInput("");
    } catch (error) {
      toast.error("Failed to send notification to admin.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ClientSidebar isCollapsed={isSidebarCollapsed} onToggle={handleToggle} />
      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        <HeaderBanner book={"My Borrowed Books"} heading_pic={heading_pic} />

        <div className="p-6">
          {/* Search and Action Section */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  Manage Your Books
                </h2>
                <div className="flex items-center text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-lg">
                  <FaInfoCircle className="mr-2 text-blue-500" />
                  You can borrow up to 5 books at a time
                </div>
              </div>

              <div className="w-full md:w-1/2">
                <div className="relative mb-4">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by title, ISBN, or book ID..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Book ID for Actions:
                    </label>
                    <input
                      type="text"
                      placeholder="Enter book ID"
                      value={selectedBookIdInput}
                      onChange={(e) => setSelectedBookIdInput(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-end gap-2">
                    <button
                      className="flex-1 flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                      onClick={handleReturnBook}
                      disabled={!selectedBookIdInput}
                    >
                      <FaUndo className="mr-2" /> Return
                    </button>
                    <button
                      className="flex-1 flex items-center justify-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                      onClick={handleRenewBook}
                      disabled={!selectedBookIdInput}
                    >
                      <FaSyncAlt className="mr-2" /> Renew
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Borrowed Books Table */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-md">
              <FaBook className="mx-auto text-gray-400 text-4xl mb-3" />
              <h3 className="text-lg font-medium text-gray-900">
                No borrowed books found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery
                  ? "Try adjusting your search"
                  : "You haven't borrowed any books yet"}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">
                  Your Borrow History
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Showing {filteredBooks.length} book
                  {filteredBooks.length !== 1 ? "s" : ""}
                </p>
              </div>

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
                        Dates
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredBooks.map((borrow) => (
                      <tr
                        key={borrow.id}
                        className="hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-16 w-12">
                              <img
                                className="h-full w-full object-cover rounded"
                                src={
                                  borrow.book.image || "/default-book-cover.png"
                                }
                                alt={borrow.book.name}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {borrow.book.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            <div className="text-sm text-gray-500">
                              ID: {borrow.book.id}
                            </div>
                            <div className="text-sm text-gray-500">
                              ISBN: {borrow.book.isbn}
                            </div>
                            <div className="text-sm text-gray-500">
                              Author:{" "}
                              {borrow.book.author?.name || "Unknown Author"}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            <div className="flex items-center mb-1">
                              <FaCalendarAlt className="mr-2 text-gray-400" />
                              <span className="font-medium">Issued:</span>{" "}
                              {new Date(
                                borrow.issued_date
                              ).toLocaleDateString()}
                            </div>
                            <div className="flex items-center">
                              <FaCalendarAlt className="mr-2 text-gray-400" />
                              <span className="font-medium">Due:</span>{" "}
                              {new Date(borrow.due_date).toLocaleDateString()}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              borrow.status === "Returned"
                                ? "bg-green-100 text-green-800"
                                : borrow.status === "Expired"
                                ? "bg-red-100 text-red-800"
                                : borrow.status === "Renewed"
                                ? "bg-blue-100 text-blue-800" // New status color
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {borrow.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Renew Book Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">
                    Renew Your Book
                  </h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FaTimes size={20} />
                  </button>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Current due date:{" "}
                    <span className="font-medium">
                      {exactReturnDate?.toLocaleDateString()}
                    </span>
                  </p>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select new return date:
                  </label>
                  <DatePicker
                    selected={renewDate}
                    onChange={(date) => setRenewDate(date)}
                    minDate={exactReturnDate}
                    maxDate={
                      new Date(
                        exactReturnDate.getTime() + 30 * 24 * 60 * 60 * 1000
                      )
                    }
                    inline
                    highlightDates={[exactReturnDate]}
                    className="border rounded-lg p-2 w-full"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRenewSubmit}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    disabled={!renewDate}
                  >
                    Submit Renewal
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Confirmation Modal for Unavailable Books */}
          {isConfirmModalOpen && (
            <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">
                    Book Currently Unavailable
                  </h2>
                  <button
                    onClick={() => setIsConfirmModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FaTimes size={20} />
                  </button>
                </div>

                <div className="mb-6">
                  <p className="text-gray-700 mb-3">
                    This book is currently checked out by another patron. We can
                    notify you when it becomes available.
                  </p>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Your requested date:</span>{" "}
                      {new Date(
                        bookAvailability?.requestedDate
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setIsConfirmModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmUnavailableRenewal}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Notify Me When Available
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BorrowedBooks;
