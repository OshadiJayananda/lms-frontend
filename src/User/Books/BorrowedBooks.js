import React, { useState, useEffect } from "react";
import api from "../../Components/Api";
import ClientSidebar from "../../Components/ClientSidebar";
import ClientHeaderBanner from "../components/ClientHeaderBanner";
import { FaSearch, FaUndo, FaSyncAlt } from "react-icons/fa";
import { toast } from "react-toastify";

function BorrowedBooks() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const heading_pic = process.env.PUBLIC_URL + "/images/heading_pic.jpg";

  // Fetch borrowed books
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

  // Handle search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  // Filter borrowed books based on search query
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
      fetchBorrowedBooks(); // Refresh the list of borrowed books
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to return the book."
      );
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
            className="ml-auto" // Added this class to push it to the right
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
      </div>
    </div>
  );
}

export default BorrowedBooks;
