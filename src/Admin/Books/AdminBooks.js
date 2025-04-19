import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus, FaTimes } from "react-icons/fa";
import SideBar from "../../Components/SideBar";
import Header from "../../Components/Header";
import api from "../../Components/Api";
import { useNavigate } from "react-router-dom";
import HeaderBanner from "../components/HeaderBanner";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";

const config = { headers: { "Content-Type": "multipart/form-data" } };

function AdminBooks() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedParent, setSelectedParent] = useState("");
  const [selectedBookToDelete, setSelectedBookToDelete] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const heading_pic = process.env.PUBLIC_URL + "/images/heading_pic.jpg";

  // Formik validation schema
  const validationSchema = Yup.object({
    name: Yup.string()
      .min(2, "Title must be at least 2 characters")
      .required("Title is required"),
    author: Yup.string().required("Author is required"),
    isbn: Yup.string()
      .required("ISBN is required")
      .test("isbn-unique", "ISBN must be unique", async (value) => {
        if (!value) return true;
        if (selectedBook && selectedBook.isbn === value) return true;
        try {
          const response = await api.get(`/books/check-isbn?isbn=${value}`);
          return !response.data.exists;
        } catch (error) {
          return true; // Assume valid if check fails
        }
      }),
    description: Yup.string().required("Description is required"),
    no_of_copies: Yup.number()
      .min(1, "Number of copies must be at least 1")
      .required("Number of copies is required"),
    category_id: Yup.string().required("Category is required"),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      author: "",
      isbn: "",
      image: null,
      description: "",
      no_of_copies: "",
      category_id: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("author", values.author);
      formData.append("isbn", values.isbn);
      formData.append("description", values.description);
      formData.append("no_of_copies", values.no_of_copies);
      formData.append("category_id", values.category_id);

      if (values.image instanceof File) {
        formData.append("image", values.image);
      }

      try {
        let response;
        if (selectedBook) {
          response = await api.post(
            `/books/${selectedBook.id}/update`,
            formData,
            config
          );
          // Check for successful response
          if (response.status !== 200) {
            throw new Error("Update failed");
          }
          toast.success(response.data.message || "Book updated successfully!");
        } else {
          response = await api.post("/books", formData, config);
          toast.success("Book added successfully!");
        }

        // Refresh the book list
        const booksResponse = await api.get("/books");
        if (booksResponse.data) {
          setBooks(booksResponse.data);
          setFilteredBooks(booksResponse.data);
        }

        closeModal();
      } catch (error) {
        console.error("Error saving book:", error);

        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Failed to save book. Please try again."
        );
      } finally {
        setIsSubmitting(false);
      }
    },
  });

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

  // Fetch books from API
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await api.get("/books");
        setBooks(response.data);
        setFilteredBooks(response.data);
      } catch (error) {
        console.error("Error fetching books:", error);
        setError("Failed to fetch books. Please try again later.");
        toast.error("Failed to fetch books. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  // Handle search
  const handleSearch = async (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    try {
      const response = await api.get(`/books/search?q=${query}`);
      setFilteredBooks(response.data);
    } catch (error) {
      console.error("Error searching books:", error);
      toast.error("Failed to search books. Please try again later.");
    }
  };

  // Open modal for adding or updating a book
  const openModal = (book = null) => {
    if (book) {
      setSelectedBook(book);
      formik.setValues({
        name: book.name,
        author: book.author,
        isbn: book.isbn,
        image: null, // Keep the existing image
        description: book.description,
        no_of_copies: book.no_of_copies,
        category_id: book.category_id,
      });
      setSelectedParent(book.category_id);
      setImagePreview(book.image);
    } else {
      setSelectedBook(null);
      formik.resetForm();
      setSelectedParent("");
      setImagePreview(null);
    }
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBook(null);
    formik.resetForm();
    setSelectedParent("");
    setImagePreview(null);
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    formik.setFieldValue("image", file);
    setImagePreview(URL.createObjectURL(file));
  };

  // Handle parent category selection
  const handleParentChange = (e) => {
    const parentId = Number(e.target.value);
    setSelectedParent(parentId);
    formik.setFieldValue("category_id", parentId);

    // Find subcategories of selected parent
    const children = categories.filter((cat) => cat.parent_id === parentId);
    setSubCategories(children);
  };

  // Handle delete
  const handleDelete = (bookId) => {
    setSelectedBookToDelete(bookId);
    setIsModalOpenDelete(true);
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
      setFilteredBooks((prevBooks) =>
        prevBooks.filter((book) => book.id !== selectedBookToDelete)
      );

      setIsModalOpenDelete(false);
    } catch (error) {
      console.error("Error deleting book:", error);
      toast.error("Failed to delete the book. Please try again.");
    }
  };

  return (
    <div className="flex">
      <SideBar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!isSidebarCollapsed)}
      />
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
                onClick={() => openModal()}
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
                      onClick={() => openModal(book)}
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

      {/* Delete Confirmation Modal */}
      {isModalOpenDelete && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">
              Are you sure you want to delete this book?
            </h2>
            <div className="flex justify-between">
              <button
                className="bg-red-600 text-white px-4 py-2 rounded"
                onClick={handleConfirmDelete}
              >
                Yes, Delete
              </button>
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded"
                onClick={() => setIsModalOpenDelete(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Update Book Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                {selectedBook ? "Update Book" : "Add New Book"}
              </h2>
              <FaTimes
                className="text-gray-500 cursor-pointer"
                onClick={closeModal}
              />
            </div>

            <form onSubmit={formik.handleSubmit} className="space-y-4 mt-4">
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
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-40 w-28 object-cover mt-3"
                  />
                )}
                {formik.touched.image && formik.errors.image ? (
                  <div className="text-red-500">{formik.errors.image}</div>
                ) : null}
              </div>

              {/* Title */}
              <div>
                <label className="block text-gray-700">Title:</label>
                <input
                  type="text"
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full border p-2 rounded"
                />
                {formik.touched.name && formik.errors.name ? (
                  <div className="text-red-500">{formik.errors.name}</div>
                ) : null}
              </div>

              {/* Author */}
              <div>
                <label className="block text-gray-700">Author:</label>
                <input
                  type="text"
                  name="author"
                  value={formik.values.author}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full border p-2 rounded"
                />
                {formik.touched.author && formik.errors.author ? (
                  <div className="text-red-500">{formik.errors.author}</div>
                ) : null}
              </div>

              {/* ISBN */}
              <div>
                <label className="block text-gray-700">ISBN:</label>
                <input
                  type="text"
                  name="isbn"
                  value={formik.values.isbn}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full border p-2 rounded"
                />
                {formik.touched.isbn && formik.errors.isbn ? (
                  <div className="text-red-500">{formik.errors.isbn}</div>
                ) : null}
              </div>

              {/* Description */}
              <div>
                <label className="block text-gray-700">Description:</label>
                <textarea
                  name="description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full border p-2 rounded"
                  rows="4"
                ></textarea>
                {formik.touched.description && formik.errors.description ? (
                  <div className="text-red-500">
                    {formik.errors.description}
                  </div>
                ) : null}
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-gray-700">Category:</label>
                <select
                  name="category_id"
                  value={selectedParent}
                  onChange={handleParentChange}
                  onBlur={formik.handleBlur}
                  className="w-full border p-2 rounded"
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
                    <label className="block text-gray-700">Subcategory:</label>
                    <select
                      name="category_id"
                      value={formik.values.category_id}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full border p-2 rounded"
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
                {formik.touched.category_id && formik.errors.category_id ? (
                  <div className="text-red-500">
                    {formik.errors.category_id}
                  </div>
                ) : null}
              </div>

              {/* Number of Copies */}
              <div>
                <label className="block text-gray-700">Number of Copies:</label>
                <input
                  type="number"
                  name="no_of_copies"
                  value={formik.values.no_of_copies}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full border p-2 rounded"
                  min="1"
                />
                {formik.touched.no_of_copies && formik.errors.no_of_copies ? (
                  <div className="text-red-500">
                    {formik.errors.no_of_copies}
                  </div>
                ) : null}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded w-full"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Processing..."
                  : selectedBook
                  ? "Update Book"
                  : "Add Book"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminBooks;
