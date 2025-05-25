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
} from "react-icons/fa";
import HeaderBanner from "../../Components/HeaderBanner";
import SideBar from "../../Components/SideBar";

Modal.setAppElement("#root");

function AdminProfile() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const heading_pic = process.env.PUBLIC_URL + "/images/heading_pic.jpg";

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const userResponse = await api.get("/user", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const picResponse = await api.get("/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser({
          ...userResponse.data,
          profile_picture: picResponse.data.profile_picture,
        });
      } catch (error) {
        toast.error("Error fetching user data");
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
      setUser((prevUser) => ({
        ...prevUser,
        profile_picture: response.data.profile_picture,
      }));
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      toast.error("Error uploading profile picture.");
    }
  };

  const handleRemoveProfilePicture = async () => {
    try {
      const token = localStorage.getItem("token");
      await api.delete("/profile/1", {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Profile picture removed.");
      setUser((prevUser) => ({ ...prevUser, profile_picture: null }));
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error removing profile picture:", error);
      toast.error("Error removing profile picture.");
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
      const errorMessage =
        error.response?.data?.message || "Error updating password.";
      console.error("Error updating password:", error);
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const validationSchema = Yup.object().shape({
    currentPassword: Yup.string().required("Current password is required"),
    newPassword: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("New password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
      .required("Confirm password is required"),
  });

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
      <SideBar isCollapsed={isSidebarCollapsed} onToggle={handleToggle} />

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        <HeaderBanner
          book={"Admin Profile"}
          heading_pic={heading_pic}
          className="w-full"
        />

        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-white">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-gray-200">
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
                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
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
                    <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                      <button
                        onClick={() => setPasswordModalOpen(true)}
                        className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        <FaLock /> Change Password
                      </button>
                      {user.profile_picture && (
                        <button
                          onClick={() => setIsModalOpen(true)}
                          className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                        >
                          <FaTrash /> Remove Picture
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-gray-600">
                      <FaUser className="text-blue-600" />
                      <span>Name:</span>
                      <span className="font-medium text-gray-800">
                        {user.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <FaEnvelope className="text-blue-600" />
                      <span>Email:</span>
                      <span className="font-medium text-gray-800">
                        {user.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <FaPhone className="text-blue-600" />
                      <span>Phone:</span>
                      <span className="font-medium text-gray-800">
                        {user.phone || "Not provided"}
                      </span>
                    </div>
                  </div>
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
        className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-50"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Change Password
          </h2>
          <Formik
            initialValues={{
              currentPassword: "",
              newPassword: "",
              confirmPassword: "",
            }}
            validationSchema={validationSchema}
            onSubmit={handlePasswordChange}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <Field
                    type="password"
                    name="currentPassword"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <ErrorMessage
                    name="newPassword"
                    component="div"
                    className="mt-1 text-sm text-red-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <Field
                    type="password"
                    name="confirmPassword"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
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
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-50"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Remove Profile Picture
          </h2>
          <p className="text-gray-600 mb-6">
            Are you sure you want to remove your profile picture? This action
            cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleRemoveProfilePicture}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Remove Picture
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default AdminProfile;
