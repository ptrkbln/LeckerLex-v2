import { useContext } from "react";
import { RecipeContext } from "../context/RecipeContext";
import { useNavigate } from "react-router-dom";
import RecipeCollection from "../components/RecipeCollection";

function ResultPage() {
  const { recipes } = useContext(RecipeContext);
  const navigate = useNavigate();

  // No spinner needed: recipes are loaded before navigating to this page
  // If no recipes are in context (eg. page refresh) navigate to search (home) page
  if (recipes.length === 0) navigate("/home");

  return (
    <RecipeCollection
      recipesSource={recipes}
      heading={"Matching Recipes"}
      sourceType={"search"}
    />
  );
}

export default ResultPage;
