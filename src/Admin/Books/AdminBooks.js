import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import SideBar from "../../Components/SideBar";
import heading_pic from "../../images/heading_pic.jpg";
import Header from "../../Components/Header";
import api from "../../Components/Api";
import { useNavigate } from "react-router-dom";

function AdminBooks() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await api.get("/books");
        setBooks(response.data);
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

  return (
    <div className="flex">
      <SideBar isCollapsed={isSidebarCollapsed} onToggle={handleToggle} />
      <div
        className={`transition-all duration-300 ${
          isSidebarCollapsed ? "ml-[5%]" : "ml-[20%]"
        } w-full p-4`}
      >
        <div
          className="h-24 bg-cover bg-center relative brightness-150"
          style={{ backgroundImage: `url(${heading_pic})` }}
        >
          <h1 className="text-4xl font-bold text-black p-6">Books</h1>
        </div>
        <Header />

        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">All Books</h2>
            <button
              onClick={() => navigate("/addBooks")}
              className="text-white px-4 py-2 rounded-lg"
              style={{
                backgroundColor: "#001f5b",
              }}
            >
              Add New Book
            </button>
          </div>

          {loading ? (
            <p>Loading books...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {books.map((book) => (
                <div
                  key={book.id}
                  className="bg-white p-4 shadow-md rounded-lg flex flex-col items-center"
                >
                  <img
                    src={book.image} // Now using the full URL returned from the API
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
                      onClick={() => navigate(`/updateBook/${book.id}`)}
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
