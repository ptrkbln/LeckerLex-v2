export const addToShoppingListDatabase = async (missingIngredients) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/users/update-shoppinglist`,
      {
        method: "PATCH",
        body: JSON.stringify({
          shoppingList: missingIngredients,
          action: "add",
        }),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      },
    );

    if (!response.ok) {
      throw new Error("Failed to add ingredients to shopping list.");
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};
