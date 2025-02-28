import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus, FaTimes } from "react-icons/fa";
import SideBar from "../../Components/SideBar";
import Header from "../../Components/Header";
import api from "../../Components/Api";
import { useNavigate } from "react-router-dom";
import HeaderBanner from "../components/HeaderBanner";
import { toast } from "react-toastify";

function AdminBooks() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [updatedBook, setUpdatedBook] = useState({});
  const [selectedParent, setSelectedParent] = useState("");
  const [selectedBookToDelete, setSelectedBookToDelete] = useState(null);

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
  const navigate = useNavigate();
  const heading_pic = process.env.PUBLIC_URL + "/images/heading_pic.jpg";

  // Fetch categories from API
  useEffect(() => {
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

    fetchCategories();
  }, []);

  // Fetch Parent Categories
  useEffect(() => {
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

    fetchCategories();
  }, []);

  // Handle Parent Category Selection
  const handleParentChange = (e) => {
    const parentId = Number(e.target.value); // Convert to number
    setSelectedParent(parentId);
    handleChange(e); // Update book.category_id

    // Find subcategories of selected parent
    const children = categories.filter((cat) => cat.parent_id === parentId);
    setSubCategories(children);
  };

  const handleToggle = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await api.get("/books");
        setBooks(response.data);
        setFilteredBooks(response.data);
      } catch (error) {
        console.error("Error fetching books:", error);
        toast.error("Failed to fetch books. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

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

  // Open & Close Modal
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setBook({ ...book, [name]: value });
  };
  // Handle File Upload
  // Handle file input change
  const handleFileChange = (e) => {
    setBook({ ...book, image: e.target.files[0] });
  };

  // Handle Form Submission

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
      setBook({
        name: "",
        author: "",
        isbn: "",
        image: null,
        description: "",
        no_of_copies: "",
        category_id: "",
      });
      // Show success toast
      toast.success("Book added successfully!");

      // Close modal after 1.5 seconds
      setTimeout(() => {
        setShowSuccess(false);
        closeModal();
      }, 1500);
      window.location.reload();
    } catch (error) {
      console.error("Error adding book:", error);
      toast.error("Failed to add book. Please try again.");
    }
  };

  const handleDelete = (bookId) => {
    // Set the bookId to be deleted and open the modal
    setSelectedBookToDelete(bookId);
    setIsModalOpenDelete(true); // Open the confirmation modal
  };

  const handleConfirmDelete = async () => {
    if (!selectedBookToDelete) return;

    try {
      await api.delete(`/books/${selectedBookToDelete}`);
      toast.success("Book deleted successfully!");

      // Remove the deleted book from the state
      setBooks((prevBooks) =>
        prevBooks.filter((book) => book.id !== selectedBookToDelete)
      );

      // Close the modal
      setIsModalOpenDelete(false);
      window.location.reload();
    } catch (error) {
      console.error("Error deleting book:", error);
      toast.error("Failed to delete the book. Please try again.");
    }
  };

  // Open the modal and load book data
  const openUpdateModal = (book) => {
    setSelectedBook(book);
    setUpdatedBook(book); // Pre-fill form with existing data
    setIsUpdateModalOpen(true);
  };

  // Close modal
  const closeUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedBook(null);
  };

  // Handle form input changes
  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setUpdatedBook((prev) => ({ ...prev, [name]: value }));
  };

  // Handle image change
  const handleImageChange = (e) => {
    setUpdatedBook((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  // Handle form submission
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(updatedBook).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const response = await api.put(`/books/${selectedBook.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(response.data.message || "Book updated successfully!");

      // ✅ Fetch latest books from the server to reflect the update
      fetchBooks();

      closeUpdateModal();
    } catch (error) {
      console.error("Error updating book:", error);
      toast.error("Failed to update book. Please try again.");
    }
  };

  // Function to fetch books from the API
  const fetchBooks = async () => {
    try {
      const response = await api.get("/books");
      setBooks(response.data.books);
    } catch (error) {
      console.error("Error fetching books:", error);
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
        <HeaderBanner book={"Books"} heading_pic={heading_pic} />

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
                onClick={openModal}
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
                  <div className="flex justify-center space-x-3 mt-2">
                    <FaEdit
                      className="text-blue-600 cursor-pointer"
                      onClick={() => openUpdateModal(book)}
                    />
                    <FaTrash
                      className="text-red-600 cursor-pointer"
                      onClick={() => handleDelete(book.id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {isModalOpenDelete && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">
              Are you sure you want to delete this book?
            </h2>
            <div className="flex justify-between">
              <button
                className="bg-red-600 text-white px-4 py-2 rounded"
                onClick={handleConfirmDelete} // Confirm the deletion
              >
                Yes, Delete
              </button>
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded"
                onClick={() => setIsModalOpenDelete(false)} // Close the modal without deleting
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Book Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Add New Book</h2>
              <FaTimes
                className="text-gray-500 cursor-pointer"
                onClick={closeModal}
              />
            </div>

            {showSuccess ? (
              <div className="text-green-600 font-semibold text-center mt-4">
                Book added successfully!
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                {/* Image Upload */}
                <div>
                  <label className="block text-gray-700">Image:</label>
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full border p-2 rounded"
                  />
                </div>

                {/* Title */}
                <div>
                  <label className="block text-gray-700">Title:</label>
                  <input
                    type="text"
                    name="name"
                    value={book.name}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                    required
                  />
                </div>

                {/* Author */}
                <div>
                  <label className="block text-gray-700">Author:</label>
                  <input
                    type="text"
                    name="author"
                    value={book.author}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                    required
                  />
                </div>

                {/* ISBN */}
                <div>
                  <label className="block text-gray-700">ISBN:</label>
                  <input
                    type="text"
                    name="isbn"
                    value={book.isbn}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-gray-700">Description:</label>
                  <textarea
                    name="description"
                    value={book.description}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                    rows="4"
                  ></textarea>
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-gray-700">Category:</label>
                  <select
                    name="category_id"
                    value={selectedParent}
                    onChange={handleParentChange}
                    className="w-full border p-2 rounded"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories
                      .filter((cat) => cat.parent_id === null)
                      .map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                  </select>

                  {subCategories.length > 0 && (
                    <div className="mt-4">
                      <label className="block text-gray-700">
                        Subcategory:
                      </label>
                      <select
                        name="category_id"
                        value={book.category_id}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                        required
                      >
                        <option value="">Select a subcategory</option>
                        {subCategories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Number of Copies */}
                <div>
                  <label className="block text-gray-700">
                    Number of Copies:
                  </label>
                  <input
                    type="number"
                    name="no_of_copies"
                    value={book.no_of_copies}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                    required
                    min="1"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded w-full"
                >
                  Add Book
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Update Book Modal */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Update Book</h2>
              <FaTimes
                className="text-gray-500 cursor-pointer"
                onClick={closeUpdateModal}
              />
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-gray-700">Image:</label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full border p-2 rounded"
                />
              </div>

              <div>
                <label className="block text-gray-700">Title:</label>
                <input
                  type="text"
                  name="name"
                  value={updatedBook.name || ""}
                  onChange={handleUpdateChange}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700">Author:</label>
                <input
                  type="text"
                  name="author"
                  value={updatedBook.author || ""}
                  onChange={handleUpdateChange}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700">ISBN:</label>
                <input
                  type="text"
                  name="isbn"
                  value={updatedBook.isbn || ""}
                  onChange={handleUpdateChange}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700">Description:</label>
                <textarea
                  name="description"
                  value={updatedBook.description || ""}
                  onChange={handleUpdateChange}
                  className="w-full border p-2 rounded"
                  rows="4"
                ></textarea>
              </div>
              <div>
                <label className="block text-gray-700">Category:</label>
                <select
                  name="category_id"
                  value={selectedParent}
                  onChange={handleParentChange}
                  className="w-full border p-2 rounded"
                  required
                >
                  <option value="">Select a category</option>
                  {categories
                    .filter((cat) => cat.parent_id === null)
                    .map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700">Number of Copies:</label>
                <input
                  type="number"
                  name="no_of_copies"
                  value={updatedBook.no_of_copies || ""}
                  onChange={handleUpdateChange}
                  className="w-full border p-2 rounded"
                  required
                  min="1"
                />
              </div>

              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Update Book
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminBooks;
