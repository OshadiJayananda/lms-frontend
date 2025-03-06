import React, { useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "./Api";

function ClientSidebar({ isCollapsed, onToggle }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No token found");
        return;
      }

      await api.post(
        "/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Clear token from storage
      localStorage.removeItem("token");

      // Redirect to login page
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setShowProfileMenu(false);
    }
  };

  return (
    <div
      style={{
        width: isCollapsed ? "5%" : "20%",
        backgroundColor: "#001f5b",
        color: "#fff",
        height: "100vh",
        position: "fixed",
        transition: "width 0.3s ease",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div
        style={{
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          alignItems: isCollapsed ? "center" : "flex-start",
        }}
      >
        <button
          style={{
            background: "none",
            border: "none",
            color: "#fff",
            fontSize: "20px",
            cursor: "pointer",
            marginBottom: "20px",
          }}
          onClick={onToggle}
        >
          ☰
        </button>
        {!isCollapsed && (
          <h1
            style={{
              textAlign: "center",
              fontSize: "24px",
              marginBottom: "30px",
              fontWeight: "bold",
            }}
          >
            Library
          </h1>
        )}
        <ul
          style={{
            listStyleType: "none",
            padding: 0,
            marginTop: isCollapsed ? "10px" : "30px",
          }}
        >
          <li style={{ margin: "10px 0" }}>
            <a
              href="/dashboard"
              style={{
                color: "#fff",
                textDecoration: "none",
                fontSize: isCollapsed ? "10px" : "16px",
              }}
            >
              Dashboard
            </a>
          </li>
          <li style={{ margin: "10px 0" }}>
            <a
              href="/books"
              style={{
                color: "#fff",
                textDecoration: "none",
                fontSize: isCollapsed ? "10px" : "16px",
              }}
            >
              Books
            </a>
          </li>
          <li style={{ margin: "10px 0" }}>
            <a
              href="/borrowedBook"
              style={{
                color: "#fff",
                textDecoration: "none",
                fontSize: isCollapsed ? "10px" : "16px",
              }}
            >
              Borrowed History
            </a>
          </li>
          <li style={{ margin: "10px 0" }}>
            <a
              href="#"
              style={{
                color: "#fff",
                textDecoration: "none",
                fontSize: isCollapsed ? "10px" : "16px",
              }}
            >
              Payments
            </a>
          </li>
        </ul>
      </div>

      {/* Profile Icon & Dropdown */}
      <div
        style={{
          position: "relative",
          padding: "20px",
          display: "flex",
          justifyContent: isCollapsed ? "center" : "flex-end",
        }}
      >
        <FaUserCircle
          size={isCollapsed ? 30 : 40}
          style={{ cursor: "pointer" }}
          onClick={() => setShowProfileMenu(!showProfileMenu)}
        />

        {/* Profile Dropdown Menu */}
        {showProfileMenu && (
          <div
            style={{
              position: "absolute",
              bottom: "60px",
              right: isCollapsed ? "0px" : "20px",
              backgroundColor: "#fff",
              color: "#000",
              borderRadius: "8px",
              boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
              width: "150px",
              display: "flex",
              flexDirection: "column",
              textAlign: "left",
              zIndex: 10,
            }}
          >
            <button
              style={{
                background: "none",
                border: "none",
                padding: "10px",
                cursor: "pointer",
                textAlign: "left",
                fontSize: "14px",
                borderBottom: "1px solid #ddd",
              }}
              onClick={() => {
                setShowProfileMenu(false);
                navigate("/profile");
              }}
            >
              View Profile
            </button>
            <button
              style={{
                background: "none",
                border: "none",
                padding: "10px",
                cursor: "pointer",
                textAlign: "left",
                fontSize: "14px",
              }}
              onClick={handleLogout}
            >
              Log Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ClientSidebar;
