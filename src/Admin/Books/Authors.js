import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import SideBar from "../../Components/SideBar";
import api from "../../Components/Api";
import { FaEdit, FaTrash, FaPlus, FaTimes } from "react-icons/fa";
import Header from "../../Components/Header";
import { toast } from "react-toastify";
import HeaderBanner from "../../Components/HeaderBanner";

function Authors() {
  const [authors, setAuthors] = useState([]);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [editingAuthorId, setEditingAuthorId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedAuthorId, setSelectedAuthorId] = useState(null);

  const heading_pic = process.env.PUBLIC_URL + "/images/heading_pic.jpg";

  const fetchAuthors = async () => {
    setLoading(true);
    try {
      const response = await api.get("/authors");
      setAuthors(response.data);
    } catch (error) {
      toast.error("Failed to load authors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthors();
  }, []);

  const formik = useFormik({
    initialValues: {
      name: "",
      bio: "",
      nationality: "",
      birth_date: "",
      death_date: "",
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      name: Yup.string()
        .required("Author name is required")
        .min(2, "Must be at least 2 characters"),
    }),
    onSubmit: async (values) => {
      try {
        if (editingAuthorId) {
          await api.put(`/authors/${editingAuthorId}`, values);
          toast.success("Author updated successfully!");
        } else {
          await api.post("/authors", values);
          toast.success("Author added successfully!");
        }
        handleReset();
        fetchAuthors();
      } catch (error) {
        toast.error("Failed to save author");
      }
    },
  });

  const handleReset = () => {
    formik.resetForm();
    setEditingAuthorId(null);
    setShowForm(false);
  };

  const handleEdit = (author) => {
    setEditingAuthorId(author.id);
    formik.setValues(author);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/authors/${selectedAuthorId}`);
      toast.success("Author deleted successfully");
      fetchAuthors();
    } catch {
      toast.error("Failed to delete author");
    }
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SideBar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!isSidebarCollapsed)}
      />
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        <HeaderBanner book="Authors Management" heading_pic={heading_pic} />
        <Header />
        <div className="p-6">
          {/* Author Form */}
          {showForm && (
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-blue-800">
                  {editingAuthorId ? "Edit Author" : "Add New Author"}
                </h2>
                <button
                  onClick={handleReset}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes size={20} />
                </button>
              </div>
              <form onSubmit={formik.handleSubmit} className="space-y-4">
                <input
                  type="text"
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  placeholder="Author Name *"
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <textarea
                  name="bio"
                  value={formik.values.bio}
                  onChange={formik.handleChange}
                  placeholder="Biography"
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <input
                  type="text"
                  name="nationality"
                  value={formik.values.nationality}
                  onChange={formik.handleChange}
                  placeholder="Nationality"
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="date"
                    name="birth_date"
                    value={formik.values.birth_date}
                    onChange={formik.handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                  <input
                    type="date"
                    name="death_date"
                    value={formik.values.death_date}
                    onChange={formik.handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                  >
                    {editingAuthorId ? "Update Author" : "Add Author"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Authors Table */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Author List</h2>
              <button
                onClick={() => {
                  setShowForm(!showForm);
                  setEditingAuthorId(null);
                  formik.resetForm();
                }}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                <FaPlus className="mr-2" />{" "}
                {showForm ? "Hide Form" : "Add Author"}
              </button>
            </div>
            {loading ? (
              <p>Loading authors...</p>
            ) : authors.length === 0 ? (
              <p>No authors found</p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Name
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Nationality
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {authors.map((author) => (
                    <tr key={author.id}>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        {author.name}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        {author.nationality || "-"}
                      </td>
                      <td className="px-4 py-2 text-sm text-right">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => handleEdit(author)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedAuthorId(author.id);
                              setShowModal(true);
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Delete Confirmation Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
                <p className="mb-6 text-gray-600">
                  Are you sure you want to delete this author?
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-md"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Authors;
