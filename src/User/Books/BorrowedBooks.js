import React, { useState, useEffect } from "react";
import api from "../../Components/Api";
import ClientSidebar from "../../Components/ClientSidebar";
import HeaderBanner from "../../Components/HeaderBanner";
import BookSearchSection from "./components/BookSearchSection";
import BorrowedBooksTable from "./components/BorrowedBooksTable";
import RenewModal from "./components/RenewModal";
import ConfirmUnavailableModal from "./components/ConfirmUnavailableModal";
import { toast } from "react-toastify";
import { loadStripe } from "@stripe/stripe-js";

function BorrowedBooks() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [exactReturnDate, setExactReturnDate] = useState(null);
  const [renewDate, setRenewDate] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [bookAvailability] = useState(null);
  const [selectedBookIdInput, setSelectedBookIdInput] = useState("");
  const [borrowLimit, setBorrowLimit] = useState(5);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [perPage] = useState(10);

  const heading_pic = process.env.PUBLIC_URL + "/images/heading_pic.jpg";
  const stripePromise = loadStripe(
    process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY
  );

  const fetchBorrowedBooks = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage,
        per_page: perPage,
        search: searchQuery,
        status: selectedStatus,
      });

      const response = await api.get(`/borrowed-books?${params}`);
      setBorrowedBooks(response.data.data);
      setTotalPages(response.data.last_page);
      setTotalCount(response.data.total);
    } catch (error) {
      setError("Failed to fetch borrowed books. Please try again later.");
      toast.error("Failed to load your borrowed books");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
    fetchBorrowedBooks();
  }, [searchQuery, selectedStatus]);

  useEffect(() => {
    fetchBorrowedBooks();
  }, [currentPage]);

  useEffect(() => {
    const fetchBorrowPolicy = async () => {
      try {
        const response = await api.get("/borrowing-policies");
        setBorrowLimit(response.data.borrow_limit);
      } catch (error) {
        console.error("Error fetching borrowing policy:", error);
      }
    };
    fetchBorrowPolicy();
  }, []);

  const handleReturnBook = async () => {
    if (!selectedBookIdInput) return toast.error("Please enter a book ID.");

    try {
      const response = await api.post(
        `/borrowed-books/${selectedBookIdInput}/return`
      );
      toast.success(response.data.message);
      setSelectedBookIdInput("");
      fetchBorrowedBooks();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to return the book."
      );
    }
  };

  const handleRenewBook = () => {
    const selectedBook = borrowedBooks.find(
      (borrow) => borrow.book.id.toString() === selectedBookIdInput
    );

    if (selectedBook) {
      setExactReturnDate(new Date(selectedBook.due_date));
      setSelectedBookId(selectedBookIdInput);
      setIsModalOpen(true);
    } else {
      toast.error("Book not found in your borrowed items.");
    }
  };

  const handleRenewSubmit = async () => {
    if (!renewDate) return toast.error("Please select a renewal date.");

    const formattedDate = renewDate.toLocaleDateString().split("T")[0];
    try {
      const response = await api.post(
        `/borrowed-books/${selectedBookId}/renew-request`,
        { renewDate: formattedDate }
      );
      toast.success(response.data.message || "Renewal request sent to admin");
      setIsModalOpen(false);
      setSelectedBookIdInput("");
      fetchBorrowedBooks();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to send renewal request."
      );
      console.error(
        "Error during renewal request:",
        error.response?.data?.message
      );
    }
  };

  const confirmUnavailableRenewal = async () => {
    try {
      await api.post(
        `/borrowed-books/${bookAvailability.bookId}/notify-admin`,
        {
          requestedDate: bookAvailability.requestedDate,
        }
      );
      toast.info(
        "Admin notified. You'll be updated when copies are available."
      );
      setIsConfirmModalOpen(false);
      setSelectedBookIdInput("");
    } catch (error) {
      toast.error("Failed to notify admin.");
    }
  };

  const handlePayFine = async (borrowId) => {
    try {
      const response = await api.post(
        `/payments/create-checkout-session/${borrowId}`
      );
      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({
        sessionId: response.data.id,
      });
      if (error) toast.error(error.message);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to initiate payment"
      );
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ClientSidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!isSidebarCollapsed)}
      />
      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        <HeaderBanner book="My Borrowed Books" heading_pic={heading_pic} />
        <div className="p-6">
          <BookSearchSection
            borrowLimit={borrowLimit}
            searchQuery={searchQuery}
            setSearchQuery={handleSearch}
            selectedBookIdInput={selectedBookIdInput}
            setSelectedBookIdInput={setSelectedBookIdInput}
            handleReturnBook={handleReturnBook}
            handleRenewBook={handleRenewBook}
            selectedStatus={selectedStatus}
            setSelectedStatus={handleStatusChange}
          />
          <BorrowedBooksTable
            borrowedBooks={borrowedBooks}
            loading={loading}
            error={error}
            searchQuery={searchQuery}
            handlePayFine={handlePayFine}
            selectedStatus={selectedStatus}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalCount={totalCount}
          />

          {isModalOpen && (
            <RenewModal
              exactReturnDate={exactReturnDate}
              renewDate={renewDate}
              setRenewDate={setRenewDate}
              onClose={() => setIsModalOpen(false)}
              onSubmit={handleRenewSubmit}
            />
          )}
          {isConfirmModalOpen && (
            <ConfirmUnavailableModal
              bookAvailability={bookAvailability}
              onCancel={() => setIsConfirmModalOpen(false)}
              onConfirm={confirmUnavailableRenewal}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default BorrowedBooks;
