import React, { useState } from "react";
import SideBar from "../Components/SideBar";
import heading_pic from "../images/heading_pic.jpg";
import Header from "../Components/Header";
import HeaderBanner from "../Admin/components/HeaderBanner";

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
        <HeaderBanner book={"Book Section"} heading_pic={heading_pic} />
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
