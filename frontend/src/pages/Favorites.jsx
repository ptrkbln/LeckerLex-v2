import { useContext } from "react";
import { RecipeContext } from "../context/RecipeContext";
import { useNavigate } from "react-router-dom";
import { GrFavorite } from "react-icons/gr";
import RecipeCollection from "../components/RecipeCollection";
import { updateFavoritesDatabase } from "../api/favorites";
import toast from "react-hot-toast";
import { ImSpinner2 } from "react-icons/im";

function Favorites() {
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

  if (!areFavoritesLoaded) {
    return (
      <ImSpinner2 className="animate-spin size-8 sm:size-10 text-orange-100" />
    );
  }

  return (
    <>
      {favorites.length > 0 ? (
        <RecipeCollection
          recipesSource={favorites}
          heading={"Your Top Picks"}
          showFavoritesControl
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
  );
}

export default Favorites;
