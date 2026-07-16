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

function RecipeDetails() {
  const { id } = useParams();
  const {
    recipes,
    favorites,
    setFavorites,
    areFavoritesLoaded,
    wasRecipeSearchPerformed,
  } = useContext(RecipeContext);
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
  const [servings, setServings] = useState(recipe?.servingsAmount || 1); // do I need this?

  // Prevents navigation to home if the opened recipe is from favorite and we unsave it
  useEffect(() => {
    if (!recipe && selectedRecipe) {
      setRecipe(selectedRecipe);
    } else if (!recipe && !selectedRecipe && areFavoritesLoaded) {
      navigate("/home", { replace: true });
      return;
    }

    /*     if (
      !recipe &&
      !selectedRecipe &&
      areFavoritesLoaded &&
      !wasRecipeSearchPerformed
    ) {
       return (
        <ImSpinner2 className="animate-spin size-8 sm:size-10 text-orange-100" />
      );
    } */
  }, [
    recipe,
    selectedRecipe,
    navigate,
    areFavoritesLoaded,
    wasRecipeSearchPerformed,
  ]);

  // Prevents breaking app by refresh
  if (!recipe) {
    return (
      <ImSpinner2 className="animate-spin size-8 sm:size-10 text-orange-100" />
    );
  }

  // Toggle recipe as favorite
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
    <div className="mx-auto w-screen md:max-w-screen-xl md:px-6 pb-12 min-h-full">
      <div className="w-full md:max-w-4xl mx-auto bg-gray-800 p-6 rounded-3xl shadow-lg text-gray-200 relative group">
        <div key={recipe.id}>
          {/** Recipe Header */}
          <div className="bg-gray-900 rounded-3xl overflow-hidden shadow-md mb-6 relative">
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

          {/** Servings Adjuster */}
          <div className="bg-gray-900 rounded-3xl p-6 flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Servings</h3>
            <div className="flex items-center gap-4">
              <button
                onClick={handleDecreaseServings}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-600 hover:bg-green-500 transition-colors"
              >
                &minus;
              </button>
              <span className="text-lg">{servingsText}</span>

              <button
                onClick={handleIncreaseServings}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-600 hover:bg-green-500 transition-colors"
              >
                &#xff0b;
              </button>
            </div>
          </div>

          {/** Ingredients List */}
          <div className="bg-gray-900 rounded-3xl p-6 shadow-md mb-6">
            <div className="flex justify-between min-h-[50px] gap-3 items-start mb-3">
              <h3 className="text-xl font-semibold">Ingredients</h3>
              {missingIngredients.length > 0 && (
                <button
                  className="border-green-500 border rounded-full p-3 flex hover:scale-110 transition duration-300 relative"
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
              )}{" "}
            </div>
            {/* <p className="text-md text-green-400 mb-4">
              Select the ingredients you are missing
            </p> */}
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recipe.ingredients.map((ingredient, index) => {
                return (
                  <li
                    key={index}
                    onClick={() => handleToggleMissingIngredient(ingredient)}
                    className={`cursor-pointer rounded-full p-2 text-center transition-colors ${
                      missingIngredients.some(
                        (item) => item === ingredient.name,
                      )
                        ? "bg-green-600 text-gray-100"
                        : "bg-gray-700 hover:bg-gray-800"
                    }`}
                  >
                    {Number.isInteger(ingredient.amount * servings)
                      ? ingredient.amount * servings
                      : (ingredient.amount * servings).toFixed(1)}{" "}
                    {ingredient.unit} {ingredient.name}
                  </li>
                );
              })}
            </ul>
          </div>

          {/** Preparation */}
          <div className="bg-gray-900 rounded-3xl p-6 shadow-md mb-6">
            <h3 className="text-xl font-semibold mb-6">Preparation Steps</h3>
            <div className="relative pl-10">
              <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-600"></div>

              <ol className="list-decimal space-y-2">
                {recipe.preparationSteps.map((step, index) => (
                  <div key={index} className=" flex items-start">
                    {/* Number Badge */}
                    <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-green-600 text-white font-bold text-lg text-center mb-3">
                      {index + 1}
                    </div>
                    {/* Step Description */}
                    <div className="ml-4">
                      <p className="text-gray-300 text-lg">{step}</p>
                    </div>
                  </div>
                ))}
              </ol>
            </div>
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
