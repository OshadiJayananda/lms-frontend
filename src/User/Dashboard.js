import React, { useState } from "react";
import SideBar from "../Components/SideBar";
import heading_pic from "../images/heading_pic.jpg";
import Header from "../Components/Header";

function Dashboard() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleToggle = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div>
      <SideBar isCollapsed={isSidebarCollapsed} onToggle={handleToggle} />
      <div
        style={{
          marginLeft: isSidebarCollapsed ? "5%" : "20%",
          padding: "0px",
          transition: "margin-left 0.3s ease",
        }}
      >
        <div
          style={{
            backgroundImage: `url(${heading_pic})`,
            height: "100px",
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "relative",
            filter: "brightness(150%)", // Increase brightness to lighten the image
          }}
        >
          {/* Heading on top of the header picture */}
          <h1
            style={{
              fontSize: "40px",
              textAlign: "left", // Align text to the left
              padding: "20px", // Add some margin for spacing
              color: "#000", // Set text color to black
              fontWeight: "bold", // Make text bold
            }}
          >
            Dashboard
          </h1>
        </div>
        <div>
          <Header />
        </div>
        <div style={{ padding: "20px" }}>
          <h2>Welcome to the Dashboard</h2>
          {/* Add additional dashboard content here */}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
