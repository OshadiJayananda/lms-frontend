import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import api from "../../Components/Api";
import Modal from "react-modal";
import ClientHeaderBanner from "../components/ClientHeaderBanner";
import ClientSidebar from "../../Components/ClientSidebar";
import { toast } from "react-toastify";
import { FaUserCircle, FaTrash } from "react-icons/fa";

Modal.setAppElement("#root"); // Prevents accessibility issues

function Profile() {
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
        toast.error("Error fetching user data:", error);
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

      toast.update("Profile picture updated successfully!");
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
      await api.delete(
        "/profile/1",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Profile picture removed.");
      setUser((prevUser) => ({ ...prevUser, profile_picture: null }));
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error removing profile picture:", error);
      toast.error("Error removing profile picture.");
    }
  };

  // if (loading) return <p>Loading...</p>;
  // if (!user) return <p>Failed to load user data.</p>;

  const handlePasswordChange = async (values, { setSubmitting, resetForm }) => {
    try {
      const token = localStorage.getItem("token");
      await api.post(
        "/user/change-password",
        {
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
    newPassword: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("New password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
      .required("Confirm password is required"),
  });

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>Failed to load user data.</p>;

  return (
    <div>
      <ClientSidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!isSidebarCollapsed)}
      />
      <div
        style={{
          marginLeft: isSidebarCollapsed ? "5%" : "20%",
          padding: "20px",
          transition: "margin-left 0.3s ease",
        }}
      >
        <ClientHeaderBanner book={"Profile"} heading_pic={heading_pic} />

        <div
          style={{ display: "flex", justifyContent: "center", padding: "20px" }}
        >
          <div
            style={{
              padding: "20px",
              maxWidth: "400px",
              margin: "0 auto",
              backgroundColor: "#f5f5f5",
              borderRadius: "10px",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: "150px",
                    height: "150px",
                    borderRadius: "50%",
                    backgroundColor: "grey",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "3px solid #001f5b",
                    overflow: "hidden",
                  }}
                >
                  {user.profile_picture ? (
                    <img
                      src={user.profile_picture}
                      alt="Profile"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <FaUserCircle size={100} color="white" />
                  )}
                </div>
                {user.profile_picture && (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="mt-2 bg-red-600 text-white border-none py-2 px-3 cursor-pointer rounded flex items-center gap-2"
                  >
                    <FaTrash /> Remove Picture
                  </button>
                )}
              </div>

              <br />
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                style={{ marginTop: "10px", border: "none", cursor: "pointer" }}
              />

              {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="bg-white p-5 rounded-lg shadow-lg text-center">
                    <p className="mb-4">
                      Are you sure you want to remove your profile picture?
                    </p>
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={handleRemoveProfilePicture}
                        className="bg-red-600 text-white py-2 px-4 rounded"
                      >
                        Yes, Remove
                      </button>
                      <button
                        onClick={() => setIsModalOpen(false)}
                        className="bg-gray-300 text-black py-2 px-4 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginBottom: "15px" }}>
              <strong>Name:</strong> {user.name}
            </div>
            <div style={{ marginBottom: "15px" }}>
              <strong>Email:</strong> {user.email}
            </div>
            <div style={{ marginBottom: "15px" }}>
              <strong>Address:</strong> {user.address}
            </div>
            <div style={{ marginBottom: "15px" }}>
              <strong>Contact:</strong> {user.contact}
            </div>
            <div style={{ marginBottom: "15px" }}>
              <strong>Role:</strong> {user.role || "User"}
            </div>

            <button
              style={{
                marginTop: "20px",
                padding: "12px",
                width: "100%",
                backgroundColor: "#001f5b",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "16px",
                transition: "background-color 0.3s",
              }}
              onClick={() => setPasswordModalOpen(true)}
            >
              Change Password
            </button>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onRequestClose={() => setPasswordModalOpen(false)}
        style={{
          content: {
            maxWidth: "400px",
            margin: "auto",
            padding: "20px",
            borderRadius: "10px",
            textAlign: "center",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
          },
        }}
      >
        <h2 style={{ marginBottom: "20px" }}>Change Password</h2>
        <Formik
          initialValues={{ newPassword: "", confirmPassword: "" }}
          validationSchema={validationSchema}
          onSubmit={handlePasswordChange}
        >
          {({ isSubmitting }) => (
            <Form>
              <div>
                <Field
                  type="password"
                  name="newPassword"
                  placeholder="New Password"
                  style={{
                    width: "100%",
                    padding: "12px",
                    marginBottom: "10px",
                    border: "1px solid #ccc",
                    borderRadius: "5px",
                    fontSize: "16px",
                  }}
                />
                <ErrorMessage
                  name="newPassword"
                  component="div"
                  style={{ color: "red" }}
                />
              </div>
              <div>
                <Field
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  style={{
                    width: "100%",
                    padding: "12px",
                    marginBottom: "10px",
                    border: "1px solid #ccc",
                    borderRadius: "5px",
                    fontSize: "16px",
                  }}
                />
                <ErrorMessage
                  name="confirmPassword"
                  component="div"
                  style={{ color: "red" }}
                />
              </div>
              <button
                type="submit"
                style={{
                  padding: "12px",
                  width: "100%",
                  backgroundColor: "#001f5b",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontSize: "16px",
                  transition: "background-color 0.3s",
                }}
                disabled={isSubmitting}
              >
                Update Password
              </button>
            </Form>
          )}
        </Formik>
      </Modal>
    </div>
  );
}

export default Profile;
