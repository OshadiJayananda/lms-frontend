import React, { useState } from "react";
import HeaderBanner from "../../Components/HeaderBanner";
import ClientSidebar from "../../Components/ClientSidebar";

import api from "../../Components/Api";
import { toast } from "react-toastify";

function Payments() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const heading_pic = process.env.PUBLIC_URL + "/images/heading_pic.jpg";
  const FONT_FAMILY =
    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  const handleToggle = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div
      className="min-h-screen bg-gray-50 flex"
      style={{ fontFamily: FONT_FAMILY }}
    >
      <ClientSidebar isCollapsed={isSidebarCollapsed} onToggle={handleToggle} />
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        <HeaderBanner
          book="Payments"
          heading_pic={heading_pic}
          className="w-full"
        />

        <div className="p-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Welcome to Payment
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payments;
