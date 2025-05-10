import React, { useState } from "react";
import {
  FaUserCircle,
  FaHome,
  FaBook,
  FaHistory,
  FaMoneyBillWave,
  FaTags,
  FaBars,
  FaSignOutAlt,
  FaUserCog,
  FaUser,
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import api from "./Api";

function SideBar({ isCollapsed, onToggle }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const activeRoute = location.pathname.split("/")[2] || "dashboard";

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
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
      path: "/admin/dashboard",
      icon: <FaHome />,
      label: "Dashboard",
      key: "dashboard",
    },
    { path: "/admin/books", icon: <FaBook />, label: "Books", key: "books" },
    {
      path: "/admin/borrowed-history",
      icon: <FaHistory />,
      label: "Borrowed History",
      key: "borrowed-history",
    },
    {
      path: "/admin/payments",
      icon: <FaMoneyBillWave />,
      label: "Payments",
      key: "payments",
    },
    {
      path: "/admin/categories",
      icon: <FaTags />,
      label: "Categories",
      key: "categories",
    },
    {
      path: "/admin/authors",
      icon: <FaUser />,
      label: "Authors",
      key: "authors",
    },
  ];

  return (
    <div
      style={{
        width: isCollapsed ? "80px" : "250px",
        backgroundColor: "#1a365d",
        color: "#fff",
        height: "100vh",
        position: "fixed",
        transition: "width 0.3s ease",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        zIndex: 100,
        fontFamily: "'Roboto', sans-serif",
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: isCollapsed ? "center" : "space-between",
            width: "100%",
            marginBottom: "30px",
          }}
        >
          <button
            onClick={onToggle}
            style={{
              background: "none",
              border: "none",
              color: "#fff",
              fontSize: "24px",
              cursor: "pointer",
              padding: "5px",
              borderRadius: "4px",
              ":hover": { backgroundColor: "rgba(255,255,255,0.1)" },
            }}
            aria-label="Toggle sidebar"
          >
            <FaBars />
          </button>
          {!isCollapsed && (
            <h1
              style={{ fontSize: "20px", fontWeight: "600", color: "#63b3ed" }}
            >
              Admin Portal
            </h1>
          )}
        </div>

        <ul style={{ listStyleType: "none", padding: 0, width: "100%" }}>
          {navItems.map((item) => (
            <li key={item.key} style={{ margin: "8px 0" }}>
              <button
                onClick={() => navigate(item.path)}
                style={{
                  color: activeRoute === item.key ? "#63b3ed" : "#fff",
                  background:
                    activeRoute === item.key
                      ? "rgba(99, 179, 237, 0.1)"
                      : "transparent",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                  width: "100%",
                  padding: "12px 15px",
                  borderRadius: "6px",
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
          borderTop: "1px solid rgba(255,255,255,0.1)",
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
            borderRadius: "6px",
            transition: "all 0.2s",
            justifyContent: isCollapsed ? "center" : "flex-start",
            ":hover": { backgroundColor: "rgba(255,255,255,0.1)" },
          }}
        >
          <FaUserCircle size={24} style={{ color: "#63b3ed" }} />
          {!isCollapsed && (
            <span style={{ fontSize: "14px" }}>Admin Profile</span>
          )}
        </div>

        {/* Profile Dropdown - Fixed Positioning */}
        {showProfileMenu && (
          <div
            style={{
              position: "fixed",
              bottom: "80px",
              left: isCollapsed ? "80px" : "250px",
              backgroundColor: "#2d3748",
              color: "#fff",
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
                navigate("/admin/profile");
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
                ":hover": { backgroundColor: "rgba(99, 179, 237, 0.1)" },
              }}
            >
              <FaUserCog /> Admin Profile
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
                ":hover": { backgroundColor: "rgba(99, 179, 237, 0.1)" },
              }}
            >
              <FaSignOutAlt /> Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SideBar;
