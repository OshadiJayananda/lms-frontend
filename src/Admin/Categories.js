import React, { useEffect, useState } from "react";
import SideBar from "../Components/SideBar";
import api from "../Components/Api";
import { FaEdit, FaTrash } from "react-icons/fa";
import heading_pic from "../images/heading_pic.jpg";
import Header from "../Components/Header";

function Categories() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState(null);
  const [status, setStatus] = useState("Active");
  const [parentCategories, setParentCategories] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [categories, setCategories] = useState([]);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showOnlyParents, setShowOnlyParents] = useState(false);
  const recordsPerPage = 5;

  const handleSubmit = async (event) => {
    event.preventDefault();

    const categoryData = {
      name,
      description,
      parent_id: parentId,
      status: status === "Active" ? 1 : 0,
    };

    try {
      if (editingCategoryId) {
        // Update category
        await api.put(`/categories/${editingCategoryId}`, categoryData);
        setSuccessMessage("Category updated successfully!");
      } else {
        // Create new category
        await api.post("/categories", categoryData);
        setSuccessMessage("Category created successfully!");
      }
      setErrorMessage("");
      setName("");
      setDescription("");
      setParentId(null);
      setStatus("Active");
      setEditingCategoryId(null); // Reset editing state
      fetchCategories(); // Refresh the categories list
    } catch (error) {
      if (error.response && error.response.data) {
        setErrorMessage(error.response.data.message || "Something went wrong");
      } else {
        setErrorMessage("Something went wrong, please try again.");
      }
    }
  };

  useEffect(() => {
    const fetchParentCategories = async () => {
      try {
        const response = await api.get("/categories"); // Fetch from /categories
        if (response && response.data && response.data.parent_categories) {
          setParentCategories(response.data.parent_categories);
        } else {
          console.error(
            "Error fetching categories: No parent_categories in response"
          );
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchParentCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      if (response && response.data && response.data.categories) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const getParentCategoryName = (parentId) => {
    const parent = parentCategories.find(
      (category) => category.id === parentId
    );
    return parent ? parent.name : "None";
  };

  const handleToggle = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleReset = () => {
    // Reset all form fields to initial state
    setName("");
    setDescription("");
    setParentId("");
    setStatus("Active");
  };

  const handleEditClick = (category) => {
    const confirmEdit = window.confirm(
      "Do you want to update the details of this category?"
    );

    if (confirmEdit) {
      setEditingCategoryId(category.id);
      setName(category.name);
      setDescription(category.description || "");
      setParentId(category.parent_id || null);
      setStatus(category.status === 1 ? "Active" : "Inactive");
    }
  };

  const handleDeleteClick = async (categoryId) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await api.delete(`/categories/${categoryId}`);
        setSuccessMessage("Category deleted successfully!");
        setErrorMessage("");
        fetchCategories(); // Refresh the categories list
      } catch (error) {
        setErrorMessage(
          error.response?.data?.message ||
            "Failed to delete category. Please try again."
        );
      }
    }
  };

  //edit;
  // Filter categories if "Show Only Parent Categories" is checked
  const filteredCategories = showOnlyParents
    ? categories.filter((category) => !category.parent_id) // Only categories with no parent_id
    : categories;

  // Pagination logic
  const totalPages = Math.ceil(filteredCategories.length / recordsPerPage);
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredCategories.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  return (
    <div>
      <SideBar isCollapsed={isSidebarCollapsed} onToggle={handleToggle} />
      <div
        style={{
          marginLeft: isSidebarCollapsed ? "5%" : "20%",
          padding: "0px",
          transition: "margin-left 0.3s ease",
        }}
      >
        <div
          style={{
            backgroundImage: `url(${heading_pic})`,
            height: "100px",
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "relative",
            filter: "brightness(150%)", // Increase brightness to lighten the image
          }}
        >
          {/* Heading on top of the header picture */}
          <h1
            style={{
              fontSize: "40px",
              textAlign: "left", // Align text to the left
              margin: "20px", // Add some margin for spacing
              color: "#000", // Set text color to black
              fontWeight: "bold", // Make text bold
            }}
          >
            Categories
          </h1>
        </div>

        <div>
          <Header />
        </div>
        <div
          style={{
            marginLeft: isSidebarCollapsed ? "5%" : "0%",
            padding: "10px",
            transition: "margin-left 0.3s ease",
          }}
        >
          <form
            style={{
              backgroundColor: "#f0f4ff",
              padding: "20px",
              borderRadius: "8px",
            }}
            onSubmit={handleSubmit}
          >
            <h1
              style={{
                fontWeight: "bold",
                // textAlign: "center",
                fontSize: "20px",
              }}
            >
              Add a new category
            </h1>
            <label>Category Name:</label>
            <input
              type="text"
              style={{ display: "block", margin: "10px 0", width: "100%" }}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <label>Description:</label>
            <textarea
              style={{ display: "block", margin: "10px 0", width: "100%" }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>

            <label>Parent Category:</label>
            <select
              style={{ display: "block", margin: "10px 0", width: "100%" }}
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
            >
              <option value="">None</option>
              {parentCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <label>Status:</label>
            <select
              style={{ display: "block", margin: "10px 0", width: "100%" }}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            <button
              type="submit"
              style={{
                backgroundColor: "#001f5b",
                color: "#fff",
                padding: "10px",
                border: "none",
                borderRadius: "4px",
                marginRight: "10px",
              }}
            >
              {editingCategoryId ? "Update" : "Add"}
            </button>

            <button
              type="reset"
              onClick={handleReset}
              style={{
                backgroundColor: "#ccc",
                padding: "10px",
                border: "none",
                borderRadius: "4px",
              }}
            >
              Clear
            </button>
          </form>
          {errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>}
          {successMessage && (
            <div style={{ color: "green" }}>{successMessage}</div>
          )}
        </div>
        <div style={{ marginTop: "20px", padding: "10px" }}>
          <h1
            style={{
              fontWeight: "bold",
              // textAlign: "center",
              fontSize: "20px",
            }}
          >
            Existing Categories
          </h1>

          {/* Parent Category Filter */}
          <label
            style={{
              marginBottom: "10px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <input
              type="checkbox"
              checked={showOnlyParents}
              onChange={() => setShowOnlyParents(!showOnlyParents)}
              style={{ marginRight: "8px" }} // Space between checkbox and label
            />
            <span>Show Only Parent Categories</span>
          </label>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#001f5b", color: "#fff" }}>
                <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                  Name
                </th>
                <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                  Description
                </th>
                <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                  Parent
                </th>
                <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                  Status
                </th>
                <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {currentRecords.map((category) => (
                <tr key={category.id}>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    {category.name}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    {category.description}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    {getParentCategoryName(category.parent_id)}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    {category.status === 1 ? "Active" : "Inactive"}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    <span
                      style={{ display: "inline-block", marginRight: "10px" }}
                    >
                      <FaEdit
                        onClick={() => handleEditClick(category)}
                        style={{ color: "green", cursor: "pointer" }}
                        title="Edit"
                      />
                    </span>
                    <span style={{ display: "inline-block" }}>
                      <FaTrash
                        onClick={() => handleDeleteClick(category.id)}
                        style={{ color: "red", cursor: "pointer" }}
                        title="Delete"
                      />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div style={{ marginTop: "10px", textAlign: "center" }}>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={{ marginRight: "5px" }}
            >
              Previous
            </button>
            <span>
              {" "}
              Page {currentPage} of {totalPages}{" "}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              style={{ marginLeft: "5px" }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Categories;
