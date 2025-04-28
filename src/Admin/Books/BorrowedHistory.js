import React, { useState, useEffect } from "react";
import api from "../../Components/Api";
import SideBar from "../../Components/SideBar";
import HeaderBanner from "../../Components/HeaderBanner";
import Header from "../../Components/Header";
import { toast } from "react-toastify";
import {
  FaSearch,
  FaHistory,
  FaBook,
  FaUser,
  FaCalendarAlt,
  FaClock,
  FaExchangeAlt,
} from "react-icons/fa";

function BorrowedHistory() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredBooks, setFilteredBooks] = useState([]);

  const heading_pic = process.env.PUBLIC_URL + "/images/heading_pic.jpg";

  const handleToggle = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  const fetchBorrowedBooks = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/borrowed-books?q=${searchQuery}`);
      setBorrowedBooks(response.data);
      setFilteredBooks(response.data);
    } catch (error) {
      setError("Failed to fetch borrowed books. Please try again later.");
      toast.error("Failed to load borrowed books data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowedBooks();
  }, []);

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    if (query === "") {
      setFilteredBooks(borrowedBooks);
    } else {
      const filtered = borrowedBooks.filter(
        (borrow) =>
          borrow.book.id.toString().includes(query) ||
          borrow.user.id.toString().includes(query) ||
          borrow.book.name.toLowerCase().includes(query) ||
          borrow.book.isbn.toLowerCase().includes(query)
      );
      setFilteredBooks(filtered);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SideBar isCollapsed={isSidebarCollapsed} onToggle={handleToggle} />

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        <HeaderBanner
          book={"Borrowed History"}
          heading_pic={heading_pic}
          className="w-full"
        />

        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div className="flex-1 w-full md:w-auto">
              <Header />
            </div>

            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by Book/User ID, Name or ISBN..."
                value={searchQuery}
                onChange={handleSearch}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center">
              <FaHistory className="text-blue-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-800 font-serif">
                Borrowed Book History
              </h2>
              <span className="ml-auto bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {filteredBooks.length} records
              </span>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading borrowed books...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <p className="text-red-500">{error}</p>
                <button
                  onClick={fetchBorrowedBooks}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : filteredBooks.length === 0 ? (
              <div className="p-8 text-center">
                <FaBook className="mx-auto text-gray-400 text-4xl mb-3" />
                <p className="text-gray-500">No borrowed books found</p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mt-4 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center">
                          <FaBook className="mr-1" /> Book
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center">
                          <FaUser className="mr-1" /> User ID
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center">
                          <FaCalendarAlt className="mr-1" /> Issued
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center">
                          <FaClock className="mr-1" /> Due
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center">
                          <FaExchangeAlt className="mr-1" /> Status
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredBooks.map((borrow) => (
                      <tr
                        key={borrow.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <FaBook className="text-blue-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {borrow.book.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {borrow.book.id} | ISBN: {borrow.book.isbn}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {borrow.user.id}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(borrow.issued_date).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(borrow.issued_date).toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            className={`text-sm ${
                              new Date(borrow.due_date) < new Date() &&
                              borrow.status !== "Returned"
                                ? "text-red-600 font-medium"
                                : "text-gray-900"
                            }`}
                          >
                            {new Date(borrow.due_date).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(borrow.due_date).toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
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
      </div>
    </div>
  );
}

export default BorrowedHistory;
