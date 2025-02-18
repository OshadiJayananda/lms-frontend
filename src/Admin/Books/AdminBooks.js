import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import SideBar from "../../Components/SideBar";
import heading_pic from "../../images/heading_pic.jpg";
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const [book, setBook] = useState({
    name: "",
    author: "",
    isbn: "",
    image: null,
    description: "",
    no_of_copies: "",
    category_id: "",
  });
  const [message, setMessage] = useState("");

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

    const fetchCategories = async () => {
      try {
        const response = await api.get("/categories");
        if (response.data && response.data.categories) {
          setCategories(response.data.categories);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchBooks();
    fetchCategories();
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

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setBook({
      name: "",
      author: "",
      isbn: "",
      image: null,
      description: "",
      no_of_copies: "",
      category_id: "",
    });
    setMessage("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBook({ ...book, [name]: value });
  };

  const handleFileChange = (e) => {
    setBook({ ...book, image: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const formData = new FormData();
    formData.append("name", book.name);
    formData.append("author", book.author);
    formData.append("isbn", book.isbn);
    formData.append("description", book.description);
    formData.append("no_of_copies", book.no_of_copies);
    formData.append("category_id", book.category_id);
    if (book.image) {
      formData.append("image", book.image);
    }

    try {
      const response = await api.post("/books", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage(response.data.message);
      setBooks([...books, response.data.newBook]); // Update book list
      setFilteredBooks([...books, response.data.newBook]);
      handleModalClose(); // Close modal after successful submission
    } catch (error) {
      console.error("Error adding book:", error);
      setMessage("Failed to add book. Please try again.");
    }
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
                onClick={handleModalOpen}
                className="text-white px-3 py-2 rounded-lg flex items-center"
                style={{ backgroundColor: "#001f5b" }}
              >
                <FaPlus className="text-white" />
              </button>
            </div>
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-96">
            <h2 className="text-2xl font-semibold mb-4">Add a New Book</h2>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <input
                type="text"
                name="name"
                value={book.name}
                onChange={handleChange}
                placeholder="Title"
                required
                className="border w-full p-2 mb-2 rounded"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Add Book
              </button>
            </form>
            <button onClick={handleModalClose} className="mt-3 text-red-500">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminBooks;
