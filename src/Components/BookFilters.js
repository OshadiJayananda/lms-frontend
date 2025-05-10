import React from "react";
import { FaSearch } from "react-icons/fa";

const BookFilters = ({ searchQuery, onSearch }) => {
  return (
    <div className="relative w-full md:w-2/3">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <FaSearch className="text-gray-400" />
      </div>
      <input
        type="text"
        placeholder="Search by title, author..."
        value={searchQuery}
        onChange={(e) => onSearch(e.target.value)}
        className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
      />
    </div>
  );
};

export default BookFilters;
