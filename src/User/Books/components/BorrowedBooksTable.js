import React from "react";
import {
  FaBook,
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaMoneyBillWave,
  FaInfoCircle,
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
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  function toDateOnly(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function calculateDaysOverdue(dueDate, returnedDate) {
    const end = toDateOnly(returnedDate ? returnedDate : Date.now());
    const start = toDateOnly(dueDate);
    const msInDay = 1000 * 60 * 60 * 24;
    return Math.ceil((end - start) / msInDay);
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
        <div className="flex items-center">
          <FaInfoCircle className="text-red-500 mr-2" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (borrowedBooks.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm">
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
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
              Your Borrow History
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Showing {borrowedBooks.length} of {totalCount} book
              {totalCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Book Details
              </th>
              <th className="px-4 py-3 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Borrow Info
              </th>
              <th className="px-4 py-3 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {borrowedBooks.map((borrow) => {
              let statusClass = "bg-yellow-100 text-yellow-800";
              let statusText = borrow.status;

              if (
                borrow.status === "Expired" ||
                borrow.status === "Overdue" ||
                borrow.is_overdue
              ) {
                statusClass = "bg-red-100 text-red-800";
                if (borrow.status === "Confirmed") {
                  statusText = "Return Confirmed";
                }
              } else if (
                borrow.status === "Returned" ||
                borrow.status === "Confirmed"
              ) {
                statusClass = "bg-green-100 text-green-800";
                statusText =
                  borrow.status === "Confirmed"
                    ? "Return Confirmed"
                    : "Returned";
              } else if (borrow.status === "Renewed") {
                statusClass = "bg-blue-100 text-blue-800";
              }
              const daysOverdue = borrow.is_overdue
                ? calculateDaysOverdue(borrow.due_date, borrow.returned_date)
                : 0;

              return (
                <tr key={borrow.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-4 sm:px-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-16 w-12 sm:h-24 sm:w-16 cursor-pointer hover:shadow-md transition-shadow">
                        <img
                          className="h-full w-full object-cover rounded"
                          src={borrow.book.image || "/default-book-cover.png"}
                          alt={borrow.book.name}
                        />
                      </div>
                      <div className="ml-3 sm:ml-4">
                        <div className="text-sm font-medium text-gray-900 line-clamp-2">
                          {borrow.book.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                          <div className="line-clamp-1">
                            ID: {borrow.book.id}
                          </div>
                          <div className="line-clamp-1">
                            ISBN: {borrow.book.isbn}
                          </div>
                          <div className="line-clamp-1">
                            Author: {borrow.book.author?.name || "Unknown"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 sm:px-6">
                    <div className="text-xs sm:text-sm text-gray-900 space-y-1.5">
                      <div className="flex items-start">
                        <FaCalendarAlt className="mr-1.5 mt-0.5 text-gray-400 flex-shrink-0 text-xs" />
                        <div>
                          <span className="font-medium">Issued:</span>{" "}
                          {borrow.issued_date
                            ? new Date(borrow.issued_date).toLocaleDateString()
                            : "Not Issued"}
                        </div>
                      </div>
                      <div className="flex items-start">
                        <FaCalendarAlt className="mr-1.5 mt-0.5 text-gray-400 flex-shrink-0 text-xs" />
                        <div>
                          <span className="font-medium">Due:</span>{" "}
                          {borrow.due_date
                            ? new Date(borrow.due_date).toLocaleDateString()
                            : "Not Issued"}
                          {borrow.is_overdue && (
                            <span className="ml-1 text-xs text-red-600">
                              ({daysOverdue} day{daysOverdue !== 1 ? "s" : ""}{" "}
                              overdue)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 sm:px-6">
                    <div className="flex flex-col items-start space-y-1.5">
                      <span
                        className={`px-2 py-0.5 sm:px-3 sm:py-1 inline-flex text-xs leading-4 sm:leading-5 font-semibold rounded-full ${statusClass}`}
                      >
                        {statusText}
                      </span>
                      {borrow.is_overdue && !borrow.fine_paid && (
                        <button
                          onClick={() => handlePayFine(borrow.id)}
                          className="flex items-center px-2 py-0.5 sm:px-3 sm:py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs transition-colors"
                        >
                          <FaMoneyBillWave className="mr-1 text-xs" />
                          Pay Fine
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Responsive Pagination */}
      <div className="px-4 sm:px-6 py-3 border-t border-gray-200 bg-gray-50">
        <div className="flex flex-col xs:flex-row items-center justify-between gap-3">
          <div className="text-xs sm:text-sm text-gray-600">
            Showing{" "}
            <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> to{" "}
            <span className="font-medium">
              {Math.min(currentPage * 10, totalCount)}
            </span>{" "}
            of <span className="font-medium">{totalCount}</span> results
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`flex items-center px-2 py-1 sm:px-3 sm:py-1 rounded border text-xs ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              <FaChevronLeft className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">Prev</span>
            </button>

            <div className="px-2 py-1 text-xs sm:text-sm text-gray-700">
              {currentPage}/{totalPages}
            </div>

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`flex items-center px-2 py-1 sm:px-3 sm:py-1 rounded border text-xs ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              <span className="hidden sm:inline">Next</span>
              <span className="sm:hidden">Next</span>
              <FaChevronRight className="h-2.5 w-2.5 sm:h-3 sm:w-3 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BorrowedBooksTable;
