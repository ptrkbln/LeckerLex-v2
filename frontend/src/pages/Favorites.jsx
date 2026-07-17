import { useContext, useState, useEffect } from "react";
import { RecipeContext } from "../context/RecipeContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShoppingCart,
  faTint,
  faWheatAlt,
  faClock,
  faLeaf,
  faSeedling,
  faFire,
  faHeart,
} from "@fortawesome/free-solid-svg-icons";
import { IoMdClose } from "react-icons/io";
import CulinaryJournalForm from "../components/CulinaryJournalForm";
import { updateFavoritesDatabase } from "../api/favorites";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function Favorites() {
  const { favorites, setFavorites, setShoppingList } =
    useContext(RecipeContext);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [cookTime, setCookTime] = useState("");
  const [calories, setCalories] = useState("");
  const [nutrition, setNutrition] = useState("");
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);
  const [servings, setServings] = useState(1);
  const [missingIngredients, setMissingIngredients] = useState({});
  const [pendingShoppingListUpdate, setPendingShoppingListUpdate] =
    useState(null);
  const [showShoppingListModal, setShowShoppingListModal] = useState(false);
  const navigate = useNavigate();

  const toggleDetails = (id) => {
    setSelectedRecipeId((prevId) => (prevId === id ? null : id));
  };

  const handleIncreaseServings = () => {
    setServings((prev) => Math.round((prev + 0.5) * 10) / 10);
  };

  const handleDecreaseServings = () => {
    setServings((prev) => Math.max(0.5, Math.round((prev - 0.5) * 10) / 10));
  };

  // Diese Funktion verwaltet das Hinzufügen / Entfernen von Zutaten zur missingIngredients-Liste, basierend auf dem recipeId. Sie aktualisiert auch die Menge der fehlenden Zutaten abhängig von servings.
  const toggleMissingIngredient = (recipeId, ingredient) => {
    setMissingIngredients((prev) => {
      const updated = { ...prev };
      if (!updated[recipeId]) {
        updated[recipeId] = [];
      }
      const existingIndex = updated[recipeId].findIndex(
        (item) => item.name === ingredient.name,
      );
      if (existingIndex > -1) {
        updated[recipeId].splice(existingIndex, 1);
      } else {
        updated[recipeId].push({
          name: ingredient.name,
          amount: Number.isInteger(ingredient.amount * servings)
            ? ingredient.amount * servings // Ganze Zahl ohne Dezimalstellen
            : (ingredient.amount * servings).toFixed(1), // Eine Nachkommastelle bei Dezimalzahlen
          unit: ingredient.unit,
        });
      }
      setFavorites((prevFavorites) =>
        prevFavorites.map((fav) =>
          fav.id === recipeId
            ? { ...fav, missingIngredients: updated[recipeId] }
            : fav,
        ),
      );
      return updated;
    });
  };

  useEffect(() => {
    setMissingIngredients((prev) => {
      const updatedMissing = { ...prev };
      Object.keys(updatedMissing).forEach((recipeId) => {
        updatedMissing[recipeId] = updatedMissing[recipeId].map(
          (ingredient) => {
            const originalIngredient = favorites
              .find((r) => r.id === parseInt(recipeId))
              ?.ingredients.find((ing) => ing.name === ingredient.name);
            return originalIngredient
              ? {
                  ...ingredient,
                  /* amount: (originalIngredient.amount * servings).toFixed(1) */
                  amount: Number.isInteger(ingredient.amount * servings)
                    ? ingredient.amount * servings // Ganze Zahl ohne Dezimalstellen
                    : (ingredient.amount * servings).toFixed(1), // Eine Nachkommastelle bei Dezimalzahlen
                }
              : ingredient;
          },
        );
      });
      return updatedMissing;
    });
  }, [servings]);

  useEffect(() => {
    if (selectedRecipeId) {
      const storedMissing =
        favorites.find((fav) => fav.id === selectedRecipeId)
          ?.missingIngredients || [];

      setMissingIngredients((prev) => ({
        ...prev,
        [selectedRecipeId]: storedMissing,
      }));
    }
  }, [selectedRecipeId, favorites]);

  const addMissingToShoppingList = async () => {
    if (!selectedRecipeId || !missingIngredients[selectedRecipeId]) return;
    const missingNames = missingIngredients[selectedRecipeId]

      .filter((ingredient) => ingredient.name.trim()) // Sicherstellen, dass nur gültige Zutaten enthalten sind
      .map((ingredient) => ingredient.name.trim().toLowerCase());

    if (missingNames.length === 0) return; // Falls keine Zutaten fehlen, nichts tun (abbrechen)

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/users/update-shoppinglist`,
        {
          method: "PATCH",
          body: JSON.stringify({
            shoppingList: missingNames,
            action: "add",
          }),
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        },
      );
      if (response.ok) {
        console.log("Shopping list updated successfully");

        setMissingIngredients((prev) => {
          const updated = { ...prev };

          delete updated[selectedRecipeId]; // Löscht die Zutaten für das aktuelle Rezept
          return updated;
        });

        // Speichert die Änderungen auch in Favoriten
        setFavorites((prevFavorites) =>
          prevFavorites.map((fav) =>
            fav.id === selectedRecipeId
              ? { ...fav, missingIngredients: [] }
              : fav,
          ),
        );
        setShowShoppingListModal(true);
        setTimeout(() => setShowShoppingListModal(false), 3000);
      } else {
        console.log("Failed to update shopping list.");
      }
    } catch (error) {
      console.log("Error while updating shopping list:", error);
    }
  };

  useEffect(() => {
    if (!hasInitialized) {
      setHasInitialized(true);
      return;
    }
    if (pendingShoppingListUpdate) {
      setShoppingList((prevList) => {
        const updatedList = new Set([
          ...prevList,
          ...pendingShoppingListUpdate,
        ]);

        return [...updatedList];
      });
      setPendingShoppingListUpdate(null);
    }
  }, [pendingShoppingListUpdate, setShoppingList, hasInitialized]);

  const servingsText = `for ${servings} ${
    servings === 1 || servings === 0.5 ? "serving" : "servings"
  }`;

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

  // --- Filtering Logic ---
  const filterRecipe = (recipe) => {
    // Filter by Cooking Time (using recipe.preparationTime)
    if (cookTime) {
      if (cookTime.includes("-")) {
        const [min, max] = cookTime.split("-").map(Number);
        if (recipe.preparationTime < min || recipe.preparationTime > max)
          return false;
      } else if (cookTime.endsWith("+")) {
        const min = Number(cookTime.replace("+", ""));
        if (recipe.preparationTime < min) return false;
      }
    }
    // Filter by Calories (using recipe.nutrition.calories)
    if (calories) {
      if (calories.includes("-")) {
        const [min, max] = calories.split("-").map(Number);
        if (
          !recipe.nutrition ||
          recipe.nutrition.calories < min ||
          recipe.nutrition.calories > max
        )
          return false;
      } else if (calories.endsWith("+")) {
        const min = Number(calories.replace("+", ""));
        if (!recipe.nutrition || recipe.nutrition.calories < min) return false;
      }
    }
    // Filter by Nutrition preferences (diet)
    if (nutrition) {
      if (nutrition === "vegetarian" && !recipe.diet?.vegetarian) return false;
      if (nutrition === "vegan" && !recipe.diet?.vegan) return false;
      if (nutrition === "gluten-free" && !recipe.diet?.glutenFree) return false;
      if (nutrition === "dairy-free" && !recipe.diet?.dairyFree) return false;
    }
    return true;
  };

  // Only show filtered recipes in the grid view.
  const filteredFavorites = favorites.filter(filterRecipe);

  if (favorites.length < 1) {
    return (
      <div className="flex flex-col justify-center items-center p-10 m-2 text-gray-50">
        <p className="text-2xl pb-10 ">No recipes added yet... 😔</p>
        <button
          onClick={() => (window.location.href = "/home")}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 transition-colors rounded-full shadow text-md"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-screen md:max-w-screen-xl md:px-6 pb-12 min-h-full">
      {!selectedRecipeId && (
        <main className="shadow-lg rounded-3xl w-full max-w-3xl mx-auto p-6 mb-2">
          <h1 className="text-3xl font-bold mb-8 text-center text-orange-100">
            Your Top Picks
          </h1>
          {/* Filter section */}
          <div className="flex flex-wrap justify-center gap-6">
            {/** Cooking Time */}
            <label className="flex flex-col items-center">
              <select
                value={cookTime}
                onChange={(e) => setCookTime(e.target.value)}
                className="p-3 bg-gray-800 border border-gray-700 rounded-full text-gray-200 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-600 transition-colors w-36 text-center"
              >
                <option value="">Cooking Time</option>
                <option value="0-15">0 - 15 min</option>
                <option value="15-30">15 - 30 min</option>
                <option value="30-45">30 - 45 min</option>
                <option value="45-60">45 - 60 min</option>
                <option value="60+">60+ min</option>
              </select>
            </label>
            {/** Calories */}
            <label className="flex flex-col items-center">
              <select
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="p-3 bg-gray-800 border border-gray-700 rounded-full text-gray-200 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-600 transition-colors w-36 text-center"
              >
                <option value="">kcal per 100g</option>
                <option value="0-100">0 - 100 kcal</option>
                <option value="100-200">100 - 200 kcal</option>
                <option value="200-300">200 - 300 kcal</option>
                <option value="300-400">300 - 400 kcal</option>
                <option value="400+">400+ kcal</option>
              </select>
            </label>
            {/** Nutrition */}
            <label className="flex flex-col items-center">
              <select
                value={nutrition}
                onChange={(e) => setNutrition(e.target.value)}
                className="p-3 bg-gray-800 border border-gray-700 rounded-full text-gray-200 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-600 transition-colors w-36 text-center"
              >
                <option value="">Diet</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="gluten-free">Gluten-free</option>
                <option value="dairy-free">Dairy-free</option>
              </select>
            </label>
          </div>
        </main>
      )}

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
                <span>{recipe.nutritionPer100g?.calories || "N/A"} kcal</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Favorites;
