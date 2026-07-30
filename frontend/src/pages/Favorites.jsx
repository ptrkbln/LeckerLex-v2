import { useContext, useState, useRef } from "react";
import { RecipeContext } from "../context/RecipeContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTint,
  faWheatAlt,
  faClock,
  faLeaf,
  faSeedling,
  faFire,
  faHeart,
} from "@fortawesome/free-solid-svg-icons";
import { updateFavoritesDatabase } from "../api/favorites";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { GrFavorite } from "react-icons/gr";
import { MdKeyboardArrowDown } from "react-icons/md";
import {
  RiCheckboxBlankCircleLine,
  RiCheckboxCircleLine,
} from "react-icons/ri";
import { LuLeaf } from "react-icons/lu";
import { AiOutlineFire } from "react-icons/ai";
import { useEffect } from "react";

const DIET_OPTIONS = ["vegetarian", "vegan", "dairy-free", "gluten-free"];

function Favorites() {
  const { favorites, setFavorites } = useContext(RecipeContext);
  //const [cookTime, setCookTime] = useState("");
  const [calories, setCalories] = useState("");
  const [nutrition, setNutrition] = useState("");
  const [isDietDropdownOpen, setIsDietDropdownOpen] = useState(false);
  const dietDropdownRef = useRef(null);
  const [diet, setDiet] = useState([]);
  const [isCaloriesDropdownOpen, setIsCaloriesDropdownOpen] = useState(false);
  const caloriesDropdownRef = useRef(null);
  const [isPer100g, setIsPer100g] = useState(true);
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

  const handleRemoveFromFavorites = async (e, favoriteRecipeId) => {
    e.stopPropagation();
    const previousFavorites = favorites;

    const updatedFavorites = favorites.filter(
      (item) => item.id !== favoriteRecipeId,
    );

    setFavorites(updatedFavorites);

    try {
      await updateFavoritesDatabase(updatedFavorites);
    } catch {
      toast.error(
        "Something went wrong while removing the recipe from your favorites.",
      );
      setFavorites(previousFavorites);
    }
  };

  const filteredFavorites = favorites.filter((recipe) => {
    if (!recipe.nutritionPer100g || !recipe.nutritionPerServing || !recipe.diet)
      return false;

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
    <>
      {favorites.length > 0 ? (
        <div className="mx-auto w-screen md:max-w-screen-xl px-1 sm:px-6 pb-12 min-h-full text-gray-300">
          <main className="shadow-lg rounded-3xl w-full max-w-3xl mx-auto p-6 mb-2">
            <h1 className="text-3xl font-bold mb-8 text-center text-orange-100">
              Your Top Picks
            </h1>
            {/* Filter section */}
            <div className="flex flex-col sm:flex-row w-full items-center justify-center gap-6">
              {/** Cooking Time - Omited due to Spoonacular issues returning 45min for each recipe*/}
              {/*              <label className="flex flex-col items-center">
                <select
                  value={cookTime}
                  onChange={(e) => setCookTime(e.target.value)}
                  className="p-3 bg-gray-800 border border-gray-600 rounded-full text-gray-200 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-600 transition-colors w-36 text-center"
                >
                  <option value="">Cooking Time</option>
                  <option value="0-15">0 - 15 min</option>
                  <option value="15-30">15 - 30 min</option>
                  <option value="30-45">30 - 45 min</option>
                  <option value="45-60">45 - 60 min</option>
                  <option value="60+">60+ min</option>
                </select>
              </label> */}
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
                  <span
                    className={`${diet.length > 0 ? "text-orange-200" : ""}`}
                  >
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
          </main>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 text-gray-100">
            {filteredFavorites.map((recipe) => (
              <div
                key={recipe.id}
                onClick={() =>
                  recipe.id && navigate(`/home/recipe-details/${recipe.id}`)
                }
                className="bg-gray-800 rounded-2xl overflow-hidden shadow-lg transform hover:scale-105 transition duration-300 cursor-pointer flex flex-col relative group"
              >
                <button
                  className="absolute top-3 right-3 bg-black bg-opacity-30 p-2 rounded-full hover:bg-opacity-75 hover:scale-105 transition duration-300 text-red-500 lg:opacity-0 lg:group-hover:opacity-100"
                  onClick={(e) => handleRemoveFromFavorites(e, recipe.id)}
                >
                  <FontAwesomeIcon icon={faHeart} size="xl" />
                </button>
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-full h-52 object-cover"
                />
                <div className="p-4">
                  <h2
                    className={`${
                      recipe.title.length > 36 ? "text-base" : "text-xl"
                    } font-semibold mb-2`}
                  >
                    {recipe.title}
                  </h2>

                  <div className="flex justify-between text-gray-300 mb-2">
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon
                        icon={faClock}
                        className="text-green-400 text-lg"
                      />
                      <span>{recipe.preparationTime} min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {recipe.diet?.vegetarian && (
                        <FontAwesomeIcon
                          icon={faLeaf}
                          className="text-green-500"
                          title="Vegetarian"
                        />
                      )}
                      {recipe.diet?.vegan && (
                        <FontAwesomeIcon
                          icon={faSeedling}
                          className="text-green-500"
                          title="Vegan"
                        />
                      )}
                      {!recipe.diet?.glutenFree && (
                        <FontAwesomeIcon
                          icon={faWheatAlt}
                          className="text-yellow-500"
                          title="Contains Gluten"
                        />
                      )}
                      {!recipe.diet?.dairyFree && (
                        <FontAwesomeIcon
                          icon={faTint}
                          className="text-blue-500"
                          title="Contains Dairy"
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon
                      icon={faFire}
                      className="text-red-500 text-lg"
                    />
                    <span>
                      {recipe.nutritionPer100g?.calories || "N/A"} kcal
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col w-full max-w-2xl rounded-3xl justify-center items-center p-10 m-2 border border-gray-800 bg-[#11151E] text-center">
          <GrFavorite className="size-10 sm:size-12 text-orange-200 mb-4 sm:mb-3" />
          <h2 className="text-xl sm:text-2xl font-bold mb-3 text-gray-300">
            Your favorites list is empty
          </h2>

          <p className="text-gray-400 max-w-md mb-10">
            Browse recipes for inspiration and select your favorites.
          </p>
          <button
            onClick={() => navigate("/home")}
            className="px-6 py-2.5 border border-green-600 text-green-600 hover:text-green-400 hover:border-green-400 active:scale-95 rounded-full transition-all"
          >
            Explore Recipes
          </button>
        </div>
      )}
    </>
  );
}

export default Favorites;
