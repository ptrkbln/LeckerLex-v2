import { useContext, useState } from "react";
import { RecipeContext } from "../context/RecipeContext";
import { useNavigate } from "react-router-dom";
import { GrFavorite } from "react-icons/gr";
import RecipeCollection from "../components/RecipeCollection";
import { updateFavoritesDatabase } from "../api/favorites";
import toast from "react-hot-toast";
import { ImSpinner2 } from "react-icons/im";
import { LuNotebookPen } from "react-icons/lu";

function Favorites() {
  const [tab, setTab] = useState("saved");
  const { favorites, setFavorites, areFavoritesLoaded } =
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
    <div className="flex gap-3 md:gap-5 justify-center">
      <button
        className={`text-lg sm:text-2xl pb-1.5 font-semibold active:scale-[0.98] transition-all ${tab === "saved" ? "text-orange-200 border-b-2 border-orange-200" : "text-gray-400 hover:text-gray-200"}`}
        onClick={() => setTab("saved")}
      >
        Saved Recipes
      </button>
      <button
        className={`text-lg sm:text-2xl pb-1.5 font-semibold active:scale-[0.98] transition-all ${tab === "own" ? "text-orange-200 border-b-2 border-orange-200" : "text-gray-400 hover:text-gray-200"}`}
        onClick={() => setTab("own")}
      >
        Own Recipes
      </button>
    </div>
  );

  const createRecipeButton = (
    <div className="flex items-center border gap-2 border-gray-600 hover:border-gray-400 active:scale-[0.98] transition-all rounded-full  px-5 py-2.5 cursor-pointer select-none group">
      <LuNotebookPen className="text-orange-100/60 group-hover:text-orange-100/90 transition" />
      <span>Create Recipe</span>
    </div>
  );

  if (!areFavoritesLoaded) {
    return (
      <ImSpinner2 className="animate-spin size-8 sm:size-10 text-orange-100" />
    );
  }

  return tab === "saved" ? (
    <>
      {favorites.length > 0 ? (
        <RecipeCollection
          recipesSource={favorites}
          sourceType={"favorites"}
          heading={tabsHeader}
          showFavoritesControl
          createRecipeControl={createRecipeButton}
          showFilters
          handleRemoveFromFavorites={handleRemoveFromFavorites}
        />
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
  ) : (
    "hello"
  );
}

export default Favorites;
