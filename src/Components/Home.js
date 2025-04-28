import React from "react";

export default function Home() {
  const home_pic = process.env.PUBLIC_URL + "/images/home_pic.jpg";

  return (
    <div className="min-h-screen max-h-screen flex flex-col md:flex-row bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Left section with bookshelf image - full width on mobile, half on desktop */}
      <div className="md:w-1/2 max-h-screen h-64 md:h-auto relative">
        <img
          src={home_pic}
          alt="Books in a modern library"
          className="w-full h-full object-cover"
        />
        {/* Overlay gradient for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/30 to-transparent md:bg-gradient-to-r md:from-blue-900/30 md:to-transparent"></div>
      </div>

      {/* Right section */}
      <div className="md:w-1/2 flex flex-col justify-center items-center p-8 md:p-12 lg:p-16">
        <div className="max-w-md w-full space-y-8">
          {/* Heading with library branding */}
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 font-serif">
              Welcome to <span className="text-blue-800">Liber</span>
              <span className="text-amber-600">Verse</span>
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Your gateway to knowledge and discovery
            </p>
          </div>

          {/* Features cards */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="text-blue-700 text-2xl mb-2">📚</div>
              <h3 className="font-medium text-gray-800">50,000+ Books</h3>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="text-amber-600 text-2xl mb-2">⏱️</div>
              <h3 className="font-medium text-gray-800">24/7 Online Access</h3>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="text-emerald-600 text-2xl mb-2">💻</div>
              <h3 className="font-medium text-gray-800">Digital Resources</h3>
            </div>
          </div>

          {/* Open hours card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-2 rounded-full mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800">
                Opening Hours
              </h2>
            </div>
            <div className="space-y-2 text-gray-600">
              <div className="flex justify-between">
                <span>Monday - Friday</span>
                <span className="font-medium">8:00 AM - 8:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Saturday</span>
                <span className="font-medium">9:00 AM - 6:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Sunday</span>
                <span className="font-medium">10:00 AM - 4:00 PM</span>
              </div>
            </div>
          </div>

          {/* Buttons with improved visual hierarchy */}
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="/login"
              className="px-6 py-3 bg-gradient-to-r from-blue-700 to-blue-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 text-center"
            >
              Member Login
            </a>
            <a
              href="/register"
              className="px-6 py-3 bg-white text-blue-700 font-semibold rounded-lg shadow-sm hover:shadow-md transition-all border-2 border-blue-200 hover:border-blue-300 text-center"
            >
              Join Our Library
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
