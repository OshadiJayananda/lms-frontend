import React, { useState, useEffect } from "react";
import HeaderBanner from "../../Admin/components/HeaderBanner";
import ClientSidebar from "../../Components/ClientSidebar";
import { FaBell } from "react-icons/fa";
import api from "../../Components/Api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function Payments() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const navigate = useNavigate();

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
        <HeaderBanner book={"Payments"} heading_pic={heading_pic} />
      </div>
    </div>
  );
}
export default Payments;
