import React from "react";

export default function Home() {
  const home_pic = process.env.PUBLIC_URL + "/images/home_pic.jpg";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Mobile-first layout with improved stacking */}
      <div className="container mx-auto px-4 py-8 md:py-0 flex flex-col md:flex-row min-h-screen">
        {/* Image section - better mobile handling */}
        <div className="md:w-1/2 h-64 md:h-auto md:min-h-screen relative order-1 md:order-none">
          <img
            src={home_pic}
            alt="Books in a modern library"
            className="w-full h-full object-cover md:object-center md:fixed md:top-0 md:left-0 md:h-screen md:w-1/2"
            loading="eager"
          />
          {/* Improved overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 via-blue-900/10 to-transparent md:bg-gradient-to-r md:from-blue-900/30 md:via-blue-900/10 md:to-transparent"></div>

          {/* Mobile header that disappears on desktop */}
          <div className="md:hidden absolute bottom-6 left-0 right-0 px-6 text-center">
            <h1 className="text-3xl font-bold text-white mb-1">
              <span className="text-blue-200">Liber</span>
              <span className="text-amber-200">Verse</span>
            </h1>
            <p className="text-blue-50">Your gateway to knowledge</p>
          </div>
        </div>

        {/* Content section - improved spacing and hierarchy */}
        <div className="md:w-1/2 flex items-center py-12 md:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full mx-auto space-y-6">
            {/* Desktop header hidden on mobile */}
            <div className="hidden md:block text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                Welcome to <span className="text-blue-800">Liber</span>
                <span className="text-amber-600">Verse</span>
              </h1>
              <p className="text-lg text-gray-600">
                Your gateway to knowledge and discovery
              </p>
            </div>

            {/* Features grid with better touch targets */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: "📚", color: "text-blue-600", text: "50,000+ Books" },
                { icon: "⏱️", color: "text-amber-600", text: "24/7 Online" },
                {
                  icon: "💻",
                  color: "text-emerald-600",
                  text: "Digital Resources",
                },
                { icon: "📖", color: "text-purple-600", text: "Study Spaces" },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="bg-white/90 hover:bg-white transition-all rounded-lg p-4 shadow-xs hover:shadow-sm border border-gray-200 flex flex-col items-center justify-center cursor-default"
                >
                  <span className={`text-3xl mb-2 ${feature.color}`}>
                    {feature.icon}
                  </span>
                  <h3 className="font-medium text-gray-800 text-sm sm:text-base text-center">
                    {feature.text}
                  </h3>
                </div>
              ))}
            </div>

            {/* Opening hours card with better contrast */}
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
              <div className="flex items-center mb-3">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-blue-600"
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
                <h2 className="text-lg font-semibold text-gray-800">
                  Opening Hours
                </h2>
              </div>
              <div className="space-y-2 text-gray-600 text-sm">
                {[
                  { day: "Monday - Friday", time: "8:00 AM - 8:00 PM" },
                  { day: "Saturday", time: "9:00 AM - 6:00 PM" },
                  { day: "Sunday", time: "10:00 AM - 4:00 PM" },
                ].map((schedule, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{schedule.day}</span>
                    <span className="font-medium text-gray-700">
                      {schedule.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons with better mobile sizing */}
            <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:space-x-3 pt-2">
              <a
                href="/login"
                className="px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium rounded-lg shadow hover:shadow-md transition-all hover:brightness-110 text-center text-sm sm:text-base"
              >
                Member Login
              </a>
              <a
                href="/register"
                className="px-5 py-3 bg-white text-blue-700 font-medium rounded-lg shadow-sm hover:shadow transition-all border border-blue-200 hover:border-blue-300 text-center text-sm sm:text-base"
              >
                Join Our Library
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
