import React, { useState } from "react";
import SideBar from "../../Components/SideBar";
import HeaderBanner from "../components/HeaderBanner";
import Header from "../../Components/Header";

function RenewBook() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  const heading_pic = process.env.PUBLIC_URL + "/images/heading_pic.jpg";

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
        <HeaderBanner book={"Renew Book"} heading_pic={heading_pic} />

        <div style={{ padding: "20px" }}>
          <div className="flex-1">
            <Header />
          </div>
          <h2>Welcome to the Renew book</h2>
          {/* Add additional dashboard content here */}
        </div>
      </div>
    </div>
  );
}

export default RenewBook;
