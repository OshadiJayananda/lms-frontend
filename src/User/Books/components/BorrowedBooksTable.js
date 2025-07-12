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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Your Borrow History
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Showing {borrowedBooks.length} of {totalCount} book
              {totalCount !== 1 ? "s" : ""}
            </p>
          </div>
          {/* <div className="text-sm bg-blue-50 text-blue-800 px-4 py-2 rounded-lg">
            <span className="font-medium">Tip:</span> Click on the book cover
            for more details
          </div> */}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Book Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Borrow Information
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                  <td className="px-6 py-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-24 w-16 cursor-pointer hover:shadow-md transition-shadow">
                        <img
                          className="h-full w-full object-cover rounded-lg"
                          src={borrow.book.image || "/default-book-cover.png"}
                          alt={borrow.book.name}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-gray-900">
                          {borrow.book.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          <div>ID: {borrow.book.id}</div>
                          <div>ISBN: {borrow.book.isbn}</div>
                          <div>
                            Author: {borrow.book.author?.name || "Unknown"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 space-y-2">
                      <div className="flex items-center">
                        <FaCalendarAlt className="mr-2 text-gray-400 flex-shrink-0" />
                        <div>
                          <span className="font-medium">Issued:</span>{" "}
                          {borrow.issued_date
                            ? new Date(borrow.issued_date).toLocaleDateString()
                            : "Not Issued Yet"}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <FaCalendarAlt className="mr-2 text-gray-400 flex-shrink-0" />
                        <div>
                          <span className="font-medium">Due:</span>{" "}
                          {borrow.due_date
                            ? new Date(borrow.due_date).toLocaleDateString()
                            : "Not Issued Yet"}
                          {borrow.is_overdue && (
                            <span className="ml-2 text-xs text-red-600">
                              ({daysOverdue} day{daysOverdue !== 1 ? "s" : ""}{" "}
                              overdue)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-start space-y-2">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}`}
                      >
                        {statusText}
                      </span>
                      {borrow.is_overdue && !borrow.fine_paid && (
                        <button
                          onClick={() => handlePayFine(borrow.id)}
                          className="flex items-center px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs transition-colors"
                        >
                          <FaMoneyBillWave className="mr-1" />
                          Pay Fine
                        </button>
                      )}
                      {/* {borrow.fine_paid && (
                        <span className="text-xs text-green-600">
                          Fine paid
                        </span>
                      )} */}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Enhanced Pagination Controls */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-700">
            Showing{" "}
            <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> to{" "}
            <span className="font-medium">
              {Math.min(currentPage * 10, totalCount)}
            </span>{" "}
            of <span className="font-medium">{totalCount}</span> results
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`flex items-center px-3 py-1 rounded-md border ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              <FaChevronLeft className="h-3 w-3 mr-1" />
              Previous
            </button>

            <div className="px-3 py-1 text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </div>

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`flex items-center px-3 py-1 rounded-md border ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Next
              <FaChevronRight className="h-3 w-3 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BorrowedBooksTable;
