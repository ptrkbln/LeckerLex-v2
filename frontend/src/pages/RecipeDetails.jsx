import { useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { RecipeContext } from "../context/RecipeContext";
import { AuthContext } from "../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faHeart,
  faLeaf,
  faSeedling,
  faWheatAlt,
  faTint,
  faUtensils,
  faFire,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { IoMdClose } from "react-icons/io";

function RecipeDetails() {
  const { id } = useParams(); // Rezept-ID aus der URL
  const { recipes } = useContext(RecipeContext); // Rezepte aus dem Context
  const { isLoggedIn } = useContext(AuthContext);
  const {
    isFavorite,
    setIsFavorite,
    favorites: favs,
    setFavorites,
  } = useContext(RecipeContext);
  const navigate = useNavigate();
  // Find the recipe with the selected ID
  const recipe = recipes.find((x) => x.id === Number(id));
  const [showMissingIngredientsModal, setShowMissingIngredientsModal] =
    useState(true);
  const [visibleSection, setVisibleSection] = useState(null);
  const [servings, setServings] = useState(recipe?.servingsAmount || 1);

  // Prevent breaking app by refresh
  if (!recipe) {
    navigate("/home", { replace: true });
    return;
  }

  // Toggle between sections.
  const toggleSection = (section) => {
    setVisibleSection((prev) => (prev === section ? null : section));
  };

  // Toggle recipe as favorite.
  // Connect with database and adapt !!!!!!!
  const handleToggleFavorite = () => {
    const currentRecipe = {
      id: recipe.id,
      title: recipe.title,
      image: recipe.image,
      ingredients: recipe.ingredients.map((ingredient) => ({
        name: ingredient.name,
        amount: (ingredient.amount * servings).toFixed(1),
        unit: ingredient.unit,
      })),
      nutrition: recipe.nutritionPer100g,
      preparation: recipe.steps.map((step) => step.description),
      preparationTime: recipe.preparationTime,
      diet: {
        vegetarian: recipe.diet?.vegetarian || false,
        vegan: recipe.diet?.vegan || false,
        glutenFree: recipe.diet?.glutenFree || false,
        dairyFree: recipe.diet?.dairyFree || false,
      },
      calories: recipe.nutritionPer100g?.calories,
    };

    // If recipe already in favorites, remove it.
    if (isFavorite.includes(recipe.id)) {
      setIsFavorite(isFavorite.filter((favId) => favId !== recipe.id));
      setFavorites(favs.filter((fav) => fav.id !== recipe.id));
      toast.success("Removed from favorites.");
    } else {
      setIsFavorite([...isFavorite, recipe.id]);
      setFavorites([...favs, currentRecipe]);
      toast.success("Saved to favorites!");
    }
  };

  // Add missing ingredients to the shopping list.
  const handleAddToShoppingList = async () => {
    if (!isLoggedIn) {
      navigate(`/home/login?redirectTo=/home/recipe-details/${id}`);
      return;
    }

    try {
      let shoppingListItems = recipe.missedIngredients.map((item) =>
        item.name.trim().toLowerCase(),
      );

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/users/update-shoppinglist`,
        {
          method: "PATCH",
          body: JSON.stringify({
            shoppingList: shoppingListItems,
            action: "add",
          }),
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        },
      );

      if (!response.ok) {
        toast.error("Couldn't update your shopping list.");
        return;
      }

      toast.success("Ingredients added to shopping list!");
      setShowMissingIngredientsModal(false);
    } catch {
      toast.error("Connection failed.");
    }
  };

  // Adjust servings
  const handleIncreaseServings = () => {
    setServings((prev) => Math.round((prev + 0.5) * 10) / 10);
  };
  const handleDecreaseServings = () => {
    setServings((prev) => Math.max(0.5, Math.round((prev - 0.5) * 10) / 10));
  };

  // Dynamic text for servings
  const servingsText = `for ${servings} ${
    servings === 1 || servings === 0.5 ? "serving" : "servings"
  }`;

  return (
    <div className="p-6 max-w-6xl mx-auto relative bg-[#11151E] flex-grow font-medium rounded-3xl text-gray-200 mb-6 md:mb-0">
      {/* Recipe Image Section */}
      <div className="relative mx-auto sm:w-8/12 lg:w-6/12 h-72 sm:h-80 lg:h-96">
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-full object-cover rounded-3xl"
        />
        <button
          onClick={handleToggleFavorite}
          className="absolute top-4 right-4 bg-black bg-opacity-30 p-2 rounded-full hover:bg-opacity-50 transition"
        >
          <FontAwesomeIcon
            icon={faHeart}
            size="2x"
            color={isFavorite.includes(recipe.id) ? "#EF4444" : "#fff"}
          />
        </button>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black bg-opacity-40 px-4 py-2 rounded">
            <h2 className="text-center text-xl sm:text-2xl md:text-3xl font-semibold">
              {recipe.title}
            </h2>
          </div>
        </div>
        {/* Info Section */}
        <div className="flex justify-between items-center mt-4 text-gray-300 px-2">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faClock} className="text-lg" />
            <span className="text-md">{recipe.preparationTime} min</span>
          </div>
          <div className="flex items-center gap-4">
            {recipe.diet?.vegetarian && (
              <FontAwesomeIcon
                icon={faLeaf}
                className="text-green-400"
                title="Vegetarian"
              />
            )}
            {recipe.diet?.vegan && (
              <FontAwesomeIcon
                icon={faSeedling}
                className="text-green-400"
                title="Vegan"
              />
            )}
            {!recipe.diet?.glutenFree && (
              <FontAwesomeIcon
                icon={faWheatAlt}
                className="text-yellow-400"
                title="Contains gluten"
              />
            )}
            {!recipe.diet?.dairyFree && (
              <FontAwesomeIcon
                icon={faTint}
                className="text-blue-400"
                title="Contains dairy"
              />
            )}
            {!recipe.diet?.vegetarian &&
              !recipe.diet?.vegan &&
              recipe.diet?.glutenFree &&
              recipe.diet?.dairyFree && (
                <FontAwesomeIcon
                  icon={faUtensils}
                  className="text-gray-400"
                  title="No specific diet"
                />
              )}
          </div>
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faFire} className="text-lg text-red-400" />
            <span className="text-md">
              {recipe.nutritionPer100g?.calories || "N/A"} kcal
            </span>
          </div>
        </div>
      </div>

      {/* Section Buttons */}
      <div className="mt-24 flex flex-wrap justify-center gap-10">
        {["ingredients", "nutrition", "preparation"].map((section) => (
          <button
            key={section}
            onClick={() => toggleSection(section)}
            className={`px-6 py-3 bg-green-600 hover:bg-green-700 rounded-full shadow-lg transition-colors ${
              visibleSection === section ? "ring-2 ring-green-300" : ""
            }`}
          >
            {section.charAt(0).toUpperCase() + section.slice(1)}
          </button>
        ))}
      </div>

      {/* Section Content */}
      <div className="mt-10 space-y-8 mx-auto md:w-3/4 ">
        {/* Ingredients */}
        {visibleSection === "ingredients" && (
          <div className="bg-gray-800 border border-gray-700 p-6 rounded-2xl shadow-xl mx-auto md:w-2/3">
            <h3 className="text-2xl text-center font-bold mb-8">
              Ingredients {servingsText}
            </h3>
            <div className="flex items-center justify-center space-x-4 mb-10">
              <div className="inline-flex items-center border border-gray-300 rounded-full overflow-hidden shadow-sm">
                <button
                  onClick={handleDecreaseServings}
                  className="px-4 py-2 text-gray-300 hover:bg-gray-100 hover:text-gray-800 transition-colors focus:outline-none"
                  aria-label="Decrease servings"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 12H4"
                    />
                  </svg>
                </button>
                <span className="px-4 py-2 font-semibold text-gray-300">
                  {servings}
                </span>

                <button
                  onClick={handleIncreaseServings}
                  className="px-4 py-2 text-gray-300 hover:bg-gray-100 hover:text-gray-800 transition-colors focus:outline-none"
                  aria-label="Increase servings"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <ul className="w-full divide-y divide-gray-500">
              {recipe.ingredients.map((ingredient, index) => {
                const totalAmount = ingredient.amount * servings;
                const displayAmount = Number.isInteger(totalAmount)
                  ? totalAmount
                  : totalAmount.toFixed(0);

                return (
                  <li
                    key={index}
                    className="py-2 flex justify-between items-center"
                  >
                    <span className="font-semibold text-gray-200">
                      {displayAmount} {ingredient.unit}
                    </span>
                    <span className="text-gray-200">{ingredient.name}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        {visibleSection === "nutrition" && (
          <div className="bg-gray-800 border border-gray-700 p-6 rounded-2xl shadow-xl mx-auto md:w-2/3">
            <h3 className="text-2xl font-bold mb-4 text-center">
              Nutritional Values (per 100g)
            </h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-300">
              <li>Calories: {recipe.nutritionPer100g.calories} kcal</li>
              <li>Fat: {recipe.nutritionPer100g.fat} g</li>
              <li>Saturated Fat: {recipe.nutritionPer100g.saturatedFat} g</li>
              <li>Carbohydrates: {recipe.nutritionPer100g.carbohydrates} g</li>
              <li>Sugar: {recipe.nutritionPer100g.sugar} g</li>
              <li>Protein: {recipe.nutritionPer100g.protein} g</li>
              <li>Sodium: {recipe.nutritionPer100g.sodium} g</li>
            </ul>
          </div>
        )}
        {visibleSection === "preparation" && (
          <div className="bg-gray-800 border border-gray-700 p-6 rounded-2xl shadow-xl">
            <h3 className="text-2xl font-bold mb-6">Preparation Steps</h3>
            <div className="relative pl-10">
              {/* Vertical Line */}
              <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-600"></div>
              {recipe.steps.map((step, index) => (
                <div key={index} className="mb-6 flex items-start">
                  {/* Number Badge */}
                  <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-green-600 text-white font-bold text-lg text-center">
                    {index + 1}
                  </div>
                  {/* Step Description */}
                  <div className="ml-4">
                    <p className="text-gray-300 text-lg">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Missing ingredients modal */}
      {showMissingIngredientsModal &&
        recipe.missedIngredients &&
        recipe.missedIngredients.length > 0 && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="relative bg-gray-800 rounded-3xl shadow-2xl p-6 w-11/12 sm:w-1/2 lg:w-1/3 animate-popIn">
              <button
                onClick={() => setShowMissingIngredientsModal(false)}
                className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
              >
                <IoMdClose />
              </button>
              <h3 className="text-2xl font-semibold mb-4 text-center">
                Missing Ingredients
              </h3>
              <ul className="space-y-2 text-lg">
                {recipe.missedIngredients.map((ingredient, index) => (
                  <li
                    key={index}
                    className="flex justify-between text-gray-300"
                  >
                    {Number.isInteger(ingredient.amount * servings)
                      ? ingredient.amount * servings
                      : (ingredient.amount * servings).toFixed(1)}{" "}
                    {ingredient.unit} {ingredient.name}
                  </li>
                ))}
              </ul>
              <button
                onClick={handleAddToShoppingList}
                className="mt-4 w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600"
              >
                Add to Shopping List
              </button>
            </div>
          </div>
        )}
    </div>
  );
}
export default RecipeDetails;
