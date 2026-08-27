import { useContext, useState } from "react";
import { RecipeContext } from "../context/RecipeContext";
import { useNavigate } from "react-router-dom";
import { GrFavorite } from "react-icons/gr";
import RecipeCollection from "../components/RecipeCollection";
import { updateFavoritesDatabase } from "../api/favorites";
import toast from "react-hot-toast";
import { ImSpinner2 } from "react-icons/im";
import { LuNotebookPen } from "react-icons/lu";

// recipe.id/recipe._id adapt with sourceType

function Favorites() {
  const [tab, setTab] = useState("saved");
  const { favorites, setFavorites, areFavoritesLoaded, ownRecipes } =
    useContext(RecipeContext);
  const navigate = useNavigate();

  // Remove from UI immediately, if backend call fails revert to previous state
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

  const tabsHeader = (
    <div className="flex gap-1 justify-center border-b border-gray-800">
      <button
        className={`text-base sm:text-lg font-semibold px-4 sm:px-6 py-3 border-b-2 transition-all active:scale-[0.98] ${
          tab === "saved"
            ? "text-orange-200 border-orange-200"
            : "text-gray-400 border-transparent hover:text-gray-200 hover:border-gray-700"
        }`}
        onClick={() => setTab("saved")}
      >
        Saved Recipes
      </button>
      <button
        className={`text-base sm:text-lg font-semibold px-4 sm:px-6 py-3 border-b-2 transition-all active:scale-[0.98] ${
          tab === "own"
            ? "text-orange-200 border-orange-200"
            : "text-gray-400 border-transparent hover:text-gray-200 hover:border-gray-700"
        }`}
        onClick={() => setTab("own")}
      >
        Own Recipes
      </button>
    </div>
  );

  const createRecipeButton = (
    <div className="flex items-center border gap-2 border-gray-600 hover:border-gray-400 active:scale-[0.98] transition-all rounded-full  px-5 py-2.5 cursor-pointer select-none group">
      <LuNotebookPen className="text-orange-100/60 group-hover:text-orange-100/90 transition" />
      <span className="text-gray-300">Create Recipe</span>
    </div>
  );

  const emptyState = (
    <div className="flex flex-col w-full max-w-2xl rounded-3xl justify-center items-center p-10 m-2 border border-gray-800 bg-gray-950 text-center">
      <GrFavorite className="size-10 sm:size-12 text-orange-200 mb-4 sm:mb-3" />
      <h2 className="text-xl sm:text-2xl font-bold mb-3 text-gray-300">
        Your favorites list is empty
      </h2>

      <p className="text-gray-400 max-w-md mb-10">
        Browse recipes for inspiration and select your favorites.
      </p>
      {tab === "saved" ? (
        <button
          onClick={() => navigate("/home")}
          className="px-6 py-2.5 border border-green-600 text-green-600 hover:text-green-400 hover:border-green-400 active:scale-95 rounded-full transition-all"
        >
          Explore Recipes
        </button>
      ) : (
        createRecipeButton
      )}
    </div>
  );

  if (!areFavoritesLoaded) {
    return (
      <div className="self-stretch w-full flex items-center justify-center">
        <ImSpinner2 className="animate-spin size-8 sm:size-10 text-orange-100" />
      </div>
    );
  }

  const isSavedTabActive = tab === "saved";
  const recipeList = tab === "saved" ? favorites : ownRecipes;

  return (
    <div className="self-stretch w-full flex flex-col overflow-hidden">
      {tabsHeader}

      {recipeList.length > 0 ? (
        <RecipeCollection
          recipesSource={isSavedTabActive ? favorites : ownRecipes}
          sourceType={isSavedTabActive ? "favorites" : "ownRecipes"}
          showFavoritesControl={isSavedTabActive}
          createRecipeControl={!isSavedTabActive ? createRecipeButton : null}
          showFilters={isSavedTabActive}
          handleRemoveFromFavorites={handleRemoveFromFavorites}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center">
          {emptyState}
        </div>
      )}
    </div>
  );
}

export default Favorites;
