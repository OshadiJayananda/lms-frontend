import React, { useEffect, useState } from "react";
import SideBar from "../../Components/SideBar";
import Header from "../../Components/Header";
import HeaderBanner from "../../Components/HeaderBanner";
import {
  FaSearch,
  FaUsers,
  FaEnvelope,
  FaPhone,
  FaUserCheck,
  FaUserTimes,
  FaBook,
  FaCalendarAlt,
  FaIdCard,
} from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../Components/Api";

function MemberDetails() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'active', 'inactive'

  const heading_pic = process.env.PUBLIC_URL + "/images/heading_pic.jpg";

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const response = await api.get("/admin/members");
        setMembers(response.data);
      } catch (error) {
        toast.error("Failed to load members");
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const filteredMembers = members
    .filter((member) => {
      if (activeTab === "active") return member.status === "Active";
      if (activeTab === "inactive") return member.status !== "Active";
      return true;
    })
    .filter((member) =>
      `${member.name} ${member.email} ${member.mid} ${member.contact}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );

  const statusCounts = members.reduce(
    (acc, member) => ({
      active: member.status === "Active" ? acc.active + 1 : acc.active,
      inactive: member.status !== "Active" ? acc.inactive + 1 : acc.inactive,
      total: acc.total + 1,
    }),
    { active: 0, inactive: 0, total: 0 }
  );

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <SideBar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!isSidebarCollapsed)}
      />
      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        <HeaderBanner
          book={"Library Members"}
          heading_pic={heading_pic}
          Icon={FaUsers}
        />
        <Header />

        <div className="p-6">
          {/* Dashboard Header */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 font-serif">
                  Member Directory
                </h1>
                <p className="text-gray-600 mt-2">
                  Manage all registered library members and their activities
                </p>
              </div>

              <div className="w-full md:w-1/3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by name, email, ID or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-indigo-50 text-indigo-600 mr-4">
                  <FaUsers size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Members</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {statusCounts.total}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-50 text-green-600 mr-4">
                  <FaUserCheck size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Active Members</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {statusCounts.active}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-red-50 text-red-600 mr-4">
                  <FaUserTimes size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Inactive Members</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {statusCounts.inactive}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              className={`py-2 px-4 font-medium text-sm focus:outline-none ${
                activeTab === "all"
                  ? "border-b-2 border-indigo-500 text-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("all")}
            >
              All Members ({statusCounts.total})
            </button>
            <button
              className={`py-2 px-4 font-medium text-sm focus:outline-none ${
                activeTab === "active"
                  ? "border-b-2 border-green-500 text-green-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("active")}
            >
              Active ({statusCounts.active})
            </button>
            <button
              className={`py-2 px-4 font-medium text-sm focus:outline-none ${
                activeTab === "inactive"
                  ? "border-b-2 border-red-500 text-red-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("inactive")}
            >
              Inactive ({statusCounts.inactive})
            </button>
          </div>

          {/* Members Table */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
              <FaUsers className="mx-auto text-gray-300 text-5xl mb-4" />
              <h3 className="text-lg font-medium text-gray-700">
                No members found
              </h3>
              <p className="mt-2 text-gray-500">
                {searchQuery
                  ? "Try adjusting your search query"
                  : activeTab === "active"
                  ? "No active members found"
                  : activeTab === "inactive"
                  ? "No inactive members found"
                  : "No members registered yet"}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Member
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact Information
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Library Activity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredMembers.map((member) => (
                      <tr
                        key={member.mid}
                        className="hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                              <FaIdCard className="text-indigo-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-semibold text-gray-900">
                                {member.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                ID: {member.mid}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Joined:{" "}
                                {new Date(
                                  member.join_date
                                ).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-800">
                            <div className="flex items-center mb-1">
                              <FaEnvelope className="mr-2 text-gray-400" />
                              <a
                                href={`mailto:${member.email}`}
                                className="hover:text-indigo-600 hover:underline"
                              >
                                {member.email}
                              </a>
                            </div>
                            <div className="flex items-center">
                              <FaPhone className="mr-2 text-gray-400" />
                              <a
                                href={`tel:${member.contact}`}
                                className="hover:text-indigo-600 hover:underline"
                              >
                                {member.contact}
                              </a>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-4">
                            <div>
                              <div className="flex items-center text-sm">
                                <FaBook className="mr-2 text-blue-400" />
                                <span className="font-medium">
                                  {member.total_borrowed || 0}
                                </span>
                                <span className="text-gray-500 ml-1">
                                  borrowed
                                </span>
                              </div>
                              <div className="flex items-center text-sm mt-1">
                                <FaCalendarAlt className="mr-2 text-green-400" />
                                <span className="font-medium">
                                  {member.total_returned || 0}
                                </span>
                                <span className="text-gray-500 ml-1">
                                  returned
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              member.status === "Active"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {member.status === "Active" ? (
                              <FaUserCheck className="mr-1" />
                            ) : (
                              <FaUserTimes className="mr-1" />
                            )}
                            {member.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MemberDetails;
