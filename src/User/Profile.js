import React, { useEffect, useState } from "react";
import api from "../Components/Api";
import Modal from "react-modal";
import ClientHeaderBanner from "./components/ClientHeaderBanner";
import ClientSidebar from "../Components/ClientSidebar";

Modal.setAppElement("#root"); // Prevents accessibility issues

function Profile() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const heading_pic = process.env.PUBLIC_URL + "/images/heading_pic.jpg";

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const response = await api.get("/user", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
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
      const response = await api.post("/user/profile-picture", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.profile_picture) {
        alert("Profile picture updated successfully!");
        setUser((prevUser) => ({
          ...prevUser,
          profile_picture: response.data.profile_picture,
        }));
      } else {
        alert("Failed to update profile picture.");
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      alert("Error uploading profile picture.");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await api.post(
        "/user/change-password",
        { password: newPassword, password_confirmation: confirmPassword }, // Include confirmation
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordModalOpen(false); // Close the modal after success
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error updating password.";
      console.error("Error updating password:", error);
      alert(errorMessage); // Show more detailed error message
    }
  };

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
              <img
                src={user.profile_picture || "default-avatar.png"}
                alt="Profile"
                style={{
                  width: "150px",
                  height: "150px",
                  borderRadius: "75px",
                  backgroundColor: "grey",
                  objectFit: "cover",
                  border: "3px solid #001f5b",
                }}
              />
              <br />
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                style={{ marginTop: "10px", border: "none", cursor: "pointer" }}
              />
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
        <form onSubmit={handlePasswordChange}>
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "10px",
              border: "1px solid #ccc",
              borderRadius: "5px",
              fontSize: "16px",
            }}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "10px",
              border: "1px solid #ccc",
              borderRadius: "5px",
              fontSize: "16px",
            }}
          />
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
          >
            Update Password
          </button>
        </form>
      </Modal>
    </div>
  );
}

export default Profile;
