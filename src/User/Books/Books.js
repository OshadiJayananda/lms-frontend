import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaBook,
  FaUserAlt,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import api from "../../Components/Api";
import ClientSidebar from "../../Components/ClientSidebar";
import { toast } from "react-toastify";
import HeaderBanner from "../../Components/HeaderBanner";

function Books() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [requesting, setRequesting] = useState(false);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [reservedBooks, setReservedBooks] = useState([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [requestingBookId, setRequestingBookId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalBooks, setTotalBooks] = useState(0);

  const heading_pic = process.env.PUBLIC_URL + "/images/heading_pic.jpg";

  useEffect(() => {
    const fetchCategories = async () => {
      setIsCategoriesLoading(true);
      try {
        const response = await api.get("/categories");
        const categoriesData = Array.isArray(response.data?.data)
          ? response.data.data
          : Array.isArray(response.data)
          ? response.data
          : [];
        setCategories(categoriesData);
        setError(null);
      } catch (err) {
        console.error("Fetch categories error:", err);
        setError("Failed to load categories");
        setCategories([]);
      } finally {
        setIsCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchReservedBooks = async () => {
      try {
        const response = await api.get("/book-reservations");
        setReservedBooks(response.data || []);
      } catch (error) {
        console.error("Error fetching reserved books:", error);
      }
    };
    fetchReservedBooks();
  }, []);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        let url = `/books?page=${currentPage}&per_page=${perPage}`;

        if (selectedCategory) {
          url += `&category=${selectedCategory}`;
        }
        if (searchQuery) {
          url += `&q=${searchQuery}`;
        }

        const response = await api.get(url);
        console.log("API Response:", response.data);

        setFilteredBooks(response.data.data || []);
        setTotalPages(response.data.last_page || 1);
        setTotalBooks(response.data.total || 0);
      } catch (error) {
        console.error("Error fetching books:", error);
        setError("Failed to fetch books. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, [selectedCategory, searchQuery, currentPage, perPage]);

  useEffect(() => {
    const fetchBorrowedBooks = async () => {
      try {
        const response = await api.get("/borrowed-books");
        const booksData = response.data?.data || response.data || [];
        setBorrowedBooks(booksData);
      } catch (error) {
        console.error("Error fetching borrowed books:", error);
        setBorrowedBooks([]);
      }
    };
    fetchBorrowedBooks();
  }, []);

  const handleToggle = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
    setCurrentPage(1);
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const requestBook = async (bookId) => {
    if (
      requesting ||
      (Array.isArray(borrowedBooks) &&
        borrowedBooks.some(
          (book) =>
            book.book_id === bookId &&
            (book.status === "Pending" ||
              book.status === "Approved" ||
              book.status === "Issued")
        ))
    ) {
      toast.info(
        "This book is already requested. Confirmation is still pending."
      );
      return;
    }

    setRequesting(true);
    setRequestingBookId(bookId);
    try {
      const response = await api.post(`/books/${bookId}/request`);
      setBorrowedBooks([
        ...(Array.isArray(borrowedBooks) ? borrowedBooks : []),
        { book_id: bookId, status: "Pending" },
      ]);
      toast.success(response.data.message || "Book requested successfully!");
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      if (error.response?.status === 400) {
        toast.info(errorMessage);
      } else {
        toast.error("Failed to request book: " + errorMessage);
      }
    } finally {
      setRequesting(false);
      setRequestingBookId(null);
    }
  };

  const isBookReserved = (bookId) => {
    return reservedBooks.some((book) => book.id === bookId);
  };

  const reserveBook = async (bookId) => {
    if (isBookReserved(bookId)) {
      toast.info("This book is already reserved.");
      return;
    }

    try {
      const response = await api.post(
        `/books/${bookId}/reserve`,
        {
          reservation_date: new Date().toISOString().split("T")[0],
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      toast.success(response.data.message);
      setReservedBooks((prev) => [...prev, { id: bookId }]);
      setFilteredBooks((prev) =>
        prev.map((book) =>
          book.id === bookId ? { ...book, is_reserved: true } : book
        )
      );
      return response.data;
    } catch (error) {
      console.error(
        "Reservation error:",
        error.response?.data || error.message
      );
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to reserve book";
      toast.error(errorMessage);
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1 && filteredBooks.length <= perPage) return null;

    return (
      <div className="flex flex-col sm:flex-row justify-between items-center mt-8 bg-white p-4 rounded-lg shadow-md gap-4">
        <div className="flex items-center">
          <span className="text-sm text-gray-700">
            Showing {(currentPage - 1) * perPage + 1} to{" "}
            {Math.min(currentPage * perPage, totalBooks)} of {totalBooks} books
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`p-2 rounded-md ${
              currentPage === 1
                ? "text-gray-400 cursor-not-allowed"
                : "text-blue-600 hover:bg-blue-50"
            }`}
          >
            <FaChevronLeft />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-1 rounded-md ${
                currentPage === page
                  ? "bg-blue-600 text-white"
                  : "text-blue-600 hover:bg-blue-50"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-md ${
              currentPage === totalPages
                ? "text-gray-400 cursor-not-allowed"
                : "text-blue-600 hover:bg-blue-50"
            }`}
          >
            <FaChevronRight />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">Items per page:</span>
          <select
            value={perPage}
            onChange={(e) => {
              const newPerPage = Number(e.target.value);
              setPerPage(newPerPage);
              setCurrentPage(1);
            }}
            className="border rounded-md px-2 py-1 text-sm"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="30">30</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <ClientSidebar isCollapsed={isSidebarCollapsed} onToggle={handleToggle} />

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        <HeaderBanner
          book={"Books"}
          heading_pic={heading_pic}
          className="w-full"
        />
        <div className="p-6">
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 font-serif mb-6">
              Discover Our Collection
            </h2>

            <div className="flex flex-col md:flex-row items-end gap-4 w-full">
              <div className="w-full md:w-1/3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Category
                </label>
                {isCategoriesLoading ? (
                  <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 animate-pulse">
                    Loading categories...
                  </div>
                ) : (
                  <select
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="relative w-full md:flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1 md:sr-only">
                  Search
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search books..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

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
                No books found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery
                  ? "Try adjusting your search or filter"
                  : "The library catalog is currently empty"}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredBooks.map((book) => {
                  const isBorrowed =
                    Array.isArray(borrowedBooks) &&
                    borrowedBooks.some(
                      (borrowedBook) =>
                        borrowedBook.book_id === book.id &&
                        ["pending", "approved", "issued"].includes(
                          borrowedBook.status?.toLowerCase()
                        )
                    );

                  const isReserved = reservedBooks.some(
                    (resBook) =>
                      resBook.book_id === book.id &&
                      resBook.status?.toLowerCase() === "pending"
                  );

                  const isUnavailable = isBorrowed || isReserved;

                  return (
                    <div
                      key={book.id}
                      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                    >
                      <div className="relative pb-[150%]">
                        <img
                          src={book.image || "/default-book-cover.png"}
                          alt={book.name}
                          className="absolute h-full w-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {book.name}
                        </h3>
                        <div className="flex items-center mt-1 text-sm text-gray-600">
                          <FaUserAlt className="mr-1 text-gray-400" />
                          <span className="truncate">{book.author?.name}</span>
                        </div>
                        <div className="mt-2 flex justify-between items-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <FaBook className="mr-1" />
                            {book.no_of_copies > 0
                              ? `${book.no_of_copies} available`
                              : "Not available"}
                          </span>
                          <button
                            onClick={() =>
                              book.no_of_copies > 0
                                ? requestBook(book.id)
                                : reserveBook(book.id)
                            }
                            disabled={
                              requestingBookId === book.id || isUnavailable
                            }
                            className={`px-3 py-1 text-sm rounded-md font-medium transition-colors ${
                              requestingBookId === book.id || isUnavailable
                                ? "bg-gray-200 text-gray-600 cursor-not-allowed"
                                : book.no_of_copies > 0
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : "bg-purple-600 text-white hover:bg-purple-700"
                            }`}
                          >
                            {isBorrowed
                              ? "Requested"
                              : isReserved
                              ? "Reserved"
                              : requestingBookId === book.id
                              ? "Processing..."
                              : book.no_of_copies > 0
                              ? "Borrow"
                              : "Reserve"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {renderPagination()}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Books;
