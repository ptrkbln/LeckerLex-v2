import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { RecipeContext } from "../context/RecipeContext";
import { AuthContext } from "../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ImSpinner2 } from "react-icons/im";
import {
  faClock,
  faHeart,
  faLeaf,
  faSeedling,
  faWheatAlt,
  faTint,
  faUtensils,
  faFire,
  faShoppingCart,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { IoMdClose } from "react-icons/io";
import { updateFavoritesDatabase } from "../api/favorites";
import { addToShoppingListDatabase } from "../api/shoppingList";
import CulinaryJournalForm from "../components/CulinaryJournalForm";
import { FaMinus, FaPlus, FaCheck } from "react-icons/fa";

function RecipeDetails() {
  const { id } = useParams();
  const { recipes, favorites, setFavorites, areFavoritesLoaded } =
    useContext(RecipeContext);
  const { isLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();
  // Find the recipe with the selected ID
  const selectedRecipe =
    recipes.find((x) => x.id === Number(id)) ||
    favorites.find((x) => x.id === Number(id));
  const [recipe, setRecipe] = useState(null);
  const [missingIngredients, setMissingIngredients] = useState(
    selectedRecipe?.missedIngredients?.map((ingredient) => ingredient.name) ||
      [],
  );
  const [showMissingIngredientsModal, setShowMissingIngredientsModal] =
    useState(true); // should I remove this UI element?
  const [servings, setServings] = useState(selectedRecipe?.servingsAmount || 1);
  const [completedPrepSteps, setCompletedPrepSteps] = useState([]);

  useEffect(() => {
    if (!recipe && selectedRecipe) {
      // Keep displaying the current recipe after it is removed from favorites
      setRecipe(selectedRecipe);
    } else if (!recipe && !selectedRecipe && areFavoritesLoaded) {
      // Redirect only after favorites have finished loading and no recipe matches route ID
      navigate("/home", { replace: true });
    }
  }, [recipe, selectedRecipe, navigate, areFavoritesLoaded]);

  useEffect(() => {
    if (recipe) setServings(recipe.servingsAmount);
  }, [recipe]);

  console.log(recipe);

  // Show a loading state until recipe data is resolved
  if (!recipe) {
    return (
      <ImSpinner2 className="animate-spin size-8 sm:size-10 text-orange-100" />
    );
  }

  const handleToggleFavorite = async () => {
    // Save the current state in case database update fails
    const previousFavorites = favorites;

    const currentRecipe = {
      id: recipe.id,
      title: recipe.title,
      image: recipe.image,
      servingsAmount: recipe.servingsAmount,
      servingPortion: recipe.servingPortion,
      ingredients: recipe.ingredients,
      nutritionPer100g: recipe.nutritionPer100g,
      nutritionPerServing: recipe.nutritionPerServing,
      preparationSteps: recipe.preparationSteps,
      preparationTime: recipe.preparationTime,
      diet: recipe.diet,
    };

    // Add or remove current recipe from favorites state
    const wasAlreadyFavorite = favorites.some((item) => item.id === recipe.id);
    const updatedFavorites = wasAlreadyFavorite
      ? favorites.filter((item) => item.id !== recipe.id)
      : [...favorites, currentRecipe];

    setFavorites(updatedFavorites);

    try {
      await updateFavoritesDatabase(updatedFavorites);
      if (!wasAlreadyFavorite) toast.success("Added to favorites.");
    } catch {
      toast.error("Something went wrong while saving to your favorites.");
      setFavorites(previousFavorites);
    }
  };

  const handleToggleMissingIngredient = (ingredientObj) => {
    const wasAlreadyToggled = missingIngredients.some(
      (item) => item === ingredientObj.name,
    );
    const updatedMissingIngredients = wasAlreadyToggled
      ? missingIngredients.filter((item) => item !== ingredientObj.name)
      : [...missingIngredients, ingredientObj.name];
    setMissingIngredients(updatedMissingIngredients);
  };

  // update completed UI and hover UI
  const handleToggleStepCompleted = (index) => {
    setCompletedPrepSteps((prev) =>
      prev.includes(index)
        ? prev.filter((item) => item !== index)
        : [...prev, index],
    );
  };

  const handleAddToShoppingList = async () => {
    // Adding to shopping list is only for logged in users
    if (!isLoggedIn) {
      navigate(`/home/login?redirectTo=/home/recipe-details/${id}`);
      return;
    }

    if (missingIngredients.length === 0) return;
    if (!missingIngredients.every((item) => typeof item === "string")) {
      console.error("Missing ingredients array contains non-string items.");
      return;
    }

    const prevList = missingIngredients;
    const formatedList = missingIngredients.map((item) => ({
      ingredient: item.trim().toLowerCase(),
      completed: false,
    }));

    setMissingIngredients([]);
    try {
      await addToShoppingListDatabase(formatedList);
      toast.success("Selected items added to your shopping list.");
    } catch {
      setMissingIngredients(prevList);
      toast.error("Something went wrong while updating your shopping list.");
    }
  };

  const handleIncreaseServings = () => {
    setServings((prev) => prev + 1);
  };
  const handleDecreaseServings = () => {
    if (servings < 2) return;
    setServings((prev) => prev - 1);
  };

  // Format ingredient amount and unit for display based on servings
  const formatIngredient = (ingredient) => {
    let unit = ingredient.unit.toLowerCase();
    let amount = +ingredient.amount;

    amount *= servings / recipe.servingsAmount;

    const abbreviatedUnit = unit
      .replace("servings", "serv")
      .replace("serving", "serv")
      .replace("teaspoons", "tsp")
      .replace("teaspoon", "tsp")
      .replace("tsps", "tsp")
      .replace("tablespoons", "tbsp")
      .replace("tablespoon", "tbsp")
      .replace("tbsps", "tbsp")
      .replace("grams", "g")
      .replace("kilograms", "kg")
      .replace("milliliters", "ml")
      .replace("liters", "l");
    unit = abbreviatedUnit;

    if (unit === "ml" && amount >= 1000) {
      unit = "l";
      const convertedAmount = amount / 1000;
      amount = convertedAmount;
    }

    if (unit === "g" && amount >= 1000) {
      unit = "kg";
      const convertedAmount = amount / 1000;
      amount = convertedAmount;
    }

    if (!Number.isInteger(amount)) {
      amount =
        amount < 1
          ? amount.toFixed(2)
          : amount >= 100
            ? amount.toFixed(0)
            : amount.toFixed(1);
    }
    return { amount, unit };
  };

  // Improve readability of inconsistent format of preparation steps returned by Spoonacular API
  const formatPreparationStep = (step) => {
    return (
      step
        // Add a space after sentence punctuation if missing
        .replace(/([.!?])([A-Za-z])/g, "$1 $2")

        // Capitalize the first letter of each sentence
        .replace(/(^|[.!?]\s+)([a-z])/g, (_, prefix, letter) => {
          return prefix + letter.toUpperCase();
        })

        // Ensure the step ends with sentence punctuation
        .replace(/([^.!?])$/, "$1.")
    );
  };

  return (
    <div className="mx-auto w-screen md:max-w-screen-xl md:px-6 pb-12 min-h-full">
      <div className="w-full md:max-w-4xl mx-auto bg-gray-800 p-6 rounded-3xl shadow-lg text-gray-200 relative">
        <div key={recipe.id} className="flex flex-col gap-6">
          {/** Recipe Header */}
          <div className="bg-gray-900 rounded-3xl overflow-hidden shadow-md relative">
            {/*             <button
              className="absolute p-1 right-4 top-4 rounded-full text-lg md:text-xl bg-opacity-30 
                lg:opacity-0 lg:group-hover:opacity-100 lg:hover:bg-opacity-50 transition-all duration-300 ease-in-out 
                bg-white text-white z-10"
              onClick={() => setSelectedRecipeId(null)}
            >
              <IoMdClose />
            </button> */}
            <button
              onClick={handleToggleFavorite}
              className="absolute top-4 right-4 bg-black bg-opacity-30 p-2 rounded-full hover:bg-opacity-50 transition duration-300"
            >
              <FontAwesomeIcon
                icon={faHeart}
                size="2x"
                color={
                  favorites.some((item) => item.id === recipe.id)
                    ? "#EF4444"
                    : "#fff"
                }
              />
            </button>
            <img
              src={recipe.image}
              alt={recipe.title}
              className="w-full h-64 object-contain rounded-3xl overflow-hidden"
            />
            <div className="p-4 text-center">
              <h2 className="text-2xl font-bold">{recipe.title}</h2>
            </div>
            <div className="flex justify-around items-center p-4 border-t border-gray-600">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faClock} className="text-lg" />
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
              <div className="flex items-center gap-2">
                <FontAwesomeIcon
                  icon={faFire}
                  className="text-lg text-red-500"
                />
                <span>{recipe.nutritionPer100g?.calories || "N/A"} kcal</span>
              </div>
            </div>
          </div>

          {/** Ingredients List */}
          <div className="bg-gray-900 rounded-3xl p-6 pb-8 relative">
            <div className="flex flex-col sm:flex-row sm:justify-between min-h-[50px] gap-3 items-start mb-3">
              <h3 className="text-xl font-semibold">Ingredients</h3>
              <div className="flex items-center sm:items-start sm:flex-row-reverse w-full gap-3 justify-between sm:justify-start">
                <div className="flex items-center justify-start gap-1 border border-gray-600 rounded-full sm:border-none p-0.5 sm:p-0">
                  <button
                    onClick={handleDecreaseServings}
                    className={`size-8 sm:size-9 flex items-center justify-center rounded-full  transition-all active:scale-95 text-xs ${servings === 1 ? "opacity-30" : "opacity-80 hover:opacity-100 sm:hover:border border-gray-500"}`}
                    disabled={servings === 1}
                  >
                    <FaMinus />
                  </button>

                  <span className="min-w-[89px] text-center text-sm sm:text-base tracking-wider sm:tracking-wide opacity-95">
                    {servings} serving{servings > 1 ? "s" : ""}
                  </span>

                  <button
                    onClick={handleIncreaseServings}
                    className="size-8 sm:size-9 flex items-center justify-center rounded-full opacity-80 hover:opacity-100 sm:hover:border border-gray-500 transition-all text-xs active:scale-95"
                  >
                    <FaPlus />
                  </button>
                </div>
                {missingIngredients.length > 0 && (
                  <div className="sm:absolute -bottom-3 -right-1">
                    <button
                      className="border-green-500 border bg-gray-900 rounded-full p-3 flex hover:scale-105 transition-all active:scale-95 -mt-2 relative animate-popIn"
                      onClick={handleAddToShoppingList}
                    >
                      <FontAwesomeIcon
                        icon={faShoppingCart}
                        className="text-green-500 size-5"
                      />
                      <div className="absolute -top-2 -right-1 text-sm rounded-full size-5 bg-green-700 text-white">
                        {missingIngredients.length}
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recipe.ingredients.map((ingredient, index) => {
                const formattedIngredient = formatIngredient(ingredient);
                return (
                  <li
                    key={index}
                    onClick={() => handleToggleMissingIngredient(ingredient)}
                    className={`cursor-pointer rounded-full p-2 text-center transition-all active:scale-95 border ${
                      missingIngredients.some(
                        (item) => item === ingredient.name,
                      )
                        ? "border-green-600 tracking-wide hover:border-green-400"
                        : "border-gray-600 hover:border-gray-400 opacity-85 hover:opacity-100"
                    }`}
                  >
                    {" "}
                    {formattedIngredient.amount} {formattedIngredient.unit}{" "}
                    {ingredient.name}
                  </li>
                );
              })}
            </ul>
          </div>

          {/** Preparation */}
          <div className="bg-gray-900 rounded-3xl p-6">
            <h3 className="text-xl font-semibold mb-6">Preparation Steps</h3>
            <ol>
              {recipe.preparationSteps.map((step, index) => {
                const isStepCompleted = completedPrepSteps.includes(index);
                return (
                  <li
                    key={index}
                    className="flex items-start py-2 gap-3 sm:gap-5 sm:text-lg cursor-pointer transition-all duration-300 group"
                    onClick={() => handleToggleStepCompleted(index)}
                  >
                    <div className="size-7 sm:size-10 shrink-0 flex relative items-center justify-center rounded-full border-r-2 border-green-700 text-gray-300 font-bold text-center">
                      <span
                        className={`group-hover:opacity-0 ${isStepCompleted ? "opacity-0" : "opacity-100"} transition-all duration-[400ms]`}
                      >
                        {index + 1}
                      </span>
                      <span
                        className={`absolute group-hover:opacity-100 transition-all duration-[400ms] ${completedPrepSteps.includes(index) ? "opacity-100" : "opacity-0"}`}
                      >
                        <FaCheck
                          className={`size-3 sm:size-4 ${isStepCompleted ? "text-green-700" : "text-gray-300"} transition-all`}
                        />
                      </span>
                    </div>
                    <p
                      className={`sm:pt-1.5 leading-7 ${isStepCompleted ? "text-gray-600" : "text-gray-300"} transition-all`}
                    >
                      {formatPreparationStep(step)}
                    </p>
                  </li>
                );
              })}
            </ol>
          </div>

          {/** Nutrition */}
          <div className="bg-gray-900 rounded-3xl p-6 shadow-md">
            <h3 className="text-xl font-semibold mb-3">Nutrition (per 100g)</h3>
            <ul className="ml-6 space-y-1">
              {Object.entries(recipe.nutritionPer100g).map(([key, value]) => (
                <li key={key}>
                  <span className="capitalize">{key}</span>: {value}
                  {key === "calories"
                    ? " kcal"
                    : key === "sodium"
                      ? " mg"
                      : " g"}
                </li>
              ))}
            </ul>
          </div>
          <CulinaryJournalForm recipeName={recipe.title} recipeId={recipe.id} />
        </div>
      </div>
    </div>
  );
}
export default RecipeDetails;
