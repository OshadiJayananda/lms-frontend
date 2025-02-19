import React, { useState, useEffect } from "react";
import SideBar from "../../Components/SideBar";
import Header from "../../Components/Header";
import api from "../../Components/Api";
import HeaderBanner from "../components/HeaderBanner";

function AddBooks() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedParent, setSelectedParent] = useState("");
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
    const parentId = e.target.value;
    setSelectedParent(parentId);
    handleChange(e); // Update book.category_id

    // Find subcategories of selected parent
    const children = categories.filter((cat) => cat.parent_id === parentId);
    setSubCategories(children);
  };

  // Toggle Sidebar
  const handleToggle = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setBook({ ...book, [name]: value });
  };

  // Handle file input change
  const handleFileChange = (e) => {
    setBook({ ...book, image: e.target.files[0] });
  };

  // Handle form submission
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
        {/* Header Image */}
        <HeaderBanner book={"Add Book"} heading_pic={heading_pic} />
        <Header />

        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Add a New Book</h2>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-lg shadow-md space-y-4"
            encType="multipart/form-data"
          >
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

            {/* Name */}
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

            {/* Category */}
            <div>
              {/* Parent Category Selection */}
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
                  .filter((cat) => cat.parent_id === null) // Only top-level categories
                  .map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
              </select>

              {/* Subcategory Selection (if available) */}
              {subCategories.length > 0 && (
                <div className="mt-4">
                  <label className="block text-gray-700">Subcategory:</label>
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
              <label className="block text-gray-700">Number of Copies:</label>
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
              className="px-4 py-2 rounded text-white bg-blue-600 hover:bg-black-700"
              style={{
                backgroundColor: "#001f5b",
              }}
            >
              Add Book
            </button>
          </form>
          {/* Success/Error Message */}
          {message && (
            <div
              className={`p-3 mb-4 rounded ${
                message.includes("successfully")
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AddBooks;
