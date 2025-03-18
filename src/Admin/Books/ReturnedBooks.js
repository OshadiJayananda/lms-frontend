import React, { useState, useEffect } from "react";
import api from "../../Components/Api";
import SideBar from "../../Components/SideBar";
import HeaderBanner from "../components/HeaderBanner";
import Header from "../../Components/Header";
import { toast } from "react-toastify";

function ReturnedBooks() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [returnedBooks, setReturnedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const heading_pic = process.env.PUBLIC_URL + "/images/heading_pic.jpg";

  const fetchReturnedBooks = async () => {
    try {
      const response = await api.get("/admin/returned-books");
      setReturnedBooks(response.data);
    } catch (error) {
      setError("Failed to fetch returned books.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturnedBooks();
  }, []);

  const handleToggle = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleConfirmReturn = async (borrowId) => {
    try {
      const response = await api.post(
        `/admin/returned-books/${borrowId}/confirm`
      );
      toast.success(response.data.message);
      fetchReturnedBooks(); // Refresh the list of returned books
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to confirm the return."
      );
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
        <HeaderBanner book={"Returned Books"} heading_pic={heading_pic} />

        <div style={{ padding: "20px" }}>
          <div className="flex-1">
            <Header />
          </div>

          {loading ? (
            <p>Loading returned books...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : returnedBooks.length === 0 ? (
            <p>No returned books found.</p>
          ) : (
            <div className="bg-white shadow-md rounded-lg overflow-x-auto p-6">
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
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Returned Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {returnedBooks.map((borrow) => (
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
                        {borrow.user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(borrow.updated_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                          onClick={() => handleConfirmReturn(borrow.id)}
                        >
                          Confirm Return
                        </button>
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

export default ReturnedBooks;
