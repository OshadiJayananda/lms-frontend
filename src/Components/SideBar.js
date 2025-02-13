import React, { useState } from "react";

function SideBar({ isCollapsed, onToggle }) {
  return (
    <div
      style={{
        width: isCollapsed ? "5%" : "20%",
        backgroundColor: "#001f5b",
        color: "#fff",
        height: "100vh",
        position: "fixed",
        transition: "width 0.3s ease",
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
              href="#"
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
          <li style={{ margin: "10px 0" }}>
            <a
              href="/categories"
              style={{
                color: "#fff",
                textDecoration: "none",
                fontSize: isCollapsed ? "10px" : "16px",
              }}
            >
              Categories
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
              Log Out
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default SideBar;
