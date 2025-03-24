import React, { useState, useEffect } from "react";
import api from "../../Components/Api";
import ClientSidebar from "../../Components/ClientSidebar";
import ClientHeaderBanner from "../components/ClientHeaderBanner";
import { FaSearch, FaUndo, FaSyncAlt, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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
  const [bookAvailability, setBookAvailability] = useState(null);

  const heading_pic = process.env.PUBLIC_URL + "/images/heading_pic.jpg";

  const fetchBorrowedBooks = async () => {
    try {
      const response = await api.get("/borrowed-books");
      setBorrowedBooks(response.data);
    } catch (error) {
      setError("Failed to fetch borrowed books. Please try again later.");
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
    const bookId = document.querySelector('input[placeholder="Book ID"]').value;
    if (!bookId) {
      toast.error("Please enter a book ID.");
      return;
    }

    try {
      const response = await api.post(`/borrowed-books/${bookId}/return`);
      toast.success(response.data.message);
      fetchBorrowedBooks();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to return the book."
      );
    }
  };

  const handleRenewBook = async () => {
    const bookId = document.querySelector('input[placeholder="Book ID"]').value;
    if (!bookId) {
      toast.error("Please enter a book ID.");
      return;
    }

    const selectedBook = borrowedBooks.find(
      (borrow) => borrow.book.id.toString() === bookId
    );
    if (selectedBook) {
      setExactReturnDate(new Date(selectedBook.due_date));
      setSelectedBookId(bookId);
      setIsModalOpen(true);
    } else {
      toast.error("Book not found.");
    }
  };

  const checkBookAvailability = async (bookId) => {
    try {
      const response = await api.get(`/books/${bookId}/availability`);
      return response.data.available;
    } catch (error) {
      console.error("Error checking book availability:", error);
      return false;
    }
  };

  const handleRenewSubmit = async () => {
    if (!renewDate) {
      toast.error("Please select a renewal date.");
      return;
    }

    const formattedDate = renewDate.toISOString().split("T")[0];

    // First check book availability
    const isAvailable = await checkBookAvailability(selectedBookId);

    if (!isAvailable) {
      setIsModalOpen(false);
      setBookAvailability({
        bookId: selectedBookId,
        requestedDate: formattedDate,
      });
      setIsConfirmModalOpen(true);
      return;
    }

    // If available, proceed with renewal
    try {
      const response = await api.post(
        `/borrowed-books/${selectedBookId}/renew-request`,
        { renewDate: formattedDate }
      );
      toast.success("Renewal request sent to admin for approval");
      setIsModalOpen(false);
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
    } catch (error) {
      toast.error("Failed to send notification to admin.");
    }
  };

  return (
    <div className="flex">
      <ClientSidebar isCollapsed={isSidebarCollapsed} onToggle={handleToggle} />
      <div
        className={`transition-all duration-300 ${
          isSidebarCollapsed ? "ml-[5%]" : "ml-[20%]"
        } w-full`}
      >
        <ClientHeaderBanner book={"Borrowed Books"} heading_pic={heading_pic} />

        {/* Search and Action Buttons */}
        <div className="mb-4 flex flex-row sm:flex-row gap-4 p-6">
          <div>
            <p className="text-gray-600">
              You can borrow up to 5 books at a time.
            </p>
          </div>
          <div
            style={{
              backgroundColor: "#f0f4ff",
              padding: "20px",
              borderRadius: "8px",
              width: "500px",
            }}
            className="ml-auto"
          >
            <div className="relative flex-grow mb-2">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
            <div className="relative flex-grow mb-2">
              <h3 className="relative flex-grow mb-1 font-bold ">Book Id:</h3>
              <input
                type="text"
                placeholder="Book ID"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-col gap-2">
              <button
                className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                style={{ backgroundColor: "#001f5b" }}
                onClick={handleReturnBook}
              >
                <FaUndo className="mr-2" /> Return Book
              </button>
              <button
                className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                style={{
                  backgroundColor: "#001f5b",
                }}
                onClick={handleRenewBook}
              >
                <FaSyncAlt className="mr-2" /> Renew Book
              </button>
            </div>
          </div>
        </div>

        {/* Table Section */}
        {loading ? (
          <p className="text-gray-600">Loading borrowed books...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : filteredBooks.length === 0 ? (
          <p className="text-gray-600">No borrowed books found.</p>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-x-auto p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800">
                Borrow History
              </h1>
            </div>
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Book ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBooks.map((borrow) => (
                  <tr key={borrow.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {borrow.book.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {borrow.book.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {borrow.book.isbn}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(borrow.issued_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(borrow.due_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          borrow.status === "Returned"
                            ? "bg-green-100 text-green-800"
                            : borrow.status === "Expired"
                            ? "bg-red-100 text-red-800"
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
        )}

        {/* Renew Book Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Renew Book</h2>
                <FaTimes
                  className="text-gray-500 cursor-pointer"
                  onClick={() => setIsModalOpen(false)}
                />
              </div>
              <div className="mt-4">
                <label className="block text-gray-700">
                  Select Renewal Date:
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
                />
              </div>
              <div className="mt-6">
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  onClick={handleRenewSubmit}
                >
                  Renew
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal for Unavailable Books */}
        {isConfirmModalOpen && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Book Not Available</h2>
                <FaTimes
                  className="text-gray-500 cursor-pointer"
                  onClick={() => setIsConfirmModalOpen(false)}
                />
              </div>
              <div className="mt-4">
                <p>
                  This book is currently not available for renewal. Would you
                  like us to notify you when it becomes available?
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  Your requested renewal date:{" "}
                  {new Date(
                    bookAvailability.requestedDate
                  ).toLocaleDateString()}
                </p>
              </div>
              <div className="mt-6 flex justify-end gap-4">
                <button
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                  onClick={() => setIsConfirmModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  onClick={confirmUnavailableRenewal}
                >
                  Notify Me
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BorrowedBooks;
