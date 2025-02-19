import React from "react";

export default function Home() {
  const home_pic = process.env.PUBLIC_URL + "/images/home_pic.jpg";
  return (
    <div className="flex h-screen">
      {/* Left section with bookshelf image */}
      <div className="w-1/2">
        <img
          src={home_pic}
          alt="Books"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right section */}
      <div className="w-1/2 flex flex-col justify-center items-center bg-gray-100 p-10">
        <div className="max-w-md text-left">
          {/* Heading */}
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            LIBRARY MANAGEMENT SYSTEM
          </h1>

          {/* Open hours card */}
          <div className="bg-white shadow-lg rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-blue-800">Open Hours</h2>
            <p className="text-gray-600 mt-4">
              Mon-Fri: 8:00 AM to 6:00 PM
              <br />
              Sat-Sun: 9:00 AM to 5:00 PM
            </p>
          </div>

          {/* Buttons */}
          <div className="flex justify-center gap-4">
            <a
              href="/login"
              className="px-6 py-3 bg-blue-900 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition-all"
            >
              Log In
            </a>

            <a
              href="/signIn"
              className="px-6 py-3 bg-blue-700 text-white font-semibold rounded-md shadow-md hover:bg-blue-500 transition-all"
            >
              Sign Up
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
