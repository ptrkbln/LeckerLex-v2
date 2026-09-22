import { useContext, useState } from "react";
import { RecipeContext } from "../context/RecipeContext";
import { useNavigate } from "react-router-dom";
import { GrFavorite } from "react-icons/gr";
import RecipeCollection from "../components/RecipeCollection";
import { updateSavedRecipesDatabase } from "../api/favorites";
import toast from "react-hot-toast";
import { ImSpinner2 } from "react-icons/im";
import { LuNotebookPen } from "react-icons/lu";
import { FiPlus } from "react-icons/fi";
import CreateRecipeForm from "../components/CreateRecipeForm";
import { XButton } from "../components/XButton";

function Favorites() {
  const [tab, setTab] = useState("saved");
  const [showCreateRecipeModal, setShowCreateRecipeModal] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState(null);
  const {
    savedRecipes,
    setSavedRecipes,
    areSavedRecipesLoaded,
    areOwnRecipesLoaded,
    ownRecipes,
    setOwnRecipes,
  } = useContext(RecipeContext);
  const navigate = useNavigate();
  const isSavedTabActive = tab === "saved";
  const recipeList = tab === "saved" ? savedRecipes : ownRecipes;

  // Remove from UI immediately, if backend call fails revert to previous state
  const handleRemoveFromSavedRecipes = async (e, savedRecipeId) => {
    e.stopPropagation();
    const previousSavedRecipes = savedRecipes;

    const updatedSavedRecipes = savedRecipes.filter(
      (item) => item.id !== savedRecipeId,
    );

    setSavedRecipes(updatedSavedRecipes);

    try {
      await updateSavedRecipesDatabase(previousSavedRecipes);
    } catch {
      setSavedRecipes(previousSavedRecipes);
      toast.error(
        "Something went wrong while removing the recipe from your saved list.",
      );
    }
  };

  // Remove from UI immediately, if backend call fails revert to previous state
  const handleDeleteOwnRecipe = async (e, ownRecipeId) => {
    e.stopPropagation();
    const previousOwnRecipes = ownRecipes;

    const updatedOwnRecipes = ownRecipes.filter(
      (item) => item._id !== ownRecipeId,
    );

    setRecipeToDelete(null);
    setOwnRecipes(updatedOwnRecipes);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/users/own-recipes/${ownRecipeId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (!response.ok) {
        setOwnRecipes(previousOwnRecipes);
        toast.error("Something went wrong while deleting your recipe.");
      }
    } catch {
      setOwnRecipes(previousOwnRecipes);
      toast.error("Something went wrong while deleting your recipe.");
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
          ? "Your saved recipes list is empty"
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

  if (!areSavedRecipesLoaded || !areOwnRecipesLoaded) {
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
            recipesSource={isSavedTabActive ? savedRecipes : ownRecipes}
            sourceType={isSavedTabActive ? "savedRecipes" : "ownRecipes"}
            createRecipeControl={!isSavedTabActive ? createRecipeButton : null}
            showFilters={isSavedTabActive}
            handleRemoveFromSavedRecipes={
              isSavedTabActive ? handleRemoveFromSavedRecipes : null
            }
            setRecipeToDelete={setRecipeToDelete}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            {emptyState}
          </div>
        )}
      </div>

      {recipeToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-20">
          <div className="bg-gray-950 border border-gray-800 rounded-3xl shadow-2xl p-6 mx-4 w-full max-w-sm text-center animate-popIn">
            <p className="text-gray-200 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-orange-200">
                {recipeToDelete.title}
              </span>
              ?
            </p>

            <div className="flex justify-center gap-4">
              <button
                className="px-5 py-2 rounded-full text-sm text-rose-400 border border-rose-400/50 hover:border-rose-400/75 hover:bg-rose-400/10 active:scale-[0.98] transition-all"
                onClick={(e) => handleDeleteOwnRecipe(e, recipeToDelete._id)}
              >
                Delete
              </button>

              <button
                className="px-5 py-2 rounded-full text-sm text-gray-300 border border-gray-700 hover:border-gray-500 hover:bg-gray-500/10 active:scale-[0.98] transition-all"
                onClick={() => setRecipeToDelete(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateRecipeModal && (
        <div className="fixed inset-0 overflow-y-auto bg-black bg-opacity-70 z-20">
          <div className="min-h-full flex justify-center items-start py-10">
            <div className="relative group/close bg-gray-950 border border-gray-800 rounded-3xl shadow-2xl p-6 mx-2 w-full max-w-lg text-center animate-popIn">
              <CreateRecipeForm
                setShowCreateRecipeModal={setShowCreateRecipeModal}
              />
              <XButton onClick={() => setShowCreateRecipeModal(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Favorites;
