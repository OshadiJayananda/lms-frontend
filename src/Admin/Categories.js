import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import SideBar from "../Components/SideBar";
import api from "../Components/Api";
import { FaEdit, FaTrash } from "react-icons/fa";
import Header from "../Components/Header";
import { toast } from "react-toastify";

function Categories() {
  const [parentCategories, setParentCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showOnlyParents, setShowOnlyParents] = useState(false);
  const recordsPerPage = 5;
  const [showModal, setShowModal] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);

  const heading_pic = process.env.PUBLIC_URL + "/images/heading_pic.jpg";

  const fetchParentCategories = async () => {
    try {
      const response = await api.get("/categories");
      if (response && response.data && response.data.parent_categories) {
        setParentCategories(response.data.parent_categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

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
    fetchParentCategories();
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
    formik.resetForm();
  };

  const handleEditClick = (category) => {
    setCategoryToEdit(category);
    setShowEditModal(true);
  };

  const confirmEdit = () => {
    if (categoryToEdit) {
      setEditingCategoryId(categoryToEdit.id);
      formik.setFieldValue("name", categoryToEdit.name);
      formik.setFieldValue("description", categoryToEdit.description || "");
      formik.setFieldValue("parentId", categoryToEdit.parent_id || null);
      formik.setFieldValue(
        "status",
        categoryToEdit.status === 1 ? "Active" : "Inactive"
      );
      setShowEditModal(false);
      window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to the top
    }
  };

  const handleDeleteClick = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/categories/${selectedCategoryId}`);
      toast.success("Category deleted successfully!");
      fetchCategories();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete category."
      );
    }
    setShowModal(false);
  };

  // Edit categories logic
  const filteredCategories = showOnlyParents
    ? categories.filter((category) => !category.parent_id)
    : categories;

  // Pagination logic
  const totalPages = Math.ceil(filteredCategories.length / recordsPerPage);
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredCategories.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );

  // Formik setup with validation schema using Yup
  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
      parentId: "",
      status: "Active",
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .min(3, "Category name must be at least 3 characters")
        .required("Category name is required"),
      description: Yup.string()
        .min(3, "Description must be at least 3 characters")
        .required("Description is required"),
    }),
    onSubmit: async (values) => {
      const categoryData = {
        name: values.name,
        description: values.description,
        parent_id: values.parentId,
        status: values.status === "Active" ? 1 : 0,
      };

      try {
        if (editingCategoryId) {
          // Update category
          await api.put(`/categories/${editingCategoryId}`, categoryData);
          toast.success("Category updated successfully!");
        } else {
          // Create new category
          await api.post("/categories", categoryData);
          toast.success("Category created successfully!");
        }
        formik.resetForm();
        setEditingCategoryId(null); // Reset editing state
        fetchCategories(); // Refresh categories list
      } catch (error) {
        toast.error(error.response?.data?.message || "Something went wrong.");
      }
    },
  });

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
            filter: "brightness(150%)",
          }}
        >
          <h1
            style={{
              fontSize: "40px",
              textAlign: "left",
              padding: "20px",
              color: "#000",
              fontWeight: "bold",
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
            onSubmit={formik.handleSubmit}
          >
            <h1
              style={{
                fontWeight: "bold",
                fontSize: "20px",
              }}
            >
              Add a new category
            </h1>
            <label>Category Name:</label>
            <input
              type="text"
              style={{ display: "block", margin: "10px 0", width: "100%" }}
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
            />
            {formik.errors.name && formik.touched.name && (
              <div style={{ color: "red" }}>{formik.errors.name}</div>
            )}

            <label>Description:</label>
            <textarea
              style={{ display: "block", margin: "10px 0", width: "100%" }}
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
            ></textarea>
            {formik.errors.description && formik.touched.description && (
              <div style={{ color: "red" }}>{formik.errors.description}</div>
            )}

            <label>Parent Category:</label>
            <select
              style={{ display: "block", margin: "10px 0", width: "100%" }}
              name="parentId"
              value={formik.values.parentId}
              onChange={formik.handleChange}
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
              name="status"
              value={formik.values.status}
              onChange={formik.handleChange}
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
              type="button"
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
        </div>

        <div style={{ marginTop: "20px", padding: "10px" }}>
          <h1
            style={{
              fontWeight: "bold",
              fontSize: "20px",
            }}
          >
            Existing Categories
          </h1>

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
              style={{ marginRight: "8px" }}
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
                  <td className="p-2 border border-gray-300">
                    <div className="flex items-center gap-3">
                      {/* Edit Button */}
                      <FaEdit
                        onClick={() => handleEditClick(category)}
                        className="text-green-500 cursor-pointer hover:text-green-700 transition"
                        title="Edit"
                      />

                      {/* Delete Button */}
                      <FaTrash
                        onClick={() => handleDeleteClick(category.id)}
                        className="text-red-500 cursor-pointer hover:text-red-700 transition"
                        title="Delete"
                      />
                    </div>

                    {/* Confirmation Modal */}
                    {showModal && (
                      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-80">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Confirm Deletion
                          </h3>
                          <p className="text-gray-700 mt-2">
                            Are you sure you want to delete this category?
                          </p>
                          <div className="flex justify-end gap-3 mt-4">
                            <button
                              onClick={() => setShowModal(false)}
                              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={confirmDelete}
                              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Edit Confirmation Modal */}
                    {showEditModal && (
                      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-80">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Confirm Edit
                          </h3>
                          <p className="text-gray-700 mt-2">
                            Are you sure you want to edit this category?
                          </p>
                          <div className="flex justify-end gap-3 mt-4">
                            <button
                              onClick={() => setShowEditModal(false)}
                              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={confirmEdit}
                              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
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
