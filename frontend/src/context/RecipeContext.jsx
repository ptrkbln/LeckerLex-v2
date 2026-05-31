import { createContext, useState } from "react";

export const RecipeContext = createContext();

export default function RecipeContextProvider({ children }) {
  const [recipes, setRecipes] = useState([]);
  const [shoppingList, setShoppingList] = useState([]);
  const [isFavorite, setIsFavorite] = useState([]);
  const [favorites, setFavorites] = useState([]);

  return (
    <RecipeContext.Provider
      value={{
        recipes,
        setRecipes,
        shoppingList,
        setShoppingList,
        isFavorite,
        setIsFavorite,
        favorites,
        setFavorites,
      }}
    >
      {children}
    </RecipeContext.Provider>
  );
}
