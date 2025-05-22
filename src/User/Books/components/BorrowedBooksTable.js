import React from "react";
import {
  FaBook,
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

const BorrowedBooksTable = ({
  borrowedBooks,
  loading,
  error,
  searchQuery,
  handlePayFine,
  selectedStatus,
  currentPage,
  totalPages,
  onPageChange,
  totalCount,
}) => {
  const filteredBooks = borrowedBooks.filter(
    (borrow) =>
      (borrow.book.name.toLowerCase().includes(searchQuery) ||
        borrow.book.isbn.toLowerCase().includes(searchQuery) ||
        borrow.book.id.toString().includes(searchQuery)) &&
      (selectedStatus === "" ||
        (selectedStatus === "overdue"
          ? borrow.is_overdue || borrow.status.toLowerCase() === "overdue"
          : borrow.status.toLowerCase() === selectedStatus))
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  if (filteredBooks.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-md">
        <FaBook className="mx-auto text-gray-400 text-4xl mb-3" />
        <h3 className="text-lg font-medium text-gray-900">
          No borrowed books found
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {searchQuery
            ? "Try adjusting your search"
            : "You haven't borrowed any books yet"}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">Your Borrow History</h2>
        <p className="text-sm text-gray-600 mt-1">
          Showing {totalCount} book
          {totalCount !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Book
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dates
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredBooks.map((borrow) => {
              let statusClass = "bg-yellow-100 text-yellow-800";
              if (
                borrow.status === "Expired" ||
                borrow.status === "Overdue" ||
                borrow.is_overdue
              ) {
                statusClass = "bg-red-100 text-red-800";
              } else if (
                borrow.status === "Returned" ||
                borrow.status === "Confirmed"
              ) {
                statusClass = "bg-green-100 text-green-800";
              } else if (borrow.status === "Renewed") {
                statusClass = "bg-blue-100 text-blue-800";
              }

              return (
                <tr key={borrow.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-16 w-12">
                        <img
                          className="h-full w-full object-cover rounded"
                          src={borrow.book.image || "/default-book-cover.png"}
                          alt={borrow.book.name}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {borrow.book.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div>ID: {borrow.book.id}</div>
                    <div>ISBN: {borrow.book.isbn}</div>
                    <div>
                      Author: {borrow.book.author?.name || "Unknown Author"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex items-center mb-1">
                      <FaCalendarAlt className="mr-2 text-gray-400" />
                      <span className="font-medium">Issued:</span>{" "}
                      {borrow.issued_date
                        ? new Date(borrow.issued_date).toLocaleDateString()
                        : "Not Issued Yet"}
                    </div>
                    <div className="flex items-center">
                      <FaCalendarAlt className="mr-2 text-gray-400" />
                      <span className="font-medium">Due:</span>{" "}
                      {borrow.due_date
                        ? new Date(borrow.due_date).toLocaleDateString()
                        : "Not Issued Yet"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}`}
                    >
                      {borrow.status === "Confirmed"
                        ? "Return Confirmed"
                        : borrow.status}
                    </span>
                    {borrow.is_overdue && !borrow.fine_paid && (
                      <button
                        onClick={() => handlePayFine(borrow.id)}
                        className="ml-2 mt-2 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                      >
                        Pay Fine
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing page <span className="font-medium">{currentPage}</span>{" "}
                of <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === 1
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <FaChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                <button
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === totalPages
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <FaChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BorrowedBooksTable;
