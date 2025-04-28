import React, { useState } from "react";
import {
  FaUserCircle,
  FaBook,
  FaHistory,
  FaCreditCard,
  FaHome,
  FaBars,
  FaSignOutAlt,
  FaUser,
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import api from "./Api";

function ClientSidebar({ isCollapsed, onToggle }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const activeRoute = location.pathname.split("/")[1] || "dashboard";

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
        { headers: { Authorization: `Bearer ${token}` } }
      );
      localStorage.removeItem("token");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setShowProfileMenu(false);
    }
  };

  const navItems = [
    {
      path: "/dashboard",
      icon: <FaHome />,
      label: "Dashboard",
      key: "dashboard",
    },
    { path: "/books", icon: <FaBook />, label: "Books", key: "books" },
    {
      path: "/borrowedBook",
      icon: <FaHistory />,
      label: "Borrowed History",
      key: "borrowedBook",
    },
    {
      path: "/payments",
      icon: <FaCreditCard />,
      label: "Payments",
      key: "payments",
    },
  ];

  return (
    <div
      style={{
        width: isCollapsed ? "80px" : "250px",
        backgroundColor: "#2c3e50",
        color: "#ecf0f1",
        height: "100vh",
        position: "fixed",
        transition: "width 0.3s ease",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        zIndex: 100,
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      {/* Navigation Items */}
      <div
        style={{
          padding: "20px 10px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <button
          onClick={onToggle}
          style={{
            background: "none",
            border: "none",
            color: "#ecf0f1",
            fontSize: "24px",
            cursor: "pointer",
            marginBottom: "30px",
            alignSelf: isCollapsed ? "center" : "flex-start",
          }}
          aria-label="Toggle sidebar"
        >
          <FaBars />
        </button>

        {!isCollapsed && (
          <h1
            style={{
              fontSize: "22px",
              marginBottom: "40px",
              fontWeight: "600",
              color: "#f1c40f",
              paddingLeft: "10px",
              borderLeft: "3px solid #f1c40f",
            }}
          >
            Library Portal
          </h1>
        )}

        <ul style={{ listStyleType: "none", padding: 0, width: "100%" }}>
          {navItems.map((item) => (
            <li key={item.key} style={{ margin: "15px 0" }}>
              <button
                onClick={() => navigate(item.path)}
                style={{
                  color: activeRoute === item.key ? "#f1c40f" : "#ecf0f1",
                  background:
                    activeRoute === item.key
                      ? "rgba(241, 196, 15, 0.1)"
                      : "transparent",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                  width: "100%",
                  padding: "10px",
                  borderRadius: "5px",
                  transition: "all 0.2s",
                  fontSize: isCollapsed ? "24px" : "16px",
                  justifyContent: isCollapsed ? "center" : "flex-start",
                }}
              >
                {item.icon}
                {!isCollapsed && item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Profile Section */}
      <div
        style={{
          position: "relative",
          padding: "20px 10px",
          borderTop: "1px solid rgba(236, 240, 241, 0.1)",
        }}
      >
        <div
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            cursor: "pointer",
            padding: "10px",
            borderRadius: "5px",
            transition: "all 0.2s",
            justifyContent: isCollapsed ? "center" : "flex-start",
            ":hover": { backgroundColor: "rgba(236, 240, 241, 0.1)" },
          }}
        >
          <FaUserCircle size={24} style={{ color: "#f1c40f" }} />
          {!isCollapsed && <span style={{ fontSize: "14px" }}>My Account</span>}
        </div>

        {/* Profile Dropdown - Fixed Positioning */}
        {showProfileMenu && (
          <div
            style={{
              position: "fixed",
              bottom: "80px",
              left: isCollapsed ? "80px" : "250px",
              backgroundColor: "#34495e",
              color: "#ecf0f1",
              borderRadius: "8px",
              boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
              width: "180px",
              overflow: "hidden",
              zIndex: 1000,
              marginLeft: "10px",
              transition: "all 0.3s ease",
            }}
          >
            <button
              onClick={() => {
                setShowProfileMenu(false);
                navigate("/profile");
              }}
              style={{
                background: "none",
                border: "none",
                padding: "12px 15px",
                cursor: "pointer",
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                transition: "all 0.2s",
                ":hover": { backgroundColor: "rgba(241, 196, 15, 0.1)" },
              }}
            >
              <FaUser /> View Profile
            </button>
            <button
              onClick={handleLogout}
              style={{
                background: "none",
                border: "none",
                padding: "12px 15px",
                cursor: "pointer",
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                transition: "all 0.2s",
                ":hover": { backgroundColor: "rgba(241, 196, 15, 0.1)" },
              }}
            >
              <FaSignOutAlt /> Log Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ClientSidebar;
