import { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";

export const RecipeContext = createContext();

export default function RecipeContextProvider({ children }) {
  const [recipes, setRecipes] = useState([]);
  const [shoppingList, setShoppingList] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [areFavoritesLoaded, setAreFavoritesLoaded] = useState(false);
  const [ownRecipes, setOwnRecipes] = useState([]);
  const [areOwnRecipesLoaded, setAreOwnRecipesLoaded] = useState(false);
  const { isLoggedIn, isAuthChecked } = useContext(AuthContext);

  useEffect(() => {
    if (!isAuthChecked) return;

    const fetchFavorites = async () => {
      setAreFavoritesLoaded(false);
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
      } finally {
        setAreFavoritesLoaded(true);
      }
    };

    const fetchOwnRecipes = async () => {
      setAreOwnRecipesLoaded(false);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/users/own-recipes`,
          { credentials: "include" },
        );

        if (!response.ok) return;
        const ownRecipes = await response.json();
        setOwnRecipes(ownRecipes.data);
      } catch (error) {
        console.log(error);
      } finally {
        setAreOwnRecipesLoaded(true);
      }
    };

    if (isLoggedIn) {
      fetchFavorites();
      fetchOwnRecipes();
    } else {
      setFavorites([]);
      setOwnRecipes([]);
      setAreFavoritesLoaded(true);
      setAreOwnRecipesLoaded(true);
    }
  }, [isLoggedIn, isAuthChecked]);

  return (
    <RecipeContext.Provider
      value={{
        recipes,
        setRecipes,
        shoppingList,
        setShoppingList,
        favorites,
        setFavorites,
        ownRecipes,
        setOwnRecipes,
        areFavoritesLoaded,
        areOwnRecipesLoaded,
      }}
    >
      {children}
    </RecipeContext.Provider>
  );
}
