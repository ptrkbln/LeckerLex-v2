import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { RecipeContext } from "../context/RecipeContext";
import { AuthContext } from "../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ImSpinner2 } from "react-icons/im";
import {
  faClock,
  faHeart,
  faShoppingCart,
  faCarrot,
  faBasketShopping,
} from "@fortawesome/free-solid-svg-icons";
import { FaMinus, FaPlus, FaCheck } from "react-icons/fa";
import toast from "react-hot-toast";
import { updateSavedRecipesDatabase } from "../api/favorites";
import { addToShoppingListDatabase } from "../api/shoppingList";
import CulinaryJournalForm from "../components/CulinaryJournalForm";
import { PiChefHat } from "react-icons/pi";
import { LuPencil } from "react-icons/lu";
import CreateRecipeForm from "../components/CreateRecipeForm";
import { XButton } from "../components/XButton";

function RecipeDetails() {
  const { id } = useParams();
  const {
    recipes,
    savedRecipes,
    setSavedRecipes,
    ownRecipes,
    areSavedRecipesLoaded,
    areOwnRecipesLoaded,
  } = useContext(RecipeContext);
  const { isLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [completedPrepSteps, setCompletedPrepSteps] = useState([]);
  const [isPer100g, setIsPer100g] = useState(false);
  const [showCreateRecipeModal, setShowCreateRecipeModal] = useState(false);
  const location = useLocation();
  const sourceType = location.state?.sourceType;
  let selectedRecipe;
  // Get recipe from the page it was opened from to avoid showing unrelated missing ingredients
  if (sourceType === "savedRecipes") {
    selectedRecipe = savedRecipes.find((x) => x.id === Number(id));
  } else if (sourceType === "search") {
    selectedRecipe = recipes.find((x) => x.id === Number(id));
  } else if (sourceType === "ownRecipes") {
    selectedRecipe = ownRecipes.find((x) => x._id === id);
  } else {
    // Fallback when navigation source is not available (eg. direct link, refresh)
    selectedRecipe =
      recipes.find((x) => x.id === Number(id)) ||
      savedRecipes.find((x) => x.id === Number(id)) ||
      ownRecipes.find((x) => x._id === id);
  }
  const [missingIngredients, setMissingIngredients] = useState(
    selectedRecipe?.missedIngredients?.map((ingredient) => ingredient.name) ||
      [],
  );
  const [servings, setServings] = useState(selectedRecipe?.servingsAmount || 1);

  useEffect(() => {
    if (!recipe && selectedRecipe) {
      // Keep displaying the current recipe after it is removed from saved recipes
      setRecipe(selectedRecipe);
    } else if (
      !recipe &&
      !selectedRecipe &&
      areSavedRecipesLoaded &&
      areOwnRecipesLoaded
    ) {
      // Redirect only after saved recipes have finished loading and no recipe matches route ID
      navigate("/home", { replace: true });
    }
  }, [
    recipe,
    selectedRecipe,
    navigate,
    areSavedRecipesLoaded,
    areOwnRecipesLoaded,
  ]);

  useEffect(() => {
    if (recipe) {
      if (recipe.servingsAmount) {
        setServings(recipe.servingsAmount);
      }
      setIsPer100g(!recipe.nutritionPerServing);
    }
  }, [recipe]);

  console.log(recipe);
  console.log(ownRecipes);

  // Show a loading state until recipe data is resolved
  if (!recipe) {
    return (
      <div className="self-stretch w-full flex items-center justify-center">
        <ImSpinner2 className="animate-spin size-8 sm:size-10 text-orange-100" />
      </div>
    );
  }

  const nutrition = isPer100g
    ? recipe.nutritionPer100g
    : recipe.nutritionPerServing;

  const handleToggleSavedRecipe = async () => {
    // Save the current state in case database update fails
    const previousSavedRecipes = savedRecipes;

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

    // Add or remove current recipe from savedRecipes state
    const wasAlreadySaved = savedRecipes.some((item) => item.id === recipe.id);
    const updatedSavedRecipes = wasAlreadySaved
      ? savedRecipes.filter((item) => item.id !== recipe.id)
      : [...savedRecipes, currentRecipe];

    setSavedRecipes(updatedSavedRecipes);

    try {
      await updateSavedRecipesDatabase(updatedSavedRecipes);
      if (!wasAlreadySaved) toast.success("Added to saved recipes.");
    } catch {
      toast.error("Something went wrong while saving to your favorites.");
      setSavedRecipes(previousSavedRecipes);
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

    if (recipe.servingsAmount) amount *= servings / recipe.servingsAmount;

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
      .replace("gram", "g")
      .replace("kilograms", "kg")
      .replace("kilogram", "kg")
      .replace("milliliters", "ml")
      .replace("milliliter", "ml")
      .replace("liters", "l")
      .replace("liter", "l");
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
        // If missing: add space after sentence punctuation
        .replace(/([.!?])([A-Za-z])/g, "$1 $2")
        // Capitalize the first letter of each sentence
        .replace(/(^|[.!?]\s+)([a-z])/g, (_, prefix, letter) => {
          return prefix + letter.toUpperCase();
        })
        // If missing: end the step with punctuation
        .replace(/([^.!?])$/, "$1.")
    );
  };

  // Round nutrition values while preventing unnecessary trailing zeros
  const roundToOneDecimal = (num) => {
    if (typeof num !== "number") return num;
    const rounded = Math.round(num * 10) / 10;
    return Number.isInteger(rounded) ? rounded : rounded.toFixed(1);
  };

  return (
    <>
      <div className="mx-auto w-screen md:max-w-screen-xl min-h-full">
        <div className="w-full md:max-w-4xl mx-auto bg-gray-800 p-2 sm:p-6 md:rounded-3xl shadow-lg text-gray-300 relative">
          <div key={recipe.id} className="flex flex-col gap-6">
            {/** Recipe Header */}
            <div className="bg-gray-900 flex flex-col rounded-3xl overflow-hidden relative">
              {(sourceType === "search" || sourceType === "savedRecipes") && (
                <button
                  onClick={handleToggleSavedRecipe}
                  className={`absolute flex justify-center items-center top-1 right-1 bg-gray-800 p-2.5 rounded-full active:scale-95 hover:bg-gray-700 transition-all ${savedRecipes.some((item) => item.id === recipe.id) ? "text-red-800 sm:text-red-900 sm:hover:text-red-800" : "text-gray-400 sm:text-gray-900"}`}
                >
                  <FontAwesomeIcon
                    icon={faHeart}
                    className="size-6 sm:size-7"
                  />
                </button>
              )}
              {sourceType === "ownRecipes" && (
                <button
                  onClick={() => setShowCreateRecipeModal(true)}
                  className={`absolute flex justify-center items-center top-1 right-1 bg-gray-800 p-2.5 rounded-full active:scale-95 hover:bg-gray-700 transition text-gray-600 hover:text-orange-200/70`}
                >
                  <LuPencil className="size-6 sm:size-7" />
                </button>
              )}
              <div className="flex flex-col w-full md:flex-row max-w-[380px] md:max-w-none mx-auto md:mx-0">
                <div className="w-full shrink-0 aspect-[312/231] max-w-[312px] mx-auto md:mx-0">
                  {recipe.image ? (
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      className="w-full h-full rounded-3xl md:rounded-none object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-[#000000] to-[#040f2b] rounded-3xl md:rounded-none">
                      <PiChefHat className="size-16 text-orange-200/60" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col w-full md:w-3/5 items-center justify-center gap-4 md:gap-7 p-2 mx-auto">
                  <h2 className="text-2xl font-bold text-center">
                    {recipe.title}
                  </h2>
                  <div className="flex gap-3 sm:gap-6">
                    {recipe.preparationTime && (
                      <span className="flex text-sm sm:text-base items-center gap-2 bg-gray-800/60 rounded-full px-3 py-1">
                        <FontAwesomeIcon
                          icon={faClock}
                          className="size-4 sm:size-5"
                        />{" "}
                        {recipe.preparationTime} min
                      </span>
                    )}
                    <span className="flex text-sm sm:text-base items-center gap-2 bg-gray-800/60 rounded-full px-3 py-1">
                      <FontAwesomeIcon
                        icon={faCarrot}
                        className="size-4 sm:size-5"
                      />{" "}
                      {recipe.ingredients.length} ingredients
                    </span>
                    {recipe.missedIngredientCount && (
                      <span className="flex text-sm sm:text-base items-center gap-2 bg-gray-800/60 rounded-full px-3 py-1">
                        <FontAwesomeIcon
                          icon={faBasketShopping}
                          className="size-4 sm:size-5"
                        />{" "}
                        {recipe.missedIngredientCount} missing
                      </span>
                    )}
                  </div>
                  {(recipe.diet?.vegetarian ||
                    recipe.diet?.vegan ||
                    recipe.diet?.glutenFree ||
                    recipe.diet?.dairyFree) && (
                    <div className="flex gap-1.5 md:gap-3 items-center">
                      {recipe.diet.vegetarian && (
                        <span className="rounded-full text-center bg-green-500/25 px-2 py-0.5 italic text-[13px] sm:text-sm">
                          Vegetarian
                        </span>
                      )}
                      {recipe.diet.vegan && (
                        <span className="rounded-full text-center bg-lime-500/25 px-2 py-0.5 italic text-[13px] sm:text-sm">
                          Vegan
                        </span>
                      )}
                      {recipe.diet.glutenFree && (
                        <span className="rounded-full text-center bg-amber-400/25 px-2 py-0.5 italic text-[13px] sm:text-sm">
                          Gluten-free
                        </span>
                      )}
                      {recipe.diet.dairyFree && (
                        <span className="rounded-full text-center bg-blue-400/25 px-2 py-0.5 italic text-[13px] sm:text-sm">
                          Dairy-free
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/** Ingredients List */}
            <div className="bg-gray-900 rounded-3xl p-6 pb-8 relative">
              <div className="flex flex-col sm:flex-row sm:justify-between min-h-[50px] gap-3 items-start mb-3">
                <h3 className="text-xl font-semibold">Ingredients</h3>
                <div className="flex items-center sm:items-start sm:flex-row-reverse w-full gap-3 justify-between sm:justify-start">
                  {recipe.servingsAmount && (
                    <div className="flex items-center justify-start gap-1 border border-gray-600 rounded-full sm:border-none p-0.5 sm:p-0">
                      <button
                        onClick={handleDecreaseServings}
                        className={`size-8 sm:size-9 flex items-center justify-center rounded-full  transition-all duration-100 active:scale-95 text-xs ${servings === 1 ? "opacity-30" : "opacity-80 hover:opacity-100 sm:hover:border border-gray-500"}`}
                        disabled={servings === 1}
                      >
                        <FaMinus />
                      </button>

                      <span className="min-w-[89px] text-center text-sm sm:text-base tracking-wider sm:tracking-wide opacity-95">
                        {servings} serving{servings > 1 ? "s" : ""}
                      </span>

                      <button
                        onClick={handleIncreaseServings}
                        className="size-8 sm:size-9 flex items-center justify-center rounded-full opacity-80 hover:opacity-100 sm:hover:border border-gray-500 transition-all duration-100 text-xs active:scale-95"
                      >
                        <FaPlus />
                      </button>
                    </div>
                  )}
                  {missingIngredients.length > 0 && (
                    <div className="sm:absolute -bottom-3 -right-1">
                      <button
                        className="border-green-600 hover:border-green-500 text-green-600 hover:text-green-500 border bg-gray-900 rounded-full p-3 flex hover:scale-105 transition-all duration-300 active:scale-95 -mt-2 relative animate-popIn"
                        onClick={handleAddToShoppingList}
                      >
                        <FontAwesomeIcon
                          icon={faShoppingCart}
                          className="size-5"
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
            <div className="bg-gray-900/80 rounded-3xl p-6">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6">
              {(recipe.nutritionPer100g || recipe.nutritionPerServing) && (
                <div className="bg-gray-900 rounded-3xl p-6 h-fit">
                  <h3 className={`text-xl mb-2 font-semibold `}>Nutrition</h3>
                  {recipe.nutritionPer100g && recipe.nutritionPerServing && (
                    <div className="grid grid-cols-2 bg-gray-800 rounded-full w-fit justify-self-end border border-gray-700">
                      <button
                        type="button"
                        className={`text-sm rounded-full px-3 py-1.5 text-center ${isPer100g ? "bg-orange-200/70 text-gray-800" : "text-gray-400"} transition`}
                        onClick={() => setIsPer100g(true)}
                      >
                        Per 100g
                      </button>
                      <button
                        type="button"
                        className={`text-sm rounded-full px-3 py-1.5 text-center ${!isPer100g ? "bg-orange-200/70 text-gray-800" : "text-gray-400"} transition`}
                        onClick={() => setIsPer100g(false)}
                      >
                        Per serving
                      </button>
                    </div>
                  )}
                  {recipe.nutritionPer100g && !recipe.nutritionPerServing && (
                    <span className="flex items-center pb-0.5 pt-2 sm:pt-4 text-sm text-gray-400 justify-self-end italic">
                      per 100g
                    </span>
                  )}
                  {!recipe.nutritionPer100g && recipe.nutritionPerServing && (
                    <div className="bg-gray-800 rounded-full w-fit justify-self-end border border-gray-700 px-3 py-1.5 text-sm">
                      per serving
                    </div>
                  )}
                  <table className="w-full mt-2">
                    <tbody>
                      {nutrition?.calories !== undefined && (
                        <tr>
                          <td className="pb-2">Calories</td>
                          <td className="text-right pb-2">
                            {Math.round(nutrition.calories)} kcal
                          </td>
                        </tr>
                      )}
                      {nutrition?.fat !== undefined && (
                        <tr>
                          <td>Fat</td>
                          <td className="text-right">
                            {roundToOneDecimal(nutrition.fat)} g
                          </td>
                        </tr>
                      )}
                      {nutrition?.saturatedFat !== undefined && (
                        <tr className="text-gray-400">
                          <td className="pl-5 pb-2">of which saturated fat</td>
                          <td className="text-right pb-2">
                            {roundToOneDecimal(nutrition.saturatedFat)} g
                          </td>
                        </tr>
                      )}
                      {nutrition?.carbohydrates !== undefined && (
                        <tr>
                          <td>Carbohydrates</td>
                          <td className="text-right">
                            {roundToOneDecimal(nutrition.carbohydrates)} g
                          </td>
                        </tr>
                      )}
                      {nutrition?.sugar !== undefined && (
                        <tr className="text-gray-400">
                          <td className="pl-5 pb-2">of which sugar</td>
                          <td className="text-right pb-2">
                            {roundToOneDecimal(nutrition.sugar)} g
                          </td>
                        </tr>
                      )}
                      {nutrition?.protein !== undefined && (
                        <tr>
                          <td className="pb-2">Protein</td>
                          <td className="text-right pb-2">
                            {roundToOneDecimal(nutrition.protein)} g
                          </td>
                        </tr>
                      )}
                      {nutrition?.sodium !== undefined && (
                        <tr>
                          <td className="pb-2">Salt</td>
                          <td className="text-right pb-2">
                            {roundToOneDecimal(nutrition.sodium)} g
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  {recipe.servingPortion?.amount && (
                    <p
                      className={`text-sm text-gray-400 pt-2 -mb-3 mt-1.5 text-right border-t border-gray-700 ${isPer100g ? "opacity-0" : "opacity-100"}`}
                    >
                      Serving size: {recipe.servingPortion.amount}{" "}
                      {recipe.servingPortion.unit}
                    </p>
                  )}
                </div>
              )}
              <div
                className={`${!recipe.nutritionPer100g && !recipe.nutritionPerServing && "sm:col-span-2 sm:w-1/2 sm:justify-self-center"}`}
              >
                <CulinaryJournalForm
                  recipeName={recipe.title}
                  recipeId={recipe.id || recipe._id}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {showCreateRecipeModal && (
        <div className="fixed inset-0 overflow-y-auto bg-black bg-opacity-70 z-20">
          <div className="min-h-full flex justify-center items-start py-10">
            <div className="relative group/close bg-gray-950 border border-gray-800 rounded-3xl shadow-2xl p-6 mx-2 w-full max-w-lg text-center animate-popIn">
              <CreateRecipeForm
                setShowCreateRecipeModal={setShowCreateRecipeModal}
                recipeToEdit={selectedRecipe}
              />
              <XButton onClick={() => setShowCreateRecipeModal(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
export default RecipeDetails;
