import { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";

export const RecipeContext = createContext();

export default function RecipeContextProvider({ children }) {
  const [recipes, setRecipes] = useState([]);
  const [shoppingList, setShoppingList] = useState([]);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [areSavedRecipesLoaded, setAreSavedRecipesLoaded] = useState(false);
  const [ownRecipes, setOwnRecipes] = useState([]);
  const [areOwnRecipesLoaded, setAreOwnRecipesLoaded] = useState(false);
  const { isLoggedIn, isAuthChecked } = useContext(AuthContext);

  useEffect(() => {
    if (!isAuthChecked) return;

    const fetchSavedRecipes = async () => {
      setAreSavedRecipesLoaded(false);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/users/saved-recipes`,
          { credentials: "include" },
        );

        if (!response.ok) return;
        const savedRecipes = await response.json();

        setSavedRecipes(savedRecipes.data);
      } catch (error) {
        console.log(error);
      } finally {
        setAreSavedRecipesLoaded(true);
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
      fetchSavedRecipes();
      fetchOwnRecipes();
    } else {
      setSavedRecipes([]);
      setOwnRecipes([]);
      setAreSavedRecipesLoaded(true);
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
        savedRecipes,
        setSavedRecipes,
        ownRecipes,
        setOwnRecipes,
        areSavedRecipesLoaded,
        areOwnRecipesLoaded,
      }}
    >
      {children}
    </RecipeContext.Provider>
  );
}
