import React, { useState, useEffect } from "react";
import api from "../../Components/Api";
import SideBar from "../../Components/SideBar";
import HeaderBanner from "../components/HeaderBanner";
import Header from "../../Components/Header";
import { toast } from "react-toastify";

function BorrowedHistory() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredBooks, setFilteredBooks] = useState([]);

  const heading_pic = process.env.PUBLIC_URL + "/images/heading_pic.jpg";

  const handleToggle = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  // Fetch borrowed books
  const fetchBorrowedBooks = async () => {
    try {
      const response = await api.get(`/admin/borrowed-books?q=${searchQuery}`);
      setBorrowedBooks(response.data);
      setFilteredBooks(response.data);
    } catch (error) {
      setError("Failed to fetch borrowed books.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowedBooks();
  }, []);

  // Handle search by Book ID or User ID
  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    if (query === "") {
      // If the search query is empty, show all borrowed books
      setFilteredBooks(borrowedBooks);
    } else {
      // Filter borrowed books by Book ID or User ID
      const filtered = borrowedBooks.filter(
        (borrow) =>
          borrow.book.id.toString().includes(query) || // Search by Book ID
          borrow.user.id.toString().includes(query) // Search by User ID
      );
      setFilteredBooks(filtered);
    }
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
        <HeaderBanner book={"Borrow History"} heading_pic={heading_pic} />

        <div style={{ padding: "20px" }}>
          <div className="flex justify-between items-center mb-2">
            <div className="flex-1">
              <Header />
            </div>
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Search by Book ID or User ID..."
                value={searchQuery}
                onChange={handleSearch}
                className="border rounded-lg px-5 py-2 w-96"
              />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-4">Borrowed Book History</h2>

          {loading ? (
            <p>Loading borrowed books...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : filteredBooks.length === 0 ? (
            <p>No borrowed books found.</p>
          ) : (
            <div className="bg-white shadow-md rounded-lg overflow-x-auto p-6">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Book ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Book Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ISBN
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User Id
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
                        {borrow.user.id}
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

export default BorrowedHistory;
