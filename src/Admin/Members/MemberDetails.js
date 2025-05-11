import React, { useState } from "react";
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
} from "react-icons/fa";

function MemberDetails() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const heading_pic = process.env.PUBLIC_URL + "/images/heading_pic.jpg";

  const members = [
    {
      mid: "E01",
      name: "Jenny Sheiny",
      email: "jenny123@gmail.com",
      contact: "0771233232",
      borrowed: 123,
      returned: 87,
      status: "Blocked",
    },
    {
      mid: "E02",
      name: "John Die",
      email: "john123@gmail.com",
      contact: "0764452065",
      borrowed: 35,
      returned: 30,
      status: "Active",
    },
  ];

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.mid.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
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
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 font-serif">
                  Member Directory
                </h1>
                <p className="text-gray-600 mt-1">
                  View and manage registered library members
                </p>
              </div>

              <div className="w-full md:w-1/3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {filteredMembers.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-md">
              <FaUsers className="mx-auto text-gray-400 text-4xl mb-3" />
              <h3 className="text-lg font-medium text-gray-900">
                No members found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Member Info
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Borrow Stats
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredMembers.map((member) => (
                      <tr key={member.mid} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-gray-900">
                            {member.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {member.mid}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          <div className="flex items-center">
                            <FaEnvelope className="mr-2 text-gray-400" />
                            {member.email}
                          </div>
                          <div className="flex items-center mt-1">
                            <FaPhone className="mr-2 text-gray-400" />
                            {member.contact}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-800">
                            Borrowed: {member.borrowed}
                          </div>
                          <div className="text-sm text-gray-600">
                            Returned: {member.returned}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${
                              member.status === "Active"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
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
