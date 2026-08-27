import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFire, faHeart, faCarrot } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { MdKeyboardArrowDown } from "react-icons/md";
import {
  RiCheckboxBlankCircleLine,
  RiCheckboxCircleLine,
} from "react-icons/ri";
import { LuLeaf } from "react-icons/lu";
import { AiOutlineFire } from "react-icons/ai";

const DIET_OPTIONS = ["vegetarian", "vegan", "dairy-free", "gluten-free"];

function RecipeCollection({
  recipesSource,
  heading,
  showFavoritesControl,
  createRecipeControl,
  showFilters,
  handleRemoveFromFavorites,
  sourceType,
}) {
  const [isDietDropdownOpen, setIsDietDropdownOpen] = useState(false);
  const dietDropdownRef = useRef(null);
  const [diet, setDiet] = useState([]);
  const [isCaloriesDropdownOpen, setIsCaloriesDropdownOpen] = useState(false);
  const caloriesDropdownRef = useRef(null);
  const [isPer100g, setIsPer100g] = useState(false);
  const [maxCalories, setMaxCalories] = useState(600);
  const navigate = useNavigate();

  // Close calories / diet dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        caloriesDropdownRef.current &&
        !caloriesDropdownRef.current.contains(e.target)
      ) {
        setIsCaloriesDropdownOpen(false);
      }
      if (
        dietDropdownRef.current &&
        !dietDropdownRef.current.contains(e.target)
      ) {
        setIsDietDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredRecipes = recipesSource.filter((recipe) => {
    if (!recipe.nutritionPer100g || !recipe.nutritionPerServing || !recipe.diet)
      return false;

    // 600 = slider max, means no calorie filter applied
    if (
      maxCalories < 600 &&
      isPer100g &&
      recipe.nutritionPer100g.calories > maxCalories
    )
      return false;
    if (
      maxCalories < 600 &&
      !isPer100g &&
      recipe.nutritionPerServing.calories > maxCalories
    )
      return false;
    if (diet.includes("vegetarian") && !recipe.diet.vegetarian) return false;
    if (diet.includes("vegan") && !recipe.diet.vegan) return false;
    if (diet.includes("gluten-free") && !recipe.diet.glutenFree) return false;
    if (diet.includes("dairy-free") && !recipe.diet.dairyFree) return false;

    return true;
  });

  return (
    <div className="mx-auto md:max-w-[90%] lg:max-w-[1400px] w-full px-1 sm:px-6 pb-2 min-h-full text-gray-300 relative">
      <div className="rounded-3xl w-full mx-auto p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-center text-orange-100">
          {heading}
        </h1>
        {createRecipeControl}
        {/* Filter section */}
        {showFilters && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {/** Calories */}
            <div className="relative" ref={caloriesDropdownRef}>
              <div
                className="flex items-center border gap-2 border-gray-600 hover:border-gray-400 active:scale-[0.98] transition-all rounded-full  px-5 py-2.5 cursor-pointer select-none"
                onClick={() => setIsCaloriesDropdownOpen((prev) => !prev)}
              >
                <AiOutlineFire
                  className={`${maxCalories < 600 ? "text-orange-400" : "text-orange-400/70"}`}
                />
                <span
                  className={`${maxCalories < 600 ? "text-orange-200" : "text-gray-300"}`}
                >
                  Calories
                </span>
                <MdKeyboardArrowDown
                  className={`size-5 ${maxCalories < 600 ? "text-orange-200" : ""}`}
                />
              </div>
              {isCaloriesDropdownOpen && (
                <div className="absolute min-w-max gap-1 left-1/2 -translate-x-1/2 mt-1 flex flex-col z-10 bg-black border border-gray-600 rounded-3xl py-5 px-5">
                  <div className="grid grid-cols-2 bg-gray-900 rounded-full">
                    <button
                      className={`text-sm rounded-full px-6 py-2 text-center ${isPer100g ? "bg-orange-200 text-gray-800" : ""} transition-all`}
                      onClick={() => setIsPer100g(true)}
                    >
                      Per 100g
                    </button>
                    <button
                      className={`text-sm rounded-full px-6 py-2 text-center ${!isPer100g ? "bg-orange-200 text-gray-800" : ""} transition-all`}
                      onClick={() => setIsPer100g(false)}
                    >
                      Per serving
                    </button>
                  </div>

                  <div className="flex justify-between pt-5 pb-1 text-sm">
                    <span>0 kcal</span>
                    <span>
                      <span className="text-orange-100">{maxCalories}</span>
                      {maxCalories >= 600 && "+"} kcal
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="600"
                    step="50"
                    value={maxCalories}
                    onChange={(e) => setMaxCalories(+e.target.value)}
                    className="w-full accent-orange-200"
                  />
                </div>
              )}
            </div>

            <div className="relative" ref={dietDropdownRef}>
              <div
                className="flex items-center border gap-2 border-gray-600 hover:border-gray-400 active:scale-[0.98] transition-all rounded-full px-5 py-2.5 cursor-pointer select-none"
                onClick={() => setIsDietDropdownOpen((prev) => !prev)}
              >
                <LuLeaf
                  className={`${diet.length > 0 ? "text-green-500" : "text-green-500/70"}`}
                />
                <span className={`${diet.length > 0 ? "text-orange-200" : ""}`}>
                  Diet
                </span>
                <span
                  className={`text-xs flex items-center justify-center rounded-full bg-green-700 text-white size-5 text-center ${diet.length > 0 ? "opacity-100" : "opacity-0"}`}
                >
                  {diet.length}
                </span>
                <MdKeyboardArrowDown
                  className={`size-5 ${diet.length > 0 ? "text-orange-200" : ""}`}
                />
              </div>
              {isDietDropdownOpen && (
                <div className="absolute min-w-max gap-1 mt-1 left-1/2 -translate-x-1/2 flex flex-col z-10 bg-black border border-gray-600 rounded-3xl py-3 px-2">
                  {DIET_OPTIONS.map((option) => {
                    const isSelected = diet.includes(option);
                    return (
                      <button
                        key={option}
                        className={`flex items-center gap-3 pl-3 pr-9 py-1.5 rounded-xl ${isSelected ? "text-orange-100" : ""}`}
                        onClick={() =>
                          isSelected
                            ? setDiet((prev) =>
                                prev.filter((x) => x !== option),
                              )
                            : setDiet((prev) => [...prev, option])
                        }
                      >
                        <div>
                          {isSelected ? (
                            <RiCheckboxCircleLine className="size-5 text-green-700" />
                          ) : (
                            <RiCheckboxBlankCircleLine className="size-5 text-gray-600" />
                          )}
                        </div>{" "}
                        <span className="text-sm capitalize">{option}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Card width limit matches the source image original resolution (312x231) to avoid upscaling blur */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,220px))] sm:grid-cols-[repeat(auto-fit,minmax(280px,312px))] justify-center gap-5 sm:gap-6">
        {filteredRecipes.map((recipe) => {
          const id = recipe.id || recipe._id;
          return (
            <div
              key={id}
              onClick={() =>
                id &&
                navigate(`/home/recipe-details/${id}`, {
                  state: { sourceType },
                })
              }
              className="border border-gray-800 hover:border-orange-200/40 bg-gray-950 rounded-3xl active:scale-[0.98] overflow-hidden shadow-lg hover:scale-[1.03] transition-all duration-300 cursor-pointer flex flex-col relative group w-full max-w-[280px] sm:max-w-none justify-self-center"
            >
              {showFavoritesControl && (
                <button
                  className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm p-2 rounded-full hover:bg-opacity-75 hover:scale-105 transition duration-300 text-red-500 lg:opacity-0 lg:group-hover:opacity-100"
                  onClick={(e) => handleRemoveFromFavorites(e, recipe.id)}
                >
                  <FontAwesomeIcon icon={faHeart} size="xl" />
                </button>
              )}
              <img
                src={recipe.image}
                alt={recipe.title}
                className="w-full object-cover aspect-[312/231]"
              />
              <div className="flex flex-col h-full justify-between p-3 sm:p-4">
                <h2
                  className={`${
                    recipe.title.length > 36
                      ? "text-base"
                      : "text-lg sm:text-xl"
                  } font-semibold mb-2`}
                >
                  {recipe.title}
                </h2>
                <div>
                  {isPer100g
                    ? recipe.nutritionPer100g?.calories && (
                        <div className="flex items-center gap-2 text-sm">
                          <FontAwesomeIcon
                            icon={faFire}
                            className="text-red-700/80 size-4"
                          />
                          <span>
                            {Math.round(recipe.nutritionPer100g.calories)} kcal{" "}
                            <span className="text-xs">/ 100g</span>
                          </span>
                        </div>
                      )
                    : recipe.nutritionPerServing?.calories && (
                        <div className="flex items-center gap-2 text-sm">
                          <FontAwesomeIcon
                            icon={faFire}
                            className="text-red-700/80 size-4"
                          />
                          <span>
                            {Math.round(recipe.nutritionPerServing.calories)}{" "}
                            kcal <span className="text-xs">/ serving</span>
                          </span>
                        </div>
                      )}

                  <span className="flex text-sm items-center gap-2">
                    <FontAwesomeIcon
                      icon={faCarrot}
                      className="size-4 text-orange-600/80"
                    />{" "}
                    {recipe.ingredients.length} ingredients
                    {recipe.missedIngredientCount > 0 && (
                      <span className="flex items-center gap-2 text-xs bg-gray-800/90 text-orange-300 rounded-full px-2 py-0.5 relative group/missing">
                        {recipe.missedIngredientCount} missing
                        {recipe.missedIngredients?.length > 0 && (
                          <div className="absolute bottom-full mb-1 min-w-max rounded-xl border border-gray-800 bg-gray-950 px-3 py-2 text-gray-300 opacity-0 transition-all group-hover/missing:opacity-100 pointer-events-none">
                            <p className="mb-1 font-medium text-orange-200">
                              Missing ingredients:
                            </p>

                            <div className="flex flex-col gap-0.5 capitalize">
                              {recipe.missedIngredients.map((ing) => (
                                <span key={ing.name}>• {ing.name}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RecipeCollection;
