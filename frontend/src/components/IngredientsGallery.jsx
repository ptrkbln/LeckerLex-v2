import React, { useState, useEffect } from "react";

function IngredientsGallery({
  herbsAndSpices,
  vegetables,
  fruits,
  meat,
  seafood,
  grainsAndLegumes,
  snacksAndSideDishes,
  dairyProducts,
  oilsAndFats,
  flourAndBakingIngredients,
  eggsAndProteins,
  cannedGoodsAndSauces,
  selectedIngredients,
  handleImageClick,
  selectedCategory,
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(false); // Reset isLoaded to trigger animation
    const timer = setTimeout(() => setIsLoaded(true), 100); // Delay to allow re-render
    return () => clearTimeout(timer); // Cleanup timeout on unmount
  }, [selectedCategory]);

  let itemsToDisplay = [];
  const category = selectedCategory || "Fruits";
  switch (category) {
    case "Herbs and Spices":
      itemsToDisplay = herbsAndSpices;
      break;
    case "Vegetables":
      itemsToDisplay = vegetables;
      break;
    case "Fruits":
      itemsToDisplay = fruits;
      break;
    case "Meat":
      itemsToDisplay = meat;
      break;
    case "Seafood":
      itemsToDisplay = seafood;
      break;
    case "Grains and Legumes":
      itemsToDisplay = grainsAndLegumes;
      break;
    case "Snacks and Side Dishes":
      itemsToDisplay = snacksAndSideDishes;
      break;
    case "Dairy Products":
      itemsToDisplay = dairyProducts;
      break;
    case "Oils and Fats":
      itemsToDisplay = oilsAndFats;
      break;
    case "Flour and Baking Ingredients":
      itemsToDisplay = flourAndBakingIngredients;
      break;
    case "Eggs and Proteins":
      itemsToDisplay = eggsAndProteins;
      break;
    case "Canned Goods and Sauces":
      itemsToDisplay = cannedGoodsAndSauces;
      break;
    default:
      itemsToDisplay = fruits;
      break;
  }

  return (
    <div
      className="max-w-screen-lg mx-auto sm:my-16 md:px-4 lg:px-24 py-0 rounded-3xl lg:rounded-full shadow-lg"
      style={{ background: "#11151E" }}
    >
      <div className="grid gap-6 p-4 grid-cols-5 sm:grid-cols-7 lg:grid-cols-8">
        {itemsToDisplay.map((item, idx) => {
          const isSelected = selectedIngredients.includes(item.alt);
          const delay = idx * 80;
          return (
            <div
              key={idx}
              onClick={() => handleImageClick(item.alt)}
              style={{ transitionDelay: `${delay}ms` }}
              className={`
                relative cursor-pointer aspect-w-1 aspect-h-1 group overflow-hidden
                rounded-3xl bg-[#11151E]
                ${isLoaded ? "opacity-100" : "opacity-0"}
                ${isSelected ? "ring-2 ring-green-600" : ""}
              `}
            >
              <img
                src={item.src}
                alt={item.alt}
                className="w-full h-full object-contain mx-auto shadow-md transition-transform duration-200 transform group-hover:scale-120"
              />
              <div
                className="absolute inset-0 flex items-center justify-center p-6 bg-black bg-opacity-40
                           text-white text-md font-medium opacity-0 group-hover:opacity-100 duration-100"
              >
                <span className="font-medium text-center ">{item.alt}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default IngredientsGallery;
