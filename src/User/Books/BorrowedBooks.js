import React, { useState, useEffect } from "react";
import api from "../../Components/Api";
import ClientSidebar from "../../Components/ClientSidebar";
import ClientHeaderBanner from "../components/ClientHeaderBanner";
import { FaSearch, FaUndo, FaSyncAlt } from "react-icons/fa";

function BorrowedBooks() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const heading_pic = process.env.PUBLIC_URL + "/images/heading_pic.jpg";

  useEffect(() => {
    const fetchBorrowedBooks = async () => {
      try {
        const response = await api.get("/borrowed-books");
        setBorrowedBooks(response.data);
      } catch (error) {
        setError("Failed to fetch borrowed books. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchBorrowedBooks();
  }, []);

  const handleToggle = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const filteredBooks = borrowedBooks.filter(
    (borrow) =>
      borrow.book.name.toLowerCase().includes(searchQuery) ||
      borrow.book.isbn.toLowerCase().includes(searchQuery) ||
      borrow.book.id.toString().includes(searchQuery)
  );

  return (
    <div className="flex">
      <ClientSidebar isCollapsed={isSidebarCollapsed} onToggle={handleToggle} />
      <div
        className={`transition-all duration-300 ${
          isSidebarCollapsed ? "ml-[5%]" : "ml-[20%]"
        } w-full`}
      >
        <ClientHeaderBanner book={"Borrowed Books"} heading_pic={heading_pic} />

        <div className="p-6">
          {/* Search and Action Buttons */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search by Book ID, Name, or ISBN"
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
            <div className="flex gap-2">
              <button className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                <FaUndo className="mr-2" /> Return Book
              </button>
              <button className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                <FaSyncAlt className="mr-2" /> Renew Book
              </button>
            </div>
          </div>

          {/* Table Section */}
          {loading ? (
            <p className="text-gray-600">Loading borrowed books...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : filteredBooks.length === 0 ? (
            <p className="text-gray-600">No borrowed books found.</p>
          ) : (
            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                  Borrow History
                </h1>
                <p className="text-gray-600">
                  You can borrow up to 5 books at a time.
                </p>
              </div>
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Book ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ISBN
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Issued Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBooks.map((borrow) => (
                    <tr key={borrow.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {borrow.book.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {borrow.book.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {borrow.book.isbn}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(borrow.issued_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(borrow.due_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            borrow.status === "Returned"
                              ? "bg-green-100 text-green-800"
                              : borrow.status === "Expired"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {borrow.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BorrowedBooks;
