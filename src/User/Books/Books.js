import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import api from "../../Components/Api";
import { useNavigate } from "react-router-dom";
import ClientSidebar from "../../Components/ClientSidebar";
import ClientHeaderBanner from "../components/ClientHeaderBanner";
import { toast } from "react-toastify";

function Books() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [requesting, setRequesting] = useState(false);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const navigate = useNavigate();
  const heading_pic = process.env.PUBLIC_URL + "/images/heading_pic.jpg";

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/categories");
        setCategories(response.data.categories || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await api.get("/books");
        setBooks(response.data);
        setFilteredBooks(response.data);
      } catch (error) {
        console.error("Error fetching books:", error);
        setError("Failed to fetch books. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  useEffect(() => {
    const fetchBorrowedBooks = async () => {
      try {
        const response = await api.get("/borrowed-books");
        setBorrowedBooks(response.data);
      } catch (error) {
        console.error("Error fetching borrowed books:", error);
      }
    };
    fetchBorrowedBooks();
  }, []);

  const handleToggle = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    filterBooks(query, selectedCategory);
  };

  const handleCategoryChange = (event) => {
    const category = event.target.value;
    setSelectedCategory(category);
    filterBooks(searchQuery, category);
  };

  const filterBooks = (query, category) => {
    let filtered = books.filter(
      (book) =>
        book.name.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.isbn.toLowerCase().includes(query)
    );

    if (category !== "All") {
      filtered = filtered.filter((book) => book.category === category);
    }
    setFilteredBooks(filtered);
  };

  const requestBook = async (bookId) => {
    if (
      requesting ||
      borrowedBooks.some(
        (book) =>
          book.book_id === bookId &&
          (book.status === "Pending" ||
            book.status === "Approved" ||
            book.status === "Issued")
      )
    )
      return;

    setRequesting(true);
    try {
      await api.post(`/books/${bookId}/request`);
      setBorrowedBooks([
        ...borrowedBooks,
        { book_id: bookId, status: "Pending" },
      ]);
      toast.success("Book requested successfully!");
    } catch (error) {
      toast.error(
        "Failed to request book: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setRequesting(false);
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
        <ClientHeaderBanner book={"Books"} heading_pic={heading_pic} />

        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="border rounded-lg px-4 py-2"
            >
              <option value="All">All Books</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>

            <div className="flex items-center">
              <input
                type="text"
                placeholder="Search books..."
                value={searchQuery}
                onChange={handleSearch}
                className="border rounded-l-lg px-4 py-2 w-96"
              />
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-r-lg"
                style={{ backgroundColor: "#001f5b" }}
              >
                <FaSearch />
              </button>
            </div>
          </div>

          {loading ? (
            <p>Loading books...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredBooks.map((book) => {
                const isBorrowed = borrowedBooks.some(
                  (borrowedBook) =>
                    borrowedBook.book_id === book.id &&
                    (borrowedBook.status === "Pending" ||
                      borrowedBook.status === "Approved" ||
                      borrowedBook.status === "Issued")
                );
                return (
                  <div
                    key={book.id}
                    className="bg-white p-4 shadow-md rounded-lg flex flex-col items-center"
                  >
                    <img
                      src={book.image}
                      alt={book.name}
                      className="h-40 w-28 object-cover mb-3"
                    />
                    <h3 className="text-lg font-semibold text-center">
                      {book.name}
                    </h3>
                    <p className="text-sm text-gray-600">{book.author}</p>
                    <p className="text-xs text-gray-500">ISBN: {book.isbn}</p>
                    <p className="text-xs text-gray-500">
                      No of Copies: {book.no_of_copies}
                    </p>
                    <button
                      className={`px-4 py-2 mt-2 rounded text-white ${
                        book.no_of_copies > 0 ? "bg-blue-600" : "bg-gray-500"
                      }`}
                      style={{ backgroundColor: "#001f5b" }}
                      onClick={() => requestBook(book.id)}
                      disabled={requesting || isBorrowed}
                    >
                      {isBorrowed
                        ? "Requested"
                        : book.no_of_copies > 0
                        ? requesting
                          ? "Requesting..."
                          : "Request"
                        : "Reserve"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Books;
