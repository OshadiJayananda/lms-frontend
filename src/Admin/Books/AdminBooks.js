import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import SideBar from "../../Components/SideBar";
import Header from "../../Components/Header";
import api from "../../Components/Api";
import { useNavigate } from "react-router-dom";
import HeaderBanner from "../components/HeaderBanner";

function AdminBooks() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const heading_pic = process.env.PUBLIC_URL + "/images/heading_pic.jpg";

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

  const handleToggle = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredBooks(
      books.filter(
        (book) =>
          book.name.toLowerCase().includes(query) ||
          book.author.toLowerCase().includes(query) ||
          book.isbn.toLowerCase().includes(query)
      )
    );
  };

  return (
    <div className="flex">
      <SideBar isCollapsed={isSidebarCollapsed} onToggle={handleToggle} />
      <div
        className={`transition-all duration-300 ${
          isSidebarCollapsed ? "ml-[5%]" : "ml-[20%]"
        } w-full`}
      >
        <HeaderBanner book={"Book Section"} heading_pic={heading_pic} />

        <div className="p-6">
          <div className="flex justify-between items-center mb-2">
            <div className="flex-1">
              <Header />
            </div>
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Search books..."
                value={searchQuery}
                onChange={handleSearch}
                className="border rounded-lg px-5 py-2 w-96"
              />
              <button
                onClick={() => navigate("/addBooks")}
                className="text-white px-3 py-2 rounded-lg flex items-center"
                style={{ backgroundColor: "#001f5b" }}
              >
                <FaPlus className="text-white" />
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">All Books</h2>
          </div>

          {loading ? (
            <p>Loading books...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {filteredBooks.map((book) => (
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
                  <div className="flex space-x-3 mt-2">
                    <FaEdit
                      className="text-blue-600 cursor-pointer"
                      onClick={() => navigate(/updateBook/`${book.id}`)}
                    />
                    <FaTrash className="text-red-600 cursor-pointer" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminBooks;
