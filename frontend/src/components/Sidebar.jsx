import React, { useEffect } from "react";
import {
  FaChevronRight,
  FaChevronLeft,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

function Sidebar({
  isSidebarOpen,
  setIsSidebarOpen,
  selectedIngredients,
  handleRemoveIngredient,
  handleRemoveAll,
}) {
  // Automatically open the sidebar when an ingredient is selected
  useEffect(() => {
    if (selectedIngredients.length > 0) {
      setIsSidebarOpen(true);
    }
  }, [selectedIngredients, setIsSidebarOpen]);

  // Close the sidebar once "Remove All" is clicked
  const handleRemoveAllClick = () => {
    handleRemoveAll();
    setIsSidebarOpen(false);
  };

  const handleRemoveIngredientClick = (ingredientIndex) => () => {
    handleRemoveIngredient(ingredientIndex);
  };

  return (
    <div className="relative">
      {/* Sidebar Container */}
      <div
        className={`
          fixed bottom-0 left-0 w-full h-64 lg:h-full lg:w-60
          bg-gray-900 text-white border-t lg:border-t-0 lg:border-r border-blue-700 lg:z-30 
          overflow-y-auto lg:overflow-x-hidden transition-transform duration-500
          ${
            isSidebarOpen
              ? "translate-y-0 lg:translate-x-0"
              : "translate-y-full lg:-translate-x-full"
          }
        `}
      >
        <h2 className="p-4 text-lg font-semibold border-b border-gray-700">
          Chosen Ingredients ({selectedIngredients.length})
        </h2>
        <ul>
          {selectedIngredients.map((ingredient, index) => (
            <li
              key={index}
              className="flex justify-between items-center p-3 border-b border-gray-800 hover:bg-gray-800 transition-colors"
            >
              <span>{ingredient}</span>
              <button
                onClick={handleRemoveIngredientClick(index)}
                className="text-red-400 hover:text-red-500 transition-colors px-2"
              >
                X
              </button>
            </li>
          ))}
        </ul>
        {selectedIngredients.length > 0 && (
          <div className="flex justify-center items-center w-full">
            <button
              className="bg-red-600 hover:bg-red-500 text-white w-11/12 m-4 mb-14 lg:mb-4 py-2 px-4 rounded-lg transition-transform hover:scale-105"
              onClick={handleRemoveAllClick}
            >
              Remove All
            </button>
          </div>
        )}
      </div>

      {/* Desktop Toggle Button */}
      <div
        className={`
          hidden lg:block fixed transition-all duration-500 z-40
          ${
            isSidebarOpen
              ? "left-64" // Position next to sidebar when open
              : "left-4" // Position near left edge when closed
          }
          bottom-16
        `}
      >
        <button
          className="bg-green-500 hover:bg-green-600 text-white rounded-full p-3 shadow-xl transition-all duration-300 ml-2"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
        </button>
      </div>

      {/* Mobile Toggle Button */}
      <div
        className={`
          block lg:hidden fixed left-1/2 transform -translate-x-1/2 transition-all duration-500 z-20
          ${isSidebarOpen ? "bottom-64" : "bottom-10"}
        `}
      >
        <button
          className="bg-green-500 hover:bg-green-600 text-white rounded-full p-3 shadow-xl transition-all duration-300"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <FaChevronDown /> : <FaChevronUp />}
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
