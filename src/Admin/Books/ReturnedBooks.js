import React, { useState, useEffect } from "react";
import api from "../../Components/Api";
import SideBar from "../../Components/SideBar";
import HeaderBanner from "../../Components/HeaderBanner";
import Header from "../../Components/Header";
import { toast } from "react-toastify";
import {
  FaCheckCircle,
  FaBook,
  FaUser,
  FaCalendarAlt,
  FaSearch,
} from "react-icons/fa";

function ReturnedBooks() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [returnedBooks, setReturnedBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const heading_pic = process.env.PUBLIC_URL + "/images/heading_pic.jpg";

  const fetchReturnedBooks = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/returned-books");
      setReturnedBooks(response.data);
      setFilteredBooks(response.data); // Initialize filtered books with all data
      setError(null);
    } catch (error) {
      console.error("Error fetching returned books:", error);
      setError("Failed to fetch returned books. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturnedBooks();
  }, []);

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredBooks(returnedBooks);
    } else {
      const filtered = returnedBooks.filter((borrow) => {
        const searchLower = searchQuery.toLowerCase();
        return (
          borrow.book.name.toLowerCase().includes(searchLower) ||
          borrow.book.isbn.toLowerCase().includes(searchLower) ||
          borrow.user.name.toLowerCase().includes(searchLower) ||
          borrow.user.id.toString().includes(searchQuery) ||
          borrow.book.id.toString().includes(searchQuery) ||
          new Date(borrow.updated_at).toLocaleDateString().includes(searchQuery)
        );
      });
      setFilteredBooks(filtered);
    }
  }, [searchQuery, returnedBooks]);

  const handleToggle = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleConfirmReturn = async (borrowId) => {
    try {
      const response = await api.post(
        `/admin/returned-books/${borrowId}/confirm`
      );
      toast.success(response.data.message || "Return confirmed successfully");
      fetchReturnedBooks();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to confirm the return."
      );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <SideBar isCollapsed={isSidebarCollapsed} onToggle={handleToggle} />

      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        <HeaderBanner
          book={"Returned Books Management"}
          heading_pic={heading_pic}
        />
        <Header />

        <div className="p-6">
          {/* Dashboard Header */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 font-serif">
                  Returned Books Dashboard
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage and confirm all returned books from library patrons
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search returned books..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Main Content */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <div className="flex">
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
                {searchQuery
                  ? "No matching books found"
                  : "No returned books found"}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery
                  ? "Try adjusting your search query"
                  : "There are currently no books waiting to be confirmed as returned"}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 ">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Book Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Patron
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Return Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Actions
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
                              <div className="text-xs text-gray-500">
                                ID: {borrow.book.id}
                              </div>
                              <div className="text-sm text-gray-500">
                                ISBN: {borrow.book.isbn}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <FaUser className="text-blue-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {borrow.user.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {borrow.user.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FaCalendarAlt className="text-gray-400 mr-2" />
                            <div>
                              <div className="text-sm text-gray-900">
                                {new Date(
                                  borrow.updated_at
                                ).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(
                                  borrow.updated_at
                                ).toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleConfirmReturn(borrow.id)}
                            className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition"
                          >
                            <FaCheckCircle className="mr-2" />
                            Confirm Return
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReturnedBooks;
