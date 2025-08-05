import React, { useState, useEffect } from "react";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaTimes,
  FaSearch,
  FaBook,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import SideBar from "../../Components/SideBar";
import Header from "../../Components/Header";
import api from "../../Components/Api";
import HeaderBanner from "../../Components/HeaderBanner";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import BookFilters from "../../Components/BookFilters";
import CategoryFilter from "../../Components/CategoryFilter";

const config = { headers: { "Content-Type": "multipart/form-data" } };

function AdminBooks() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
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
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [authorOptions, setAuthorOptions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalBooks, setTotalBooks] = useState(0);

  const heading_pic = process.env.PUBLIC_URL + "/images/heading_pic.jpg";

  // Formik validation schema
  const validationSchema = Yup.object({
    name: Yup.string()
      .min(2, "Title must be at least 2 characters")
      .required("Title is required"),
    author_id: Yup.string().required("Author is required"),
    isbn: Yup.string()
      .required("ISBN is required")
      .matches(
        /^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/,
        "Invalid ISBN format. Must be 10 or 13 digits (hyphens allowed)"
      )
      .test("isbn-format", "Invalid ISBN format", (value) => {
        // Remove all hyphens and spaces
        const cleanedValue = value.replace(/[-\s]/g, "");
        // Check for ISBN-10 (10 digits) or ISBN-13 (13 digits)
        return cleanedValue.length === 10 || cleanedValue.length === 13;
      })
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
    category_id: Yup.number().required("Category is required"),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      author_id: "",
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
      formData.append("author_id", values.author_id);
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
          formData.append("_method", "PUT");
          response = await api.post(
            `/books/${selectedBook.id}`,
            formData,
            config
          );
          toast.success(response.data.message || "Book updated successfully!");
        } else {
          response = await api.post("/books", formData, config);
          toast.success("Book added successfully!");
        }

        fetchBooks();
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

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const response = await api.get("/authors");
        const options = response.data.map((author) => ({
          value: author.id,
          label: author.name,
        }));
        setAuthorOptions(options);
      } catch (error) {
        console.error("Failed to fetch authors", error);
      }
    };

    fetchAuthors();
  }, []);

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

        console.log("Categories Data:", categoriesData);

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
    fetchBooks();
  }, [selectedCategory, searchQuery, currentPage, perPage]);

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
    setCurrentPage(1);
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const renderPagination = () => {
    if (totalPages <= 1 && filteredBooks.length <= perPage) return null;

    const pageButtons = [];
    const maxVisiblePages = 5;
    let startPage, endPage;

    if (totalPages <= maxVisiblePages) {
      startPage = 1;
      endPage = totalPages;
    } else {
      const halfVisible = Math.floor(maxVisiblePages / 2);
      if (currentPage <= halfVisible + 1) {
        startPage = 1;
        endPage = maxVisiblePages;
      } else if (currentPage >= totalPages - halfVisible) {
        startPage = totalPages - maxVisiblePages + 1;
        endPage = totalPages;
      } else {
        startPage = currentPage - halfVisible;
        endPage = currentPage + halfVisible;
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageButtons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded-md ${
            currentPage === i
              ? "bg-blue-600 text-white"
              : "text-blue-600 hover:bg-blue-50"
          }`}
        >
          {i}
        </button>
      );
    }

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

          {startPage > 1 && (
            <>
              <button
                onClick={() => handlePageChange(1)}
                className="px-3 py-1 rounded-md text-blue-600 hover:bg-blue-50"
              >
                1
              </button>
              {startPage > 2 && <span className="px-1">...</span>}
            </>
          )}

          {pageButtons}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="px-1">...</span>}
              <button
                onClick={() => handlePageChange(totalPages)}
                className="px-3 py-1 rounded-md text-blue-600 hover:bg-blue-50"
              >
                {totalPages}
              </button>
            </>
          )}

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

  const findParentCategory = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    if (!category) return null;

    if (category.parent_id) {
      return category.parent_id;
    }
    return categoryId;
  };

  const openModal = (book = null) => {
    if (book) {
      setSelectedBook(book);
      formik.setValues({
        name: book.name,
        author_id: book.author_id,
        isbn: book.isbn,
        image: null,
        description: book.description,
        no_of_copies: book.no_of_copies,
        category_id: book.category_id,
      });

      const parentId = findParentCategory(book.category_id);
      setSelectedParent(parentId || "");

      if (parentId) {
        const children = categories.filter((cat) => cat.parent_id === parentId);
        setSubCategories(children);
      } else {
        setSubCategories([]);
      }

      setImagePreview(book.image);
    } else {
      setSelectedBook(null);
      formik.resetForm();
      setSelectedParent("");
      setSubCategories([]);
      setImagePreview(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBook(null);
    formik.resetForm();
    setSelectedParent("");
    setSubCategories([]);
    setImagePreview(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    formik.setFieldValue("image", file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleParentChange = (e) => {
    const parentId = Number(e.target.value);
    setSelectedParent(parentId);
    formik.setFieldValue("category_id", "");
    const children = categories.filter((cat) => cat.parent_id === parentId);
    setSubCategories(children);
  };

  const handleDelete = (bookId) => {
    setSelectedBookToDelete(bookId);
    setIsModalOpenDelete(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedBookToDelete) return;

    try {
      await api.delete(`/books/${selectedBookToDelete}`);
      toast.success("Book deleted successfully!");
      fetchBooks();
      setIsModalOpenDelete(false);
    } catch (error) {
      console.error("Error deleting book:", error);
      toast.error("Failed to delete the book. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <SideBar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!isSidebarCollapsed)}
      />

      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        <HeaderBanner book={"Books Management"} heading_pic={heading_pic} />
        <Header />

        <div className="p-6">
          {/* Dashboard Header */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex flex-col gap-6 rounded-lg">
              {/* Title Section */}
              <div className="flex flex-col">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  Books Inventory
                </h1>
                <p className="text-gray-500 mt-1 text-sm md:text-base">
                  Manage all books in the library collection
                </p>
              </div>

              {/* Controls Section */}
              <div className="flex flex-col md:flex-row gap-4 w-full">
                {/* Search Input - Moved to top on mobile */}
                <BookFilters
                  searchQuery={searchQuery}
                  onSearch={setSearchQuery}
                />

                {/* Filter Dropdown */}
                <CategoryFilter
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onChange={setSelectedCategory}
                  isLoading={isCategoriesLoading}
                />

                {/* Add Book Buttons */}
                <div className="order-3 md:ml-auto flex flex-col md:flex-row gap-2 whitespace-nowrap">
                  <button
                    onClick={() => openModal()}
                    className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition text-sm md:text-base whitespace-nowrap"
                    aria-label="Add new book"
                  >
                    <FaPlus className="mr-2" />
                    Add Book
                  </button>
                </div>
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
                No books found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery
                  ? "Try adjusting your search"
                  : "There are currently no books in the library"}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredBooks.map((book) => (
                  <div
                    key={book.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
                  >
                    <div className="h-48 bg-gray-100 flex items-center justify-center">
                      <img
                        src={book.image || "/default-book-cover.png"}
                        alt={book.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-1 line-clamp-1">
                        {book.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                        {book.author?.name || "Unknown Author"}
                      </p>
                      <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                        <span>ISBN: {book.isbn}</span>
                        <span
                          className={`px-2 py-1 rounded-full ${
                            book.no_of_copies > 0
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {book.no_of_copies} available
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-3">
                        <button
                          onClick={() => openModal(book)}
                          className="text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          <FaEdit className="mr-1" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(book.id)}
                          className="text-red-600 hover:text-red-800 flex items-center"
                        >
                          <FaTrash className="mr-1" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {renderPagination()}
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isModalOpenDelete && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Confirm Deletion
              </h2>
              <button
                onClick={() => setIsModalOpenDelete(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <p className="mb-6 text-gray-600">
              Are you sure you want to delete this book? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpenDelete(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Delete Book
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Update Book Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {selectedBook ? "Edit Book Details" : "Add New Book"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>

            <form
              onSubmit={formik.handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Left Column */}
              <div className="space-y-4">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Book Cover
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="h-40 w-28 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <FaBook className="text-gray-400 text-2xl" />
                      )}
                    </div>
                    <div>
                      <label className="cursor-pointer bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                        Upload Image
                        <input
                          type="file"
                          name="image"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="sr-only"
                        />
                      </label>
                      <p className="mt-1 text-xs text-gray-500">
                        JPG, PNG up to 2MB
                      </p>
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      formik.touched.name && formik.errors.name
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {formik.touched.name && formik.errors.name && (
                    <p className="mt-1 text-sm text-red-600">
                      {formik.errors.name}
                    </p>
                  )}
                </div>

                {/* Author */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Author *
                  </label>
                  <Select
                    name="author_id"
                    options={authorOptions}
                    value={
                      authorOptions.find(
                        (option) => option.value === formik.values.author_id
                      ) || null
                    }
                    onChange={(selected) => {
                      formik.setFieldValue(
                        "author_id",
                        selected ? selected.value : ""
                      );
                    }}
                    onBlur={() => formik.setFieldTouched("author_id", true)}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    placeholder="Select an author..."
                  />
                  {formik.touched.author_id && formik.errors.author_id && (
                    <p className="mt-1 text-sm text-red-600">
                      {formik.errors.author_id}
                    </p>
                  )}
                </div>

                {/* ISBN */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ISBN *
                  </label>
                  <input
                    type="text"
                    name="isbn"
                    value={formik.values.isbn}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      formik.touched.isbn && formik.errors.isbn
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="e.g. 978-3-16-148410-0"
                  />
                  {formik.touched.isbn && formik.errors.isbn && (
                    <div className="mt-1 flex items-center text-sm text-red-600">
                      <svg
                        className="w-4 h-4 mr-1 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>{formik.errors.isbn}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    rows="4"
                    className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      formik.touched.description && formik.errors.description
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  ></textarea>
                  {formik.touched.description && formik.errors.description && (
                    <p className="mt-1 text-sm text-red-600">
                      {formik.errors.description}
                    </p>
                  )}
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="parent_category"
                    value={selectedParent}
                    onChange={handleParentChange}
                    className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      formik.touched.category_id && formik.errors.category_id
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">Select a category</option>
                    {categories
                      .filter((cat) => !cat.parent_id)
                      .map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                  </select>

                  {subCategories.length > 0 && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subcategory
                      </label>
                      <select
                        name="category_id"
                        value={formik.values.category_id}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          formik.touched.category_id &&
                          formik.errors.category_id
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
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
                  {formik.touched.category_id && formik.errors.category_id && (
                    <p className="mt-1 text-sm text-red-600">
                      {formik.errors.category_id}
                    </p>
                  )}
                </div>

                {/* Number of Copies */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Copies *
                  </label>
                  <input
                    type="number"
                    name="no_of_copies"
                    value={formik.values.no_of_copies}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    min="1"
                    className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      formik.touched.no_of_copies && formik.errors.no_of_copies
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {formik.touched.no_of_copies &&
                    formik.errors.no_of_copies && (
                      <p className="mt-1 text-sm text-red-600">
                        {formik.errors.no_of_copies}
                      </p>
                    )}
                </div>

                {/* Submit Button */}
                <div className="md:col-span-2 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processing...
                      </>
                    ) : selectedBook ? (
                      "Update Book"
                    ) : (
                      "Add Book"
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminBooks;
