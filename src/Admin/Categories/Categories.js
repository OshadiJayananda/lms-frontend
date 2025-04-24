import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import SideBar from "../../Components/SideBar";
import api from "../../Components/Api";
import { FaEdit, FaTrash } from "react-icons/fa";
import Header from "../../Components/Header";
import { toast } from "react-toastify";

function Categories() {
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

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      if (response?.data) {
        // The backend now returns parent categories with their children
        setCategories(response.data);

        // Flatten the hierarchy for the table view
        const allCategories = response.data.flatMap((parent) => [
          parent,
          ...(parent.child_categories || []),
        ]);
        setAllCategoriesFlat(allCategories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    }
  };

  // State to hold flattened categories for table display
  const [allCategoriesFlat, setAllCategoriesFlat] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const getParentCategoryName = (parentId) => {
    if (!parentId) return "None";
    // Find in parent categories
    const parent = categories.find((category) => category.id === parentId);
    return parent ? parent.name : "None";
  };

  const handleToggle = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleReset = () => {
    formik.resetForm();
    setEditingCategoryId(null);
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
      formik.setFieldValue("parentId", categoryToEdit.parent_id || "");
      formik.setFieldValue(
        "status",
        categoryToEdit.status === 1 ? "Active" : "Inactive"
      );
      setShowEditModal(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
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

  // Get parent categories for dropdown (categories without parent_id)
  const parentCategories = categories.filter((cat) => !cat.parent_id);

  // Filter categories based on showOnlyParents toggle
  const filteredCategories = showOnlyParents
    ? allCategoriesFlat.filter((category) => !category.parent_id)
    : allCategoriesFlat;

  // Pagination logic
  const totalPages = Math.ceil(filteredCategories.length / recordsPerPage);
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredCategories.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );

  // Formik setup
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
        parent_id: values.parentId || null,
        status: values.status === "Active" ? 1 : 0,
      };

      try {
        if (editingCategoryId) {
          await api.put(`/categories/${editingCategoryId}`, categoryData);
          toast.success("Category updated successfully!");
        } else {
          await api.post("/categories", categoryData);
          toast.success("Category created successfully!");
        }
        handleReset();
        fetchCategories();
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
              {editingCategoryId ? "Edit Category" : "Add New Category"}
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
            />
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
          <h1 style={{ fontWeight: "bold", fontSize: "20px" }}>
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
              onChange={() => {
                setShowOnlyParents(!showOnlyParents);
                setCurrentPage(1); // Reset to first page when changing filter
              }}
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
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <FaEdit
                        onClick={() => handleEditClick(category)}
                        style={{ color: "green", cursor: "pointer" }}
                        title="Edit"
                      />
                      <FaTrash
                        onClick={() => handleDeleteClick(category.id)}
                        style={{ color: "red", cursor: "pointer" }}
                        title="Delete"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              style={{ marginRight: "10px", padding: "5px 10px" }}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              style={{ marginLeft: "10px", padding: "5px 10px" }}
            >
              Next
            </button>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                padding: "20px",
                borderRadius: "8px",
                width: "300px",
              }}
            >
              <h3 style={{ fontWeight: "bold", marginBottom: "10px" }}>
                Confirm Deletion
              </h3>
              <p>Are you sure you want to delete this category?</p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: "20px",
                  gap: "10px",
                }}
              >
                <button
                  onClick={() => setShowModal(false)}
                  style={{ padding: "5px 10px", backgroundColor: "#ccc" }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  style={{
                    padding: "5px 10px",
                    backgroundColor: "red",
                    color: "white",
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Confirmation Modal */}
        {showEditModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                padding: "20px",
                borderRadius: "8px",
                width: "300px",
              }}
            >
              <h3 style={{ fontWeight: "bold", marginBottom: "10px" }}>
                Confirm Edit
              </h3>
              <p>Are you sure you want to edit this category?</p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: "20px",
                  gap: "10px",
                }}
              >
                <button
                  onClick={() => setShowEditModal(false)}
                  style={{ padding: "5px 10px", backgroundColor: "#ccc" }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmEdit}
                  style={{
                    padding: "5px 10px",
                    backgroundColor: "#001f5b",
                    color: "white",
                  }}
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Categories;
