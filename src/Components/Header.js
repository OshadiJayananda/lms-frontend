import React from "react";
import { NavLink } from "react-router-dom";

function Header({ isCollapsed }) {
  return (
    <div className="bg-white shadow-sm w-full">
      <div className="flex items-center px-6 py-3 space-x-8 border-b border-gray-100">
        <NavLink
          to="/bookRequests"
          className={({ isActive }) =>
            `text-sm font-medium px-2 py-1 rounded-md transition-colors ${
              isActive
                ? "text-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
            }`
          }
        >
          Book Requests
        </NavLink>
        <NavLink
          to="/renewBooks"
          className={({ isActive }) =>
            `text-sm font-medium px-2 py-1 rounded-md transition-colors ${
              isActive
                ? "text-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
            }`
          }
        >
          Renew Requests
        </NavLink>
        <NavLink
          to="/returnedBooks"
          className={({ isActive }) =>
            `text-sm font-medium px-2 py-1 rounded-md transition-colors ${
              isActive
                ? "text-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
            }`
          }
        >
          Returned Books
        </NavLink>
        <NavLink
          to="/bookReservation"
          className={({ isActive }) =>
            `text-sm font-medium px-2 py-1 rounded-md transition-colors ${
              isActive
                ? "text-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
            }`
          }
        >
          Book Reservations
        </NavLink>
        <NavLink
          to="/memberInfo"
          className={({ isActive }) =>
            `text-sm font-medium px-2 py-1 rounded-md transition-colors ${
              isActive
                ? "text-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
            }`
          }
        >
          Member Info
        </NavLink>
      </div>
    </div>
  );
}

export default Header;
