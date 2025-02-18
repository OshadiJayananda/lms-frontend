import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SideBar from "../../Components/SideBar";
import heading_pic from "../../images/heading_pic.jpg";
import Header from "../../Components/Header";
import api from "../../Components/Api";
import HeaderBanner from "../components/HeaderBanner";

function UpdateBook() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [categories, setCategories] = useState([]);
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

    const fetchBookDetails = async () => {
      try {
        const response = await api.get(`/books/${id}`);
        if (response.data) {
          setBook(response.data);
          setSelectedParent(response.data.category_id);
        }
      } catch (error) {
        console.error("Error fetching book details:", error);
      }
    };

    fetchCategories();
    fetchBookDetails();
  }, [id]);

  const handleParentChange = (e) => {
    const parentId = e.target.value;
    setSelectedParent(parentId);
    handleChange(e);
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

    // Ensure all fields are included
    const payload = {
      name: book.name,
      author: book.author,
      isbn: book.isbn,
      description: book.description,
      no_of_copies: book.no_of_copies,
      category_id: selectedParent || book.category_id,
    };

    try {
      const response = await api.put(`/books/${id}`, payload, {
        headers: { "Content-Type": "application/json" }, // Ensure JSON format
      });

      setMessage(response.data.message);
      navigate("/adminBooks");
    } catch (error) {
      console.error("Error updating book:", error);
      console.log(error.response?.data); // Log detailed error from backend
      setMessage(
        error.response?.data?.message ||
          "Failed to update book. Please try again."
      );
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
        } w-full p-4`}
      >
        <HeaderBanner book={"Update Book"} heading_pic={heading_pic} />

        <Header />

        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Update Book Details</h2>
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-lg shadow-md space-y-4"
          >
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
                value={book.no_of_copies}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
                min="1"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded text-white bg-blue-600 hover:bg-black-700"
              style={{ backgroundColor: "#001f5b" }}
            >
              Update Book
            </button>
          </form>
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

export default UpdateBook;
