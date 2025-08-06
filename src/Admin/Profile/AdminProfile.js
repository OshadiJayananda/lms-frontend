import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import api from "../../Components/Api";
import Modal from "react-modal";
import { toast } from "react-toastify";
import {
  FaUserCircle,
  FaTrash,
  FaCamera,
  FaLock,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaEdit,
  FaTimes,
  FaCalendarAlt,
} from "react-icons/fa";
import HeaderBanner from "../../Components/HeaderBanner";
import SideBar from "../../Components/SideBar";

Modal.setAppElement("#root");

function AdminProfile() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const heading_pic = process.env.PUBLIC_URL + "/images/heading_pic.jpg";

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const [userRes, profileRes] = await Promise.all([
          api.get("/user", {
            headers: { Authorization: `Bearer ${token}` },
            params: {
              include: "created_at,updated_at,email_verified_at",
            },
          }),
          api.get("/profile", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setUser({
          ...userRes.data,
          profile_picture: profileRes.data.profile_picture,
          created_at: userRes.data.created_at || new Date().toISOString(),
          updated_at: userRes.data.updated_at || new Date().toISOString(),
          email_verified_at: userRes.data.email_verified_at || null,
        });
      } catch (error) {
        toast.error("Error fetching user data");
        console.error("API Error:", error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profile_picture", file);

    try {
      const token = localStorage.getItem("token");
      const response = await api.post("/profile", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Profile picture updated successfully!");
      setUser((prev) => ({
        ...prev,
        profile_picture: response.data.profile_picture,
      }));
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error uploading profile picture"
      );
    }
  };

  const handleRemoveProfilePicture = async () => {
    try {
      const token = localStorage.getItem("token");
      await api.delete("/profile/1", {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Profile picture removed");
      setUser((prev) => ({ ...prev, profile_picture: null }));
      setIsDeleteModalOpen(false);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error removing profile picture"
      );
    }
  };

  const handlePasswordChange = async (values, { setSubmitting, resetForm }) => {
    try {
      const token = localStorage.getItem("token");
      await api.post(
        "/user/change-password",
        {
          current_password: values.currentPassword,
          password: values.newPassword,
          password_confirmation: values.confirmPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Password updated successfully!");
      resetForm();
      setPasswordModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating password");
    } finally {
      setSubmitting(false);
    }
  };

  const validationSchema = Yup.object().shape({
    currentPassword: Yup.string().required("Current password is required"),
    newPassword: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "Must contain uppercase, lowercase, number and special character"
      )
      .required("New password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
      .required("Confirm password is required"),
  });

  const handleUpdateUserDetails = async (
    values,
    { setSubmitting, setErrors }
  ) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication error. Please log in again.");
        return;
      }

      const response = await api.put("/user/update-details", values, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("User details updated successfully!");
      setUser((prev) => ({
        ...prev,
        ...values,
        updated_at: response.data.user.updated_at,
      }));
      setIsEditModalOpen(false);
    } catch (error) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors);
        toast.error("Please correct the validation errors");
      } else {
        toast.error(
          error.response?.data?.message || "Error updating user details"
        );
      }
    } finally {
      setSubmitting(false);
    }
  };
  const editValidationSchema = Yup.object().shape({
    name: Yup.string()
      .max(255, "Name must be less than 255 characters")
      .required("Name is required"),
    contact: Yup.string()
      .matches(/^[0-9]{10}$/, "Contact must be exactly 10 digits")
      .required("Contact is required"),
  });
  const ProfileInfoCard = ({
    icon,
    title,
    value,
    fieldName,
    editable = false,
  }) => (
    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
      <div className="p-3 bg-blue-100 rounded-full text-blue-600">{icon}</div>
      <div className="flex-1">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="mt-1 text-gray-900">{value || "Not provided"}</p>
      </div>
      {editable && (
        <button
          className="text-blue-600 hover:text-blue-800"
          onClick={() => {
            setEditingField(fieldName);
            setIsEditModalOpen(true);
          }}
        >
          <FaEdit />
        </button>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600 text-lg">Failed to load user data.</div>
      </div>
    );
  }
  const handleToggle = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
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
        <HeaderBanner book={"Admin Profile"} heading_pic={heading_pic} />

        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            {/* Profile Header */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full border-4 border-white/30 overflow-hidden bg-gray-200 shadow-lg">
                      {user.profile_picture ? (
                        <img
                          src={user.profile_picture}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FaUserCircle className="w-full h-full text-gray-400" />
                      )}
                    </div>
                    <label
                      htmlFor="profile-picture-upload"
                      className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                    >
                      <FaCamera className="text-white text-2xl" />
                    </label>
                    <input
                      type="file"
                      id="profile-picture-upload"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className="hidden"
                    />
                  </div>
                  <div className="text-center md:text-left">
                    <h1 className="text-2xl font-bold">{user.name}</h1>
                    <p className="text-blue-100 mt-1">{user.email}</p>
                    <div className="mt-4 flex flex-wrap gap-3 justify-center md:justify-start">
                      <button
                        onClick={() => setPasswordModalOpen(true)}
                        className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
                      >
                        <FaLock size={14} /> Change Password
                      </button>
                      {user.profile_picture && (
                        <button
                          onClick={() => setIsDeleteModalOpen(true)}
                          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
                        >
                          <FaTrash size={14} /> Remove Picture
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div className="p-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                  Profile Information
                </h2>
                <div className="space-y-4">
                  <ProfileInfoCard
                    icon={<FaUser />}
                    title="Full Name"
                    value={user.name}
                    fieldName="name"
                    editable
                  />
                  <ProfileInfoCard
                    icon={<FaEnvelope />}
                    title="Email Address"
                    value={user.email}
                  />
                  <ProfileInfoCard
                    icon={<FaPhone />}
                    title="Phone Number"
                    value={user.contact}
                    fieldName="contact"
                    editable
                  />
                  <ProfileInfoCard
                    icon={<FaCalendarAlt />}
                    title="Member Since"
                    value={new Date(user.created_at).toLocaleDateString()}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onRequestClose={() => setPasswordModalOpen(false)}
        className="modal"
        overlayClassName="modal-overlay"
      >
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 mx-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Change Password
            </h2>
            <button
              onClick={() => setPasswordModalOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <FaTimes />
            </button>
          </div>

          <Formik
            initialValues={{
              currentPassword: "",
              newPassword: "",
              confirmPassword: "",
            }}
            validationSchema={validationSchema}
            onSubmit={handlePasswordChange}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <Field
                    type="password"
                    name="currentPassword"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                      errors.currentPassword && touched.currentPassword
                        ? "border-red-500 focus:ring-red-200"
                        : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"
                    }`}
                  />
                  <ErrorMessage
                    name="currentPassword"
                    component="div"
                    className="mt-1 text-sm text-red-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <Field
                    type="password"
                    name="newPassword"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                      errors.newPassword && touched.newPassword
                        ? "border-red-500 focus:ring-red-200"
                        : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"
                    }`}
                  />
                  <ErrorMessage
                    name="newPassword"
                    component="div"
                    className="mt-1 text-sm text-red-600"
                  />
                  <div className="mt-1 text-xs text-gray-500">
                    Must be at least 8 characters with uppercase, lowercase,
                    number and special character
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <Field
                    type="password"
                    name="confirmPassword"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                      errors.confirmPassword && touched.confirmPassword
                        ? "border-red-500 focus:ring-red-200"
                        : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"
                    }`}
                  />
                  <ErrorMessage
                    name="confirmPassword"
                    component="div"
                    className="mt-1 text-sm text-red-600"
                  />
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setPasswordModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {isSubmitting ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </Modal>

      {/* Remove Picture Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onRequestClose={() => setIsDeleteModalOpen(false)}
        className="modal"
        overlayClassName="modal-overlay"
      >
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 mx-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Remove Profile Picture
            </h2>
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <FaTimes />
            </button>
          </div>

          <div className="text-center mb-6">
            <div className="mx-auto w-20 h-20 rounded-full overflow-hidden border-4 border-red-100 mb-4">
              <img
                src={user?.profile_picture}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-gray-600">
              Are you sure you want to remove your profile picture?
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleRemoveProfilePicture}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Remove Picture
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit User Details Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onRequestClose={() => setIsEditModalOpen(false)}
        className="modal"
        overlayClassName="modal-overlay"
      >
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 mx-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Update {editingField === "name" ? "Full Name" : "Phone Number"}
            </h2>
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <FaTimes />
            </button>
          </div>

          <Formik
            initialValues={{
              [editingField]: user[editingField] || "",
            }}
            validationSchema={
              editingField === "contact"
                ? Yup.object().shape({
                    contact: Yup.string()
                      .matches(/^[0-9]{10}$/, "Must be exactly 10 digits")
                      .required("Phone number is required"),
                  })
                : Yup.object().shape({
                    name: Yup.string().required("Name is required"),
                  })
            }
            onSubmit={handleUpdateUserDetails}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {editingField === "name" ? "Full Name" : "Phone Number"}
                  </label>
                  <Field
                    type={editingField === "name" ? "text" : "tel"}
                    name={editingField}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                      errors[editingField] && touched[editingField]
                        ? "border-red-500 focus:ring-red-200"
                        : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"
                    }`}
                  />
                  <ErrorMessage
                    name={editingField}
                    component="div"
                    className="mt-1 text-sm text-red-600"
                  />
                  {editingField === "contact" && (
                    <div className="mt-1 text-xs text-gray-500">
                      Must be exactly 10 digits (e.g., 0712345678)
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                      isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isSubmitting ? "Updating..." : "Update"}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </Modal>
    </div>
  );
}

export default AdminProfile;

// CSS for modals
const modalStyles = `
  .modal {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    z-index: 50;
  }
  
  .modal-overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 40;
  }
`;

// Add styles to document head
const styleElement = document.createElement("style");
styleElement.innerHTML = modalStyles;
document.head.appendChild(styleElement);
