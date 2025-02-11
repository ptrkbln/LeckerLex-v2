import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { RiInformation2Fill } from "react-icons/ri";

function SearchBar({
  searchText,
  setSearchText,
  handleSearch,
  handleAddIngredient,
  selectedIngredients,
}) {
  const [placeholder, setPlaceholder] = useState("Add ingredients");

  // Handle input changes
  const handleInputChange = (e) => {
    const newSearchText = e.target.value;
    setSearchText(e.target.value);

    //Handle adding the manually typed ingredient to the selected list
    if (newSearchText.includes(",")) {
      const ingredientsToAdd = searchText
        .split(",")
        .map((ingredient) =>
          ingredient
            .trim()
            .toLowerCase()
            .replace(/^\w/, (c) => c.toUpperCase())
        )
        .filter((ingredient) => ingredient); // Filter out empty strings

      const uniqueIngredients = Array.from(
        new Set([...selectedIngredients, ...ingredientsToAdd])
      );
      handleAddIngredient(ingredientsToAdd);
      setSearchText("");
    }
  };

  return (
    <div className="text-center mb-4 px-4 mt-6 w-full">
      <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-3xl text-orange-200 font-medium sm:m-4">
        Cook with <span className="text-green-600">What You've Got 🥗</span>
      </h2>
      <div className="mt-8 flex justify-center items-center sticky top-0">
        <label htmlFor="ingredient-search" className="sr-only">
          Search for recipes by ingredients
        </label>
        <div className="relative w-full max-w-72">
          <input
            id="ingredient-search"
            type="text"
            className="w-full p-2 rounded-full focus:ring-4 focus:ring-blue-800 bg-orange-50 transition font-normal placeholder-gray-600 placeholder:text-sm placeholder:pl-2 placeholder:sm:text-base"
            placeholder={placeholder}
            value={searchText}
            onChange={handleInputChange}
            onFocus={() => setPlaceholder("")}
            onBlur={() => setPlaceholder("Add ingredients")}
            aria-label="Search for recipes by ingredients"
          />
          <button
            className="absolute right-0 top-0 h-full px-4 bg-green-500 font-medium text-white rounded-full hover:bg-green-600 hover:scale-105 transition duration-300"
            onClick={handleSearch} // Search recipes based on the input
            aria-label="Search"
          >
            <FaSearch />
          </button>
          <div className="text-orange-200 absolute right-[-25px] bottom-[-4px] p-1 group">
            <div className="relative">
              <RiInformation2Fill />
              <div
                className="invisible group-hover:visible absolute 
      bottom-8 lg:bottom-auto lg:top-0 
      right-0 lg:left-8 
      w-[330px] bg-gray-800 text-white p-2 rounded-2xl text-sm shadow-lg z-50"
              >
                Add ingredients to the list by typing them, using a comma after
                each one ( eg.{" "}
                <span className="text-orange-200">chicken, rice,</span> ) or by
                clicking the ingredient images below.
                <div
                  className="absolute 
        -bottom-[2px] lg:bottom-auto lg:top-2
        right-2 lg:-left-1 
        w-4 h-3 bg-gray-800 
        rotate-45 lg:rotate-[-45deg]"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchBar;
