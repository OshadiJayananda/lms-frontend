import React from "react";

function HeaderBanner({ book = "Books", heading_pic }) {
  return (
    <div
      className="h-28 md:h-30 w-full bg-cover bg-center relative overflow-hidden"
      style={{ backgroundImage: `url(${heading_pic})` }}
    >
      {/* Dark overlay for better text contrast */}
      <div className="absolute inset-0 bg-black/30"></div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/50 to-transparent"></div>

      {/* Content container */}
      <div className="relative h-full flex items-center px-6 md:px-12 lg:px-16">
        <div className="max-w-7xl w-full">
          <h1 className="text-4xl md:text-5xl lg:text-4xl font-bold text-white font-serif drop-shadow-lg">
            {book}
          </h1>
          <p className="text-lg md:text-xl text-white mt-2 max-w-2xl drop-shadow-md">
            Explore our vast collection of books and resources
          </p>
        </div>
      </div>
    </div>
  );
}

export default HeaderBanner;
