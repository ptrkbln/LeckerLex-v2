export const updateFavoritesDatabase = async (updatedFavorites) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/users/update-favorites`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ favorites: updatedFavorites }),
      },
    );
    if (!response.ok) {
      throw new Error("Failed to update favorites.");
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};
