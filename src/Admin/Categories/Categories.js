import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import SideBar from "../../Components/SideBar";
import api from "../../Components/Api";
import { FaEdit, FaTrash, FaPlus, FaFilter, FaTimes } from "react-icons/fa";
import Header from "../../Components/Header";
import { toast } from "react-toastify";
import HeaderBanner from "../../Components/HeaderBanner";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]); // Store all categories for parent selection
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showOnlyParents, setShowOnlyParents] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const heading_pic = process.env.PUBLIC_URL + "/images/heading_pic.jpg";

  const fetchCategories = async (page = 1) => {
    try {
      setLoading(true);
      const params = { page };
      if (showOnlyParents) params.parents_only = true;

      const response = await api.get("/categories", { params });
      if (response?.data) {
        setCategories(response.data.data);
        setTotalPages(response.data.last_page);
        setCurrentPage(response.data.current_page);

        // Fetch all categories separately for parent dropdown
        if (!showOnlyParents) {
          const allResponse = await api.get("/categories?all=true");
          setAllCategories(allResponse.data.data);
        } else {
          setAllCategories(response.data.data);
        }
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [showOnlyParents]);

  const handleToggle = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleReset = () => {
    formik.resetForm();
    setEditingCategoryId(null);
    setShowForm(false);
  };

  const handleEditClick = (category) => {
    setEditingCategoryId(category.id);
    formik.setFieldValue("name", category.name);
    formik.setFieldValue("description", category.description || "");
    formik.setFieldValue("parentId", category.parent_id || "");
    formik.setFieldValue(
      "status",
      category.status === 1 ? "Active" : "Inactive"
    );
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteClick = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/categories/${selectedCategoryId}`);
      toast.success("Category deleted successfully!");
      fetchCategories(currentPage);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete category."
      );
    }
    setShowModal(false);
  };

  // Get parent name for display
  const getParentName = (parentId) => {
    if (!parentId) return "None";
    const parent = allCategories.find((cat) => cat.id === parentId);
    return parent ? parent.name : "Unknown";
  };

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
        fetchCategories(currentPage);
      } catch (error) {
        toast.error(error.response?.data?.message || "Something went wrong.");
      }
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SideBar isCollapsed={isSidebarCollapsed} onToggle={handleToggle} />

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        <HeaderBanner
          book={"Categories Management"}
          heading_pic={heading_pic}
          className="w-full"
        />
        <Header />

        <div className="p-6">
          {/* Add/Edit Category Form (Collapsible) */}
          <div
            className={`mb-8 transition-all duration-300 ${
              showForm ? "max-h-screen" : "max-h-0 overflow-hidden"
            }`}
          >
            <div className="bg-white rounded-xl shadow-md p-6 border border-blue-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-blue-800">
                  {editingCategoryId ? "Edit Category" : "Add New Category"}
                </h2>
                <button
                  onClick={handleReset}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              <form onSubmit={formik.handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      formik.errors.name && formik.touched.name
                        ? "border-red-500"
                        : "border-gray-300"
                    } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    name="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    placeholder="Enter category name"
                  />
                  {formik.errors.name && formik.touched.name && (
                    <p className="mt-1 text-sm text-red-600">
                      {formik.errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    className={`w-full px-4 py-2 rounded-lg border ${
                      formik.errors.description && formik.touched.description
                        ? "border-red-500"
                        : "border-gray-300"
                    } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    name="description"
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    rows={3}
                    placeholder="Enter description"
                  />
                  {formik.errors.description && formik.touched.description && (
                    <p className="mt-1 text-sm text-red-600">
                      {formik.errors.description}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parent Category
                    </label>
                    <select
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      name="parentId"
                      value={formik.values.parentId}
                      onChange={formik.handleChange}
                      disabled={
                        editingCategoryId && formik.values.parentId === null
                      }
                    >
                      <option value="">None (Top-level category)</option>
                      {allCategories
                        .filter(
                          (cat) =>
                            !cat.parent_id && cat.id !== editingCategoryId
                        )
                        .map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                    </select>
                    {editingCategoryId && formik.values.parentId === null && (
                      <p className="mt-1 text-xs text-gray-500">
                        Cannot change a parent category to child
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      name="status"
                      value={formik.values.status}
                      onChange={formik.handleChange}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingCategoryId ? "Update Category" : "Add Category"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Existing Categories Section */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between">
              <div className="flex items-center mb-4 md:mb-0">
                <h2 className="text-xl font-bold text-gray-800">
                  Existing Categories
                </h2>
                <span className="ml-3 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {categories.length}{" "}
                  {categories.length === 1 ? "item" : "items"}
                </span>
              </div>

              <div className="flex space-x-3">
                <label className="inline-flex items-center bg-gray-100 px-3 py-1 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-blue-600"
                    checked={showOnlyParents}
                    onChange={() => {
                      setShowOnlyParents(!showOnlyParents);
                      setCurrentPage(1);
                    }}
                  />
                  <span className="ml-2 text-sm text-gray-700 flex items-center">
                    <FaFilter className="mr-1" /> Parent Categories Only
                  </span>
                </label>

                <button
                  onClick={() => {
                    setShowForm(!showForm);
                    setEditingCategoryId(null);
                    formik.resetForm();
                  }}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FaPlus className="mr-2" />
                  {showForm ? "Hide Form" : "Add Category"}
                </button>
              </div>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading categories...</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-500 mb-4">No categories found</div>
                <button
                  onClick={() => {
                    setShowForm(true);
                    setEditingCategoryId(null);
                    formik.resetForm();
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Your First Category
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Parent
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categories.map((category) => (
                      <tr
                        key={category.id}
                        className={`hover:bg-gray-50 ${
                          !category.parent_id ? "bg-blue-50" : ""
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {!category.parent_id && (
                              <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                            )}
                            <div className="text-sm font-medium text-gray-900">
                              {category.name}
                              {!category.parent_id && (
                                <span className="ml-2 text-xs text-blue-600">
                                  (Parent)
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {category.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {getParentName(category.parent_id)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs rounded-full font-medium ${
                              category.status === 1
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {category.status === 1 ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleEditClick(category)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(category.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {categories.length > 0 && !loading && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing page {currentPage} of {totalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      const prevPage = Math.max(currentPage - 1, 1);
                      setCurrentPage(prevPage);
                      fetchCategories(prevPage);
                    }}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === 1
                        ? "bg-gray-100 text-gray-400"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => {
                      const nextPage = Math.min(currentPage + 1, totalPages);
                      setCurrentPage(nextPage);
                      fetchCategories(nextPage);
                    }}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === totalPages
                        ? "bg-gray-100 text-gray-400"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Confirm Deletion
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this category? This action
                cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete
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
