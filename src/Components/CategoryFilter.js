import React from "react";

const CategoryFilter = ({
  categories,
  selectedCategory,
  onChange,
  isLoading,
}) => {
  return (
    <div className="w-full md:w-56">
      {isLoading ? (
        <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 animate-pulse text-sm">
          Loading categories...
        </div>
      ) : (
        <select
          value={selectedCategory}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
          aria-label="Filter by category"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default CategoryFilter;
