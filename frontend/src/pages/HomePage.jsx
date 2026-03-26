import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { RecipeContext } from "../context/RecipeContext";
import CategorySlider from "../components/CategorySlider";
import Ingredients from "../components/Ingredients";
import SearchBar from "../components/SearchBar";
import Sidebar from "../components/Sidebar";
import toast from "react-hot-toast";

export default function HomePage() {
  // access setRecipes from context to store fetched recipes
  const { setRecipes } = useContext(RecipeContext);

  // manage error message text
  const [errorMessage, setErrorMessage] = useState("");

  // category selection
  const [selectedCategory, setSelectedCategory] = useState("null");

  // collect chosen ingredients
  const [selectedIngredients, setSelectedIngredients] = useState([]);

  // manage the search input text
  const [searchText, setSearchText] = useState("");

  // manage the sidebar

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // State to hold the formatted ingredients
  const [formattedIngredients, setFormattedIngredients] = useState([]);

  const [isLoading, setIsLoading] = useState(false);

  /*   // selectedIngredients query format
  const formattedIngredients = selectedIngredients.map((ingredient) =>
    ingredient.replace(/\s+/g, "_")
  ); // replace spaces with underscores in ingredient name
  const ingredientQuery = formattedIngredients.join(","); // join ingredients with comma
  console.log("Ingredient Query:", ingredientQuery); // works! */

  // Update the formatted ingredients whenever selectedIngredients changes
  useEffect(() => {
    const formatted = selectedIngredients.map((ingredient) =>
      ingredient.replace(/\s+/g, "_"),
    );
    setFormattedIngredients(formatted); // Update formatted ingredients state
  }, [selectedIngredients]);

  // Convert formattedIngredients to a query string
  const ingredientQuery = formattedIngredients.join(","); // join ingredients with comma

  const navigate = useNavigate();

  // List of all categories

  const categories = [
    { id: "Fruits", name: "Fruit" },
    { id: "Vegetables", name: "Veggies" },
    { id: "Dairy Products", name: "Dairy" },
    { id: "Meat", name: "Meat" },
    { id: "Seafood", name: "Seafood" },
    {
      id: "Flour and Baking Ingredients",
      name: "Baking",
    },
    { id: "Grains and Legumes", name: "Grains/Legumes" },
    { id: "Eggs and Proteins", name: "Eggs/Proteins" },
    { id: "Canned Goods and Sauces", name: "Goods/Sauces" },
    { id: "Herbs and Spices", name: "Herbs/Spices" },
    { id: "Oils and Fats", name: "Oils/Fats" },
    { id: "Snacks and Side Dishes", name: "Snacks/Sides" },
  ];

  const handleSearch = async () => {
    if (selectedIngredients.length < 3) {
      setErrorMessage("Pick at least 3 ingredients to start your search.");
      return;
    }
    if (isLoading) return;
    setIsLoading(true);
    setErrorMessage(""); // clear previous errors
    const toastId = toast.loading("Searching recipes...", {
      duration: Infinity,
    });

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/search/recipes?ingredients=${ingredientQuery}`, // TODO pfad mit .env variable ersetzen
        {
          credentials: "include", // include cors credentials
        },
      );

      if (!response.ok) {
        if (response.status === 429) {
          setErrorMessage(
            "Recipe search limit reached for today. Try again tomorrow.",
          );
          setRecipes([]);
          toast.dismiss(toastId);
          return;
        }
        try {
          const errorData = await response.json();
          console.log("Recipe search failed:", errorData);
        } catch (error) {
          console.error(
            "Recipe search failed: could not parse error response",
            error,
          );
        }
        toast.error("Couldn't load recipes.", {
          id: toastId,
        });
        return;
      }

      const data = await response.json();

      if (Array.isArray(data.data)) {
        setRecipes(data.data); // Update the recipes state with the response from backend
      } else {
        console.error(
          "Response from backend on recipe search is not in correct shape:",
          data.data,
        );
        toast.error("Couldn't load recipes.", {
          id: toastId,
        });
        return;
      }

      toast.dismiss(toastId);
      navigate("results"); // navigate to recipes page
    } catch (error) {
      console.error("Error fetching recipes", error); // debug log
      toast.error("Connection failed.", {
        id: toastId,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveIngredient = (index) => {
    setSelectedIngredients((prevIngredients) => {
      const updatedIngredients = prevIngredients.filter((_, i) => i !== index);
      return updatedIngredients;
    });
  };

  const handleRemoveAll = () => {
    console.log("Removing all ingredients...");
    setSelectedIngredients([]);
    setSearchText("");
  };

  // Handle adding ingredients manually from the SearchBar
  const handleAddIngredient = (ingredients) => {
    console.log("Ingredients to Add:", ingredients);
    setSelectedIngredients((prev) => {
      const updated = [
        ...prev,
        ...ingredients.filter((ing) => !prev.includes(ing)),
      ];
      console.log("Updated Ingredients:", updated);
      return updated;
    });
  };

  return (
    <div className="min-w-full bg-black relative">
      <div className="flex justify-center items-center">
        <SearchBar
          searchText={searchText}
          setSearchText={setSearchText}
          handleSearch={handleSearch}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          selectedIngredients={selectedIngredients}
          handleAddIngredient={handleAddIngredient}
          isLoading={isLoading}
        />
      </div>
      {errorMessage && (
        <p className="text-red-500 text-center absolute left-1/2 -translate-x-1/2 text-sm md:text-base w-full">
          {errorMessage}
        </p>
      )}
      <CategorySlider
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />
      <Ingredients
        selectedCategory={selectedCategory}
        selectedIngredients={selectedIngredients}
        setSelectedIngredients={setSelectedIngredients}
        searchText={searchText}
        setSearchText={setSearchText}
      />

      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        selectedIngredients={selectedIngredients}
        handleRemoveIngredient={handleRemoveIngredient}
        handleRemoveAll={handleRemoveAll}
      />
    </div>
  );
}
