import React from "react";
import { FaSearch, FaUndo, FaSyncAlt, FaInfoCircle } from "react-icons/fa";
import Select from "react-select";

const statusOptions = [
  { value: "", label: "All Statuses" },
  // { value: "borrowed", label: "Borrowed" },
  { value: "returned", label: "Returned" },
  { value: "overdue", label: "Overdue" },
  { value: "confirmed", label: "Confirmed" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "issued", label: "Issued" },
  // { value: "expired", label: "Expired" },
  { value: "rejected", label: "Rejected" },
];

const BookSearchSection = ({
  borrowLimit,
  searchQuery,
  setSearchQuery,
  selectedBookIdInput,
  setSelectedBookIdInput,
  handleReturnBook,
  handleRenewBook,
  selectedStatus,
  setSelectedStatus,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Manage Your Books
          </h2>
          <div className="flex items-center text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-lg">
            <FaInfoCircle className="mr-2 text-blue-500" />
            You can borrow up to {borrowLimit} books at a time
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Status:
            </label>
            <Select
              options={statusOptions}
              value={statusOptions.find((opt) => opt.value === selectedStatus)}
              onChange={(selected) => setSelectedStatus(selected.value)}
              isSearchable={true}
              styles={{
                control: (base) => ({
                  ...base,
                  fontSize: "0.875rem",
                  borderColor: "#D1D5DB",
                }),
              }}
            />
          </div>
        </div>

        <div className="w-full md:w-1/2">
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by title, ISBN, or book ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
              className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Book ID for Actions:
              </label>
              <input
                type="text"
                placeholder="Enter book ID"
                value={selectedBookIdInput}
                onChange={(e) => setSelectedBookIdInput(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-end gap-2">
              <button
                className="flex-1 flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                onClick={handleReturnBook}
                disabled={!selectedBookIdInput}
              >
                <FaUndo className="mr-2" /> Return
              </button>
              <button
                className="flex-1 flex items-center justify-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                onClick={handleRenewBook}
                disabled={!selectedBookIdInput}
              >
                <FaSyncAlt className="mr-2" /> Renew
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookSearchSection;
