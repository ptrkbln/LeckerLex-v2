import { useContext, useState } from "react";
import { RecipeContext } from "../context/RecipeContext";
import { useNavigate } from "react-router-dom";
import { GrFavorite } from "react-icons/gr";
import RecipeCollection from "../components/RecipeCollection";
import { updateFavoritesDatabase } from "../api/favorites";
import toast from "react-hot-toast";
import { ImSpinner2 } from "react-icons/im";
import { LuNotebookPen } from "react-icons/lu";
import { FiPlus } from "react-icons/fi";
import CreateRecipeForm from "../components/CreateRecipeForm";
import { IoMdClose } from "react-icons/io";
// recipe.id/recipe._id adapt with sourceType

function Favorites() {
  const [tab, setTab] = useState("saved");
  const [showCreateRecipeModal, setShowCreateRecipeModal] = useState(false);
  const { favorites, setFavorites, areFavoritesLoaded, ownRecipes } =
    useContext(RecipeContext);
  const navigate = useNavigate();
  const isSavedTabActive = tab === "saved";
  const recipeList = tab === "saved" ? favorites : ownRecipes;
  //

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
    <button
      className="flex items-center border gap-2 border-gray-600 hover:border-gray-400 active:scale-[0.98] transition-all rounded-full  px-5 py-2.5 cursor-pointer select-none group"
      onClick={() => setShowCreateRecipeModal(true)}
    >
      <FiPlus className="text-orange-200/70 group-hover:text-orange-200 transition" />
      <span className="text-gray-300">Create Recipe</span>
    </button>
  );

  const emptyState = (
    <div className="flex flex-col w-full max-w-xl justify-center p-10 items-center text-center">
      {isSavedTabActive ? (
        <GrFavorite className="size-10 sm:size-12 text-orange-200 mb-4 sm:mb-3" />
      ) : (
        <LuNotebookPen className="size-10 sm:size-12 text-orange-200 mb-4 sm:mb-3" />
      )}
      <h2 className="text-xl sm:text-2xl font-bold mb-3 text-gray-300">
        {isSavedTabActive
          ? "Your favorites list is empty"
          : "You haven't created any recipes yet"}
      </h2>

      <p className="text-gray-400 max-w-md mb-10">
        {isSavedTabActive
          ? "Browse recipes for inspiration and select your favorites."
          : "Write your own recipes and keep them all in one place."}
      </p>
      {isSavedTabActive ? (
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

  return (
    <>
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

      {showCreateRecipeModal && (
        <div className="fixed inset-0 overflow-y-auto bg-black bg-opacity-70 z-20">
          <div className="min-h-full flex justify-center items-start py-10">
            <div className="relative group/close bg-gray-950 border border-gray-800 rounded-3xl shadow-2xl p-6 mx-2 w-full max-w-lg text-center animate-popIn">
              <CreateRecipeForm />
              <button
                className="absolute p-1 right-4 top-3 rounded-full text-xl bg-opacity-30 
              lg:opacity-0 lg:group-hover/close:opacity-100 lg:hover:bg-opacity-50 hover:scale-110 transition-all 
              bg-gray-600 active:scale-95 text-gray-200 z-10"
                onClick={() => setShowCreateRecipeModal(false)}
              >
                <IoMdClose />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Favorites;
