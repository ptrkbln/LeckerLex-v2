import { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";

export const RecipeContext = createContext();

export default function RecipeContextProvider({ children }) {
  const [recipes, setRecipes] = useState([]);
  const [shoppingList, setShoppingList] = useState([]); // is this needed??
  const [favorites, setFavorites] = useState([]);
  const { isLoggedIn } = useContext(AuthContext);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/users/favorites`,
          { credentials: "include" },
        );

        if (!response.ok) return;
        const favorites = await response.json();

        setFavorites(favorites.data);
      } catch (error) {
        console.log(error);
      }
    };

    if (isLoggedIn) {
      fetchFavorites();
    } else {
      setFavorites([]);
    }
  }, [isLoggedIn]);

  return (
    <RecipeContext.Provider
      value={{
        recipes,
        setRecipes,
        shoppingList,
        setShoppingList,
        favorites,
        setFavorites,
      }}
    >
      {children}
    </RecipeContext.Provider>
  );
}
