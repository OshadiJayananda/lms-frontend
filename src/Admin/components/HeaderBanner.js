import React from "react";

function HeaderBanner({ book = "books", heading_pic }) {
  return (
    <div
      className="h-24 bg-cover bg-center relative brightness-150"
      style={{ backgroundImage: `url(${heading_pic})` }}
    >
      <h1 className="text-4xl font-bold text-black p-6">{book}</h1>
    </div>
  );
}

export default HeaderBanner;
