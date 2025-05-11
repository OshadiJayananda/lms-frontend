import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import SideBar from "../../Components/SideBar";
import api from "../../Components/Api";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaTimes,
  FaBook,
  FaUserTie,
} from "react-icons/fa";
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
      birth_date: Yup.date()
        .max(new Date(), "Birth date cannot be in the future")
        .nullable(),
      death_date: Yup.date()
        .min(Yup.ref("birth_date"), "Death date must be after birth date")
        .nullable(),
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
    formik.setValues({
      ...author,
      birth_date: author.birth_date ? author.birth_date.split("T")[0] : "",
      death_date: author.death_date ? author.death_date.split("T")[0] : "",
    });
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
    <div className="min-h-screen bg-gray-50 flex ">
      <SideBar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!isSidebarCollapsed)}
      />
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        <HeaderBanner
          book="Authors Management"
          heading_pic={heading_pic}
          Icon={FaUserTie}
        />
        <Header />
        <div className="p-6">
          {/* Author Form */}
          {showForm && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border-l-4 border-blue-600">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <FaUserTie className="mr-2 text-blue-600" />
                  {editingAuthorId ? "Edit Author" : "Add New Author"}
                </h2>
                <button
                  onClick={handleReset}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <FaTimes size={20} />
                </button>
              </div>
              <form onSubmit={formik.handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Author Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    placeholder="e.g. J.K. Rowling"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      formik.errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {formik.errors.name && (
                    <p className="mt-1 text-sm text-red-600">
                      {formik.errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Biography
                  </label>
                  <textarea
                    name="bio"
                    value={formik.values.bio}
                    onChange={formik.handleChange}
                    placeholder="Brief biography of the author..."
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nationality
                    </label>
                    <input
                      type="text"
                      name="nationality"
                      value={formik.values.nationality}
                      onChange={formik.handleChange}
                      placeholder="e.g. British"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Birth Date
                    </label>
                    <input
                      type="date"
                      name="birth_date"
                      value={formik.values.birth_date}
                      onChange={formik.handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {formik.errors.birth_date && (
                      <p className="mt-1 text-sm text-red-600">
                        {formik.errors.birth_date}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Death Date
                    </label>
                    <input
                      type="date"
                      name="death_date"
                      value={formik.values.death_date}
                      onChange={formik.handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {formik.errors.death_date && (
                      <p className="mt-1 text-sm text-red-600">
                        {formik.errors.death_date}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    {editingAuthorId ? (
                      <>
                        <FaEdit className="mr-2" /> Update Author
                      </>
                    ) : (
                      <>
                        <FaPlus className="mr-2" /> Add Author
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Authors Table */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <FaBook className="mr-2 text-blue-600" />
                Author Catalog
              </h2>
              <button
                onClick={() => {
                  setShowForm(!showForm);
                  setEditingAuthorId(null);
                  formik.resetForm();
                }}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaPlus className="mr-2" />
                {showForm ? "Hide Form" : "Add Author"}
              </button>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading authors...</p>
              </div>
            ) : authors.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-500 mb-4">
                  No authors found in the library
                </div>
                <button
                  onClick={() => {
                    setShowForm(true);
                    setEditingAuthorId(null);
                    formik.resetForm();
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add First Author
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Author
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nationality
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bio
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {authors.map((author) => (
                      <tr key={author.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <FaUserTie className="text-blue-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {author.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {author.birth_date
                                  ? new Date(author.birth_date).getFullYear()
                                  : "?"}
                                {author.death_date &&
                                  ` - ${new Date(
                                    author.death_date
                                  ).getFullYear()}`}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {author.nationality || (
                              <span className="text-gray-400">Unknown</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {author.bio || (
                              <span className="text-gray-400">
                                No bio available
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleEdit(author)}
                              className="text-blue-600 hover:text-blue-900 p-2 rounded-full hover:bg-blue-50"
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedAuthorId(author.id);
                                setShowModal(true);
                              }}
                              className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50"
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
          </div>

          {/* Delete Confirmation Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <div className="flex items-center mb-4">
                  <div className="bg-red-100 p-3 rounded-full mr-4">
                    <FaTrash className="text-red-600 text-xl" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    Confirm Author Deletion
                  </h3>
                </div>
                <p className="mb-6 text-gray-600 pl-16">
                  Are you sure you want to permanently remove this author from
                  the library system? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                  >
                    <FaTrash className="mr-2" /> Delete Author
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
