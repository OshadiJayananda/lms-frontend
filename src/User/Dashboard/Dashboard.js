import React, { useState } from "react";
import HeaderBanner from "../../Admin/components/HeaderBanner";
import ClientSidebar from "../../Components/ClientSidebar";

function Dashboard() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  const heading_pic = process.env.PUBLIC_URL + "/images/heading_pic.jpg";

  const handleToggle = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div>
      <ClientSidebar isCollapsed={isSidebarCollapsed} onToggle={handleToggle} />
      <div
        style={{
          marginLeft: isSidebarCollapsed ? "5%" : "20%",
          padding: "0px",
          transition: "margin-left 0.3s ease",
        }}
      >
        <HeaderBanner book={"Dashboard"} heading_pic={heading_pic} />

        <div style={{ padding: "20px" }}>
          <h2>Welcome to the Dashboard</h2>
          {/* Add additional dashboard content here */}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
