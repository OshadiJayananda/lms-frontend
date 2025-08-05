import React, { useState, useEffect } from "react";
import HeaderBanner from "../../Components/HeaderBanner";
import ClientSidebar from "../../Components/ClientSidebar";
import {
  FaBookOpen,
  FaClock,
  FaCheckCircle,
  FaArrowRight,
  FaSearch,
  FaBook,
  FaTimes,
  FaInfoCircle,
  FaExclamationTriangle,
  FaMoneyBillWave,
  FaRegSmile,
  FaRegLightbulb,
  FaRegCalendarAlt,
} from "react-icons/fa";
import api from "../../Components/Api";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "framer-motion";

const QUOTES = [
  {
    text: "A reader lives a thousand lives before he dies.",
    author: "George R.R. Martin",
  },
  {
    text: "So many books, so little time.",
    author: "Frank Zappa",
  },
  {
    text: "Until I feared I would lose it, I never loved to read. One does not love breathing.",
    author: "Harper Lee",
  },
  {
    text: "Reading is essential for those who seek to rise above the ordinary.",
    author: "Jim Rohn",
  },
  {
    text: "Books are a uniquely portable magic.",
    author: "Stephen King",
  },
  {
    text: "Once you learn to read, you will be forever free.",
    author: "Frederick Douglass",
  },
  {
    text: "There is no friend as loyal as a book.",
    author: "Ernest Hemingway",
  },
  {
    text: "The only thing that you absolutely have to know, is the location of the library.",
    author: "Albert Einstein",
  },
  {
    text: "I do believe something very magical can happen when you read a good book.",
    author: "J.K. Rowling",
  },
  {
    text: "A room without books is like a body without a soul",
    author: "Marcus Tullius Cicero",
  },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      when: "beforeChildren",
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const cardVariants = {
  hover: {
    y: -5,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const slideUp = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

function Dashboard() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    borrowed: 0,
    returned: 0,
    overdue: 0,
    active_borrowed: 0,
    borrowLimit: 5,
    borrowDuration: "2 weeks",
    finePerDay: 50,
    latestBooks: [],
    monthlyStats: [],
  });
  const [borrowingPolicy, setBorrowingPolicy] = useState({
    borrow_limit: 0,
    borrow_duration_days: 0,
    fine_per_day: 0,
  });
  const [quote, setQuote] = useState(QUOTES[0]);
  const [isNewUser, setIsNewUser] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [activeBooks, setActiveBooks] = useState([]);
  const [overdueBooks, setOverdueBooks] = useState([]);
  const [totalFine, setTotalFine] = useState(0);

  const heading_pic = process.env.PUBLIC_URL + "/images/heading_pic.jpg";
  const COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EC4899", "#8B5CF6"];
  const FONT_FAMILY =
    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

  const fetchBorrowingPolicy = async () => {
    setLoading(true);
    try {
      const res = await api.get("/borrowing-policies");
      setBorrowingPolicy(res.data);
    } catch (err) {
      toast.error("Failed to fetch borrowing policies");
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveBooks = async () => {
    try {
      const res = await api.get("/borrowed-books?status=Issued");
      setActiveBooks(res.data.data);
    } catch (err) {
      toast.error("Failed to fetch active books");
    }
  };

  const fetchOverdueBooks = async () => {
    try {
      const res = await api.get("/borrows/overdue");
      setOverdueBooks(res.data);

      let fine = 0;
      res.data.forEach((book) => {
        fine += book.fine_amount || 0;
      });
      setTotalFine(fine);
    } catch (err) {
      toast.error("Failed to fetch overdue books");
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get("/user/dashboard-stats");
      setStats(res.data);

      const isNew =
        res.data.borrowed === 0 &&
        res.data.returned === 0 &&
        res.data.overdue === 0;
      setIsNewUser(isNew);

      if (isNew && !localStorage.getItem("welcomeModalShown")) {
        setShowWelcomeModal(true);
        localStorage.setItem("welcomeModalShown", "true");
      }
    } catch (err) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    const randomIndex = Math.floor(Math.random() * QUOTES.length);
    setQuote(QUOTES[randomIndex]);
  }, []);

  useEffect(() => {
    fetchBorrowingPolicy();
    fetchStats();
    fetchActiveBooks();
    fetchOverdueBooks();
  }, []);

  const handleToggle = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  const pieData = [
    { name: "Borrowed", value: stats.borrowed, icon: <FaBookOpen /> },
    { name: "Returned", value: stats.returned, icon: <FaCheckCircle /> },
    { name: "Overdue", value: stats.overdue, icon: <FaClock /> },
  ];

  const filteredPieData = pieData.filter((entry) => entry.value > 0);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const daysRemaining = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gray-50 flex"
      style={{ fontFamily: FONT_FAMILY }}
    >
      <ClientSidebar isCollapsed={isSidebarCollapsed} onToggle={handleToggle} />
      <motion.div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        <HeaderBanner
          book="Dashboard"
          heading_pic={heading_pic}
          className="w-full"
        />

        <motion.div
          className="p-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Welcome Section */}
          <motion.div className="mb-8" variants={itemVariants}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <motion.h1
                  className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1"
                  variants={slideUp}
                >
                  {isNewUser
                    ? "Welcome to Your Library Journey!"
                    : "Welcome Back!"}
                </motion.h1>
                <motion.p className="text-gray-600" variants={slideUp}>
                  {isNewUser
                    ? "Let's find your next great read"
                    : "Here's what's happening with your account"}
                </motion.p>
                {isNewUser && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-4"
                  >
                    <div className="flex items-start">
                      <FaInfoCircle className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-blue-800 mb-2">
                          Quick Start Guide
                        </h3>
                        <button
                          onClick={() => setShowWelcomeModal(true)}
                          className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
                        >
                          View detailed guide
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              <motion.div
                className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-4 text-white shadow-lg max-w-md"
                variants={slideUp}
                whileHover={{ scale: 1.02 }}
              >
                <blockquote className="text-sm sm:text-base italic mb-1">
                  "{quote.text}"
                </blockquote>
                <p className="text-xs opacity-80">– {quote.author}</p>
              </motion.div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8"
            variants={containerVariants}
          >
            <StatCard
              icon={<FaBookOpen className="text-indigo-500" />}
              title="Total Borrowed"
              value={stats.borrowed}
              description={
                stats.borrowed === 0
                  ? "You haven't borrowed any books yet"
                  : "Books borrowed so far"
              }
              color="indigo"
            />

            <StatCard
              icon={<FaBook className="text-blue-500" />}
              title="Currently Borrowed"
              value={stats.active_borrowed}
              description={
                stats.active_borrowed === 0
                  ? "No books currently borrowed"
                  : `You can borrow ${Math.max(
                      0,
                      borrowingPolicy.borrow_limit - stats.active_borrowed
                    )} more`
              }
              color="blue"
            />

            <StatCard
              icon={<FaCheckCircle className="text-emerald-500" />}
              title="Books Returned"
              value={stats.returned}
              description={
                stats.returned === 0
                  ? "No books returned yet"
                  : "Great job returning books!"
              }
              color="emerald"
            />

            <StatCard
              icon={<FaClock className="text-amber-500" />}
              title="Books Overdue"
              value={stats.overdue}
              description={
                stats.overdue === 0
                  ? "All books returned on time"
                  : "Please return overdue books"
              }
              color="amber"
            />
          </motion.div>

          {/* Charts and Active Books Section */}
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
            variants={containerVariants}
          >
            {/* Reading Activity */}
            <motion.div
              className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100"
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">
                  Your Reading Activity
                </h3>
                <div className="flex space-x-2">
                  {filteredPieData.map((entry, index) => (
                    <div key={index} className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-1"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                      <span className="text-xs text-gray-500">
                        {entry.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : filteredPieData.length > 0 ? (
                <motion.div
                  className="h-64"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={filteredPieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={60}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        labelLine={false}
                      >
                        {filteredPieData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${value} books`, "Count"]}
                        contentStyle={{
                          borderRadius: "8px",
                          border: "none",
                          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                          padding: "8px 12px",
                          fontSize: "14px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </motion.div>
              ) : (
                <EmptyState
                  icon={<FaBook className="text-gray-400 text-3xl" />}
                  title="No Reading Activity Yet"
                  description={
                    isNewUser
                      ? "Borrow your first book to see your reading activity"
                      : "Your reading history will appear here"
                  }
                  actionText="Browse books"
                  actionIcon={<FaSearch />}
                  actionLink="/books"
                />
              )}
            </motion.div>

            {/* Active Books */}
            <motion.div
              className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100"
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">
                  Currently Borrowed Books
                </h3>
                <Link
                  to="/borrowedBook"
                  className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline flex items-center"
                >
                  View all <FaArrowRight className="ml-1 text-xs" />
                </Link>
              </div>

              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : activeBooks.length > 0 ? (
                <motion.div
                  className="space-y-4 max-h-64 overflow-y-auto pr-2"
                  initial="hidden"
                  animate="visible"
                  variants={containerVariants}
                >
                  {activeBooks.map((book, index) => (
                    <motion.div
                      key={book.id}
                      variants={itemVariants}
                      whileHover={{ scale: 1.01 }}
                    >
                      <BookCard
                        image={book.book.image}
                        title={book.book.name}
                        dueDate={formatDate(book.due_date)}
                        status="active"
                        daysRemaining={daysRemaining(book.due_date)}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <EmptyState
                  icon={<FaBookOpen className="text-gray-400 text-3xl" />}
                  title="No Active Borrowings"
                  description={
                    isNewUser
                      ? "Borrow your first book to get started"
                      : "You don't have any books borrowed right now"
                  }
                  actionText="Browse books"
                  actionIcon={<FaSearch />}
                  actionLink="/books"
                />
              )}
            </motion.div>
          </motion.div>

          {/* Overdue Books and Policy Section */}
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
            variants={containerVariants}
          >
            {/* Overdue Books */}
            <motion.div
              className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100"
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">
                  Overdue Books
                </h3>
                {overdueBooks.length > 0 && (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to="/payments"
                      className="flex items-center bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-full transition-colors"
                    >
                      <FaMoneyBillWave className="mr-2" />
                      <span className="text-sm font-medium">
                        Pay Fine:{" "}
                        <span className="font-bold">Rs.{totalFine}</span>
                      </span>
                      <FaArrowRight className="ml-2 text-xs" />
                    </Link>
                  </motion.div>
                )}
              </div>

              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : overdueBooks.length > 0 ? (
                <motion.div
                  className="space-y-4 max-h-64 overflow-y-auto pr-2"
                  initial="hidden"
                  animate="visible"
                  variants={containerVariants}
                >
                  {overdueBooks.map((book) => (
                    <motion.div
                      key={book.id}
                      variants={itemVariants}
                      whileHover={{ scale: 1.01 }}
                    >
                      <BookCard
                        image={book.book.image}
                        title={book.book.name}
                        dueDate={formatDate(book.due_date)}
                        status="overdue"
                        fine={book.fine_amount || 0}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <EmptyState
                  icon={<FaCheckCircle className="text-green-400 text-3xl" />}
                  title="No Overdue Books"
                  description="Great job! All your books are returned on time."
                />
              )}
            </motion.div>

            {/* Policy Card */}
            <motion.div
              className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100"
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-6">
                Borrowing Policy
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <PolicyCard
                  icon={<FaBookOpen className="text-indigo-500" />}
                  title="Borrow Limit"
                  value={`${borrowingPolicy.borrow_limit} books`}
                  description="Maximum at one time"
                  color="indigo"
                />

                <PolicyCard
                  icon={<FaRegCalendarAlt className="text-blue-500" />}
                  title="Borrow Duration"
                  value={`${borrowingPolicy.borrow_duration_days} days`}
                  description="Per book"
                  color="blue"
                />

                <PolicyCard
                  icon={<FaMoneyBillWave className="text-amber-500" />}
                  title="Fine per Day"
                  value={`Rs.${borrowingPolicy.fine_per_day}`}
                  description="For overdue books"
                  color="amber"
                />
              </div>

              {isNewUser ? (
                <motion.div
                  className="mt-6 pt-6 border-t border-gray-100"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-start">
                    <FaRegLightbulb className="text-yellow-500 mt-1 mr-3 flex-shrink-0" />
                    <p className="text-sm text-gray-600">
                      As a new member, you can borrow up to{" "}
                      {borrowingPolicy.borrow_limit} books at a time. Each book
                      can be kept for {borrowingPolicy.borrow_duration_days}{" "}
                      days.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  className="mt-6 pt-6 border-t border-gray-100"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-start">
                    <FaInfoCircle className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
                    <p className="text-sm text-gray-600">
                      Remember, you can borrow up to{" "}
                      {borrowingPolicy.borrow_limit} books at a time for{" "}
                      {borrowingPolicy.borrow_duration_days} days each. Return
                      books on time to avoid fines.
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>

          {/* Latest Books */}
          <motion.div
            className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100"
            variants={itemVariants}
            whileHover={{ y: -5 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">
                {isNewUser
                  ? "Popular Books to Get You Started"
                  : "Recently Added Books"}
              </h3>
              <Link
                to="/books"
                className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline flex items-center"
              >
                View all <FaArrowRight className="ml-1 text-xs" />
              </Link>
            </div>

            {stats.latestBooks.length > 0 ? (
              <motion.div
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
                variants={containerVariants}
              >
                {stats.latestBooks.map((book, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    whileHover={{ y: -5 }}
                  >
                    <BookCoverCard
                      image={book.image}
                      title={book.name}
                      link={`/books`}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <EmptyState
                icon={<FaBook className="text-gray-400 text-3xl" />}
                title="No Books Available"
                description="We're currently updating our collection"
                actionText="Check back later"
                actionIcon={<FaArrowRight />}
                actionLink="/books"
              />
            )}
          </motion.div>
        </motion.div>

        {/* Welcome Modal for New Users */}
        <AnimatePresence>
          {showWelcomeModal && (
            <WelcomeModal
              onClose={() => setShowWelcomeModal(false)}
              borrowLimit={borrowingPolicy.borrow_limit}
              borrowDuration={borrowingPolicy.borrow_duration_days}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// Reusable Components
const StatCard = ({ icon, title, value, description, color }) => {
  const colorClasses = {
    indigo: { bg: "bg-indigo-50", text: "text-indigo-600" },
    blue: { bg: "bg-blue-50", text: "text-blue-600" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600" },
    amber: { bg: "bg-amber-50", text: "text-amber-600" },
  };

  return (
    <motion.div
      className={`bg-white rounded-2xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow`}
      variants={itemVariants}
      whileHover={{ y: -5 }}
    >
      <div className="flex items-center">
        <motion.div
          className={`p-3 ${colorClasses[color].bg} rounded-xl mr-4`}
          whileHover={{ rotate: 10 }}
        >
          {icon}
        </motion.div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <motion.p
            className="text-2xl font-bold text-gray-800 mt-1"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500 }}
          >
            {value}
          </motion.p>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-3">{description}</p>
    </motion.div>
  );
};

const PolicyCard = ({ icon, title, value, description, color }) => {
  const colorClasses = {
    indigo: { bg: "bg-indigo-50", text: "text-indigo-600" },
    blue: { bg: "bg-blue-50", text: "text-blue-600" },
    amber: { bg: "bg-amber-50", text: "text-amber-600" },
  };

  return (
    <motion.div
      className={`${colorClasses[color].bg} p-4 rounded-xl`}
      whileHover={{ scale: 1.03 }}
    >
      <div className="flex items-center mb-3">
        <motion.div
          className={`p-2 rounded-lg ${colorClasses[color].text} mr-3`}
          whileHover={{ rotate: 15 }}
        >
          {icon}
        </motion.div>
        <h4 className="text-sm font-medium text-gray-700">{title}</h4>
      </div>
      <motion.p
        className="text-xl font-bold text-gray-800 mb-1"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500 }}
      >
        {value}
      </motion.p>
      <p className="text-xs text-gray-500">{description}</p>
    </motion.div>
  );
};

const BookCard = ({ image, title, dueDate, status, daysRemaining, fine }) => {
  return (
    <motion.div
      className={`flex items-start p-3 rounded-lg ${
        status === "overdue"
          ? "bg-red-50 hover:bg-red-100"
          : "bg-gray-50 hover:bg-gray-100"
      } transition-colors`}
      whileHover={{ x: 5 }}
    >
      <motion.div
        className="w-12 h-16 bg-gray-200 rounded flex-shrink-0 overflow-hidden"
        whileHover={{ scale: 1.05 }}
      >
        <img
          src={image || "/default-book-cover.png"}
          alt={title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = "/default-book-cover.png";
          }}
        />
      </motion.div>
      <div className="ml-3 flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-800 truncate">{title}</h4>
        <div className="flex justify-between items-center mt-1">
          <div>
            <p
              className={`text-xs ${
                status === "overdue" ? "text-red-600" : "text-gray-500"
              }`}
            >
              {status === "overdue"
                ? `Overdue since: ${dueDate}`
                : `Due: ${dueDate}`}
            </p>
            {fine > 0 && (
              <motion.p
                className="text-xs font-medium text-red-600"
                animate={{
                  color: ["#EF4444", "#DC2626", "#EF4444"],
                  transition: { duration: 1.5, repeat: Infinity },
                }}
              >
                Fine: Rs.{fine}
                {/* {status === "overdue" && (
                  <Link
                    to="/payments"
                    className="ml-2 text-red-700 hover:underline text-xs"
                  >
                    (Pay Now)
                  </Link>
                )} */}
              </motion.p>
            )}
          </div>
          {status === "active" && (
            <motion.span
              className={`text-xs px-2 py-1 rounded-full ${
                daysRemaining <= 3
                  ? "bg-red-100 text-red-800"
                  : "bg-blue-100 text-blue-800"
              }`}
              whileHover={{ scale: 1.1 }}
            >
              {daysRemaining > 0 ? `${daysRemaining} days left` : "Overdue"}
            </motion.span>
          )}
          {status === "overdue" && (
            <motion.span
              className="bg-red-200 text-red-800 text-xs px-2 py-1 rounded-full"
              animate={{
                backgroundColor: ["#FECACA", "#FCA5A5", "#FECACA"],
                transition: { duration: 2, repeat: Infinity },
              }}
            >
              <FaExclamationTriangle className="inline mr-1" />
              Overdue
            </motion.span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const BookCoverCard = ({ image, title, link }) => (
  <Link to={link} className="group">
    <motion.div
      className="relative pb-[150%] rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
    >
      <img
        src={image || "/default-book-cover.png"}
        alt={title}
        className="absolute h-full w-full object-cover"
        onError={(e) => {
          e.target.src = "/default-book-cover.png";
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
        <p className="text-white text-sm font-medium truncate w-full">
          {title}
        </p>
      </div>
    </motion.div>
  </Link>
);

const EmptyState = ({
  icon,
  title,
  description,
  actionText,
  actionIcon,
  actionLink,
}) => (
  <motion.div
    className="text-center py-8"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    <motion.div
      className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4"
      animate={{
        rotate: [0, 10, -10, 0],
        transition: { duration: 0.5 },
      }}
    >
      {icon}
    </motion.div>
    <h4 className="font-medium text-gray-700 mb-1">{title}</h4>
    <p className="text-sm text-gray-500 mb-4">{description}</p>
    {actionText && actionLink && (
      <motion.div whileHover={{ scale: 1.05 }}>
        <Link
          to={actionLink}
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800 text-sm font-medium"
        >
          {actionText}{" "}
          {actionIcon &&
            React.cloneElement(actionIcon, { className: "ml-1 text-xs" })}
        </Link>
      </motion.div>
    )}
  </motion.div>
);

const WelcomeModal = ({ onClose, borrowLimit, borrowDuration }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50 p-4"
  >
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 50, opacity: 0 }}
      transition={{ type: "spring", damping: 25 }}
      className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
    >
      <div className="p-6 sm:p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
              Welcome to Our Library!
            </h2>
            <p className="text-sm text-gray-500">Let's get you started</p>
          </div>
          <motion.button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
            aria-label="Close welcome modal"
            whileHover={{ rotate: 90 }}
          >
            <FaTimes />
          </motion.button>
        </div>

        <div className="space-y-6">
          <motion.div
            className="bg-blue-50 border border-blue-100 rounded-xl p-4 sm:p-5"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="font-semibold text-blue-800 mb-3 text-lg flex items-center">
              <FaRegSmile className="mr-2" /> Getting Started Guide
            </h3>
            <div className="space-y-4">
              <GuideStep
                number="1"
                title="Browse Our Collection"
                description="Explore thousands of books in our digital library. Use the search feature to find specific titles or browse by categories."
              />

              <GuideStep
                number="2"
                title="Borrowing Books"
                description={`Click "Borrow" on any available book. You can borrow up to ${borrowLimit} books at a time for ${borrowDuration} days each.`}
              />

              <GuideStep
                number="3"
                title="Reading Your Books"
                description="Access your borrowed books from 'My Books' section. Some books may be available for online reading while others are physical copies."
              />

              <GuideStep
                number="4"
                title="Returning Books"
                description="Return books on time to avoid fines. You can renew books if no one else has reserved them."
              />
            </div>
          </motion.div>

          <motion.div
            className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 sm:p-5"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="font-semibold text-indigo-800 mb-3 text-lg flex items-center">
              <FaRegLightbulb className="mr-2" /> Quick Tips
            </h3>
            <ul className="space-y-2 list-disc list-inside text-sm text-gray-700">
              <li>
                Check your dashboard regularly for updates on your borrowed
                books
              </li>
              <li>Set up notifications to remind you of due dates</li>
              <li>Explore our recommendations based on your reading history</li>
              <li>Create reading lists to organize books you want to read</li>
              <li>Attend our virtual book clubs and reading events</li>
            </ul>
          </motion.div>

          <motion.div
            className="flex justify-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Link
              to="/books"
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center"
              onClick={onClose}
            >
              Start Exploring Books <FaArrowRight className="ml-2" />
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  </motion.div>
);

const GuideStep = ({ number, title, description }) => (
  <motion.div className="flex items-start" whileHover={{ x: 5 }}>
    <motion.div
      className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-1 flex-shrink-0 text-sm"
      whileHover={{ scale: 1.1 }}
    >
      {number}
    </motion.div>
    <div>
      <h4 className="font-medium text-gray-800 text-sm sm:text-base">
        {title}
      </h4>
      <p className="text-sm text-gray-600 mt-1">{description}</p>
    </div>
  </motion.div>
);

export default Dashboard;
