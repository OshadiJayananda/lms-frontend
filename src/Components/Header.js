import React, { useState } from "react";

function Header() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div
      style={{
        marginLeft: isSidebarCollapsed ? "5%" : "1%",
        display: "flex",
        padding: "10px 0",
        gap: "15px",
      }}
    >
      <a
        href="/bookRequests"
        style={{
          color: "#000",
          textDecoration: "none",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        Book Requests
      </a>
      <a
        href="/renewBooks"
        style={{
          color: "#000",
          textDecoration: "none",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        Renew Requests
      </a>
      <a
        href="/returnedBooks"
        style={{
          color: "#000",
          textDecoration: "none",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        Returned Books
      </a>
      <a
        href="/bookReservation"
        style={{
          color: "#000",
          textDecoration: "none",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        Book reservations
      </a>
      <a
        href="#"
        style={{
          color: "#000",
          textDecoration: "none",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        Member Info
      </a>
    </div>
  );
}

export default Header;
