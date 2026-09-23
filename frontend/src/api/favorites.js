export const updateSavedRecipesDatabase = async (updatedSavedRecipes) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/users/saved-recipes`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ savedRecipes: updatedSavedRecipes }),
      },
    );
    if (!response.ok) {
      throw new Error("Failed to update saved recipes.");
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};
