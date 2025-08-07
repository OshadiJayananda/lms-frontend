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
  FaFilter,
  FaTrash,
  FaAngleLeft,
  FaAngleRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
} from "react-icons/fa";

function BorrowedHistory() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [filteredBooks, setFilteredBooks] = useState([]); // Initialize as empty array

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [lastPage, setLastPage] = useState(1);

  const heading_pic =
    process.env.REACT_APP_PUBLIC_URL + "/images/heading_pic.jpg";

  const statusOptions = [
    "All",
    "Pending",
    "Approved",
    "Issued",
    "Overdue",
    "Returned",
    "Confirmed",
    "Rejected",
  ];

  const handleToggle = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  const fetchBorrowedBooks = async () => {
    try {
      setLoading(true);
      let url = "/admin/borrowed-books";
      if (statusFilter === "Overdue") {
        url = "/borrows/overdue";
      }

      const response = await api.get(url, {
        params: {
          q: searchQuery,
          per_page: perPage,
          page: currentPage,
        },
      });

      // Ensure we're working with the data array
      const booksData = response.data.data || [];
      setBorrowedBooks(booksData);
      setTotalItems(response.data.total);
      setLastPage(response.data.last_page);
      applyFilters(booksData, searchQuery, statusFilter);
    } catch (error) {
      setError("Failed to fetch borrowed books. Please try again later.");
      toast.error("Failed to load borrowed books data");
    } finally {
      setLoading(false);
    }
  };

  const checkIfOverdue = (borrow) => {
    if (["Returned", "Confirmed", "Rejected"].includes(borrow.status)) {
      return false;
    }
    if (!borrow.due_date) return false;

    const dueDate = new Date(borrow.due_date);
    const today = new Date();
    return dueDate < today;
  };

  const calculateFine = (borrow) => {
    if (!borrow.due_date) return 0;

    const dueDate = new Date(borrow.due_date);
    const today = new Date();
    const diffTime = Math.max(0, today - dueDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const fineRate = 0.5;
    return diffDays * fineRate;
  };

  const applyFilters = (books, query, status) => {
    // Ensure books is always an array
    let filtered = Array.isArray(books) ? [...books] : [];

    if (query) {
      filtered = filtered.filter(
        (borrow) =>
          borrow.book?.id?.toString().includes(query) ||
          borrow.user?.id?.toString().includes(query) ||
          borrow.book?.name?.toLowerCase().includes(query.toLowerCase()) ||
          borrow.book?.isbn?.toLowerCase().includes(query.toLowerCase()) ||
          borrow.user?.name?.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (status !== "All") {
      if (status === "Overdue") {
        filtered = filtered.filter((borrow) => {
          // Check if book is overdue OR returned but fine not paid
          const isOverdue = checkIfOverdue(borrow);
          const isReturnedUnpaid =
            borrow.status === "Returned" && !borrow.fine_paid;
          return isOverdue || isReturnedUnpaid;
        });
      } else {
        filtered = filtered.filter((borrow) => borrow.status === status);
      }
    }

    setFilteredBooks(filtered);
  };

  const deleteBorrowRecord = async (borrowId) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;

    try {
      await api.delete(`/admin/borrowed-books/${borrowId}`);
      toast.success("Borrow record deleted successfully");
      fetchBorrowedBooks();
    } catch (error) {
      toast.error("Failed to delete borrow record");
    }
  };

  useEffect(() => {
    fetchBorrowedBooks();
  }, [currentPage, perPage, statusFilter]);

  useEffect(() => {
    // Reset to first page when search query changes
    setCurrentPage(1);
    fetchBorrowedBooks();
  }, [searchQuery]);

  useEffect(() => {
    applyFilters(borrowedBooks, searchQuery, statusFilter);
  }, [searchQuery, statusFilter, borrowedBooks]);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
  };

  const handlePerPageChange = (event) => {
    setPerPage(Number(event.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= lastPage) {
      setCurrentPage(page);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Returned":
        return "bg-green-100 text-green-800";
      case "Overdue":
        return "bg-red-100 text-red-800";
      case "Issued":
        return "bg-blue-100 text-blue-800";
      case "Confirmed":
        return "bg-purple-100 text-purple-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Approved":
        return "bg-teal-100 text-teal-800";
      case "Rejected":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (lastPage <= maxVisiblePages) {
      for (let i = 1; i <= lastPage; i++) {
        pages.push(i);
      }
    } else {
      const half = Math.floor(maxVisiblePages / 2);
      let start = currentPage - half;
      let end = currentPage + half;

      if (start < 1) {
        start = 1;
        end = maxVisiblePages;
      }

      if (end > lastPage) {
        end = lastPage;
        start = lastPage - maxVisiblePages + 1;
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
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

        <div className="">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div className="flex-1 w-full md:w-auto">
              <Header />
            </div>
          </div>
          <div className="p-6">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center">
                  <FaHistory className="text-blue-600 mr-2" />
                  <h2 className="text-2xl font-bold text-gray-800 font-serif">
                    Borrowed Book History
                  </h2>
                  <span className="ml-4 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {totalItems} records
                  </span>
                </div>

                <div className="w-full md:w-auto flex flex-col md:flex-row gap-3">
                  <div className="relative w-full md:w-64">
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

                  <div className="relative w-full md:w-48">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaFilter className="text-gray-400" />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={handleStatusFilterChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                    >
                      {statusOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-4 text-gray-600">
                    Loading borrowed books...
                  </p>
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
                  <p className="text-gray-500">
                    No borrowed books found matching your criteria
                  </p>
                  {(searchQuery || statusFilter !== "All") && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setStatusFilter("All");
                      }}
                      className="mt-4 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              ) : (
                <>
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
                              <FaUser className="mr-1" /> User
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
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
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
                                    ID: {borrow.book.id} | ISBN:{" "}
                                    {borrow.book.isbn}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {borrow.user.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {borrow.user.id}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {borrow.issued_date
                                  ? new Date(
                                      borrow.issued_date
                                    ).toLocaleDateString()
                                  : "Not Issued"}
                              </div>
                              <div className="text-xs text-gray-500">
                                {borrow.issued_date
                                  ? new Date(
                                      borrow.issued_date
                                    ).toLocaleTimeString()
                                  : ""}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div
                                className={`text-sm ${
                                  borrow.due_date &&
                                  new Date(borrow.due_date) < new Date() &&
                                  !["Returned", "Confirmed"].includes(
                                    borrow.status
                                  )
                                    ? "text-red-600 font-medium"
                                    : "text-gray-900"
                                }`}
                              >
                                {borrow.due_date
                                  ? new Date(
                                      borrow.due_date
                                    ).toLocaleDateString()
                                  : "No Due Date"}
                              </div>
                              <div className="text-xs text-gray-500">
                                {borrow.due_date
                                  ? new Date(
                                      borrow.due_date
                                    ).toLocaleTimeString()
                                  : ""}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                  borrow.is_overdue ? "Overdue" : borrow.status
                                )}`}
                              >
                                {borrow.status === "Confirmed"
                                  ? "Return Confirmed"
                                  : borrow.is_overdue
                                  ? "Overdue"
                                  : borrow.status}
                              </span>
                              {(borrow.is_overdue ||
                                statusFilter === "Overdue") && (
                                <div className="mt-1 text-xs text-red-600">
                                  Fine: ${calculateFine(borrow).toFixed(2)}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => deleteBorrowRecord(borrow.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete record"
                              >
                                <FaTrash />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="px-6 py-4 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700">
                        Showing{" "}
                        <span className="font-medium">
                          {(currentPage - 1) * perPage + 1}
                        </span>{" "}
                        to{" "}
                        <span className="font-medium">
                          {Math.min(currentPage * perPage, totalItems)}
                        </span>{" "}
                        of <span className="font-medium">{totalItems}</span>{" "}
                        results
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
                      <span className="text-sm text-gray-700">per page</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => goToPage(1)}
                        disabled={currentPage === 1}
                        className={`px-2 py-1 rounded-md ${
                          currentPage === 1
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <FaAngleDoubleLeft />
                      </button>
                      <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-2 py-1 rounded-md ${
                          currentPage === 1
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <FaAngleLeft />
                      </button>

                      {getPageNumbers().map((page) => (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`px-3 py-1 rounded-md ${
                            currentPage === page
                              ? "bg-blue-600 text-white"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {page}
                        </button>
                      ))}

                      <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === lastPage}
                        className={`px-2 py-1 rounded-md ${
                          currentPage === lastPage
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <FaAngleRight />
                      </button>
                      <button
                        onClick={() => goToPage(lastPage)}
                        disabled={currentPage === lastPage}
                        className={`px-2 py-1 rounded-md ${
                          currentPage === lastPage
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <FaAngleDoubleRight />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BorrowedHistory;
