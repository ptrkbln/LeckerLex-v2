import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { RecipeContext } from "../context/RecipeContext";
import CategorySlider from "../components/CategorySlider";
import Ingredients from "../components/Ingredients";
import SearchBar from "../components/SearchBar";
import Sidebar from "../components/Sidebar";
import toast from "react-hot-toast";

export default function HomePage() {
  const navigate = useNavigate();
  const { setRecipes } = useContext(RecipeContext); // Access setRecipes from context to store fetched recipes
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Manage sidebar
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  // Remove error message when appropriate number of ingredients is selected
  useEffect(() => {
    if (errorMessage && selectedIngredients.length >= 3) setErrorMessage("");
  }, [selectedIngredients, errorMessage]);

  // Replace spaces in ingredient names with underscores
  const formattedIngredients = selectedIngredients.map((ingredient) =>
    ingredient.replace(/\s+/g, "_"),
  );

  // Convert formattedIngredients to a query string
  const ingredientQuery = formattedIngredients.join(","); // join ingredients with comma

  const handleSearch = async () => {
    if (selectedIngredients.length < 3) {
      setErrorMessage("Pick at least 3 ingredients to start your search.");
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);
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
        if (response.status === 429 || response.status === 402) {
          toast.error(
            "No more recipe searches available today. Come back tomorrow.",
            {
              id: toastId,
              duration: undefined,
            },
          );
          setRecipes([]);
          return;
        }
        try {
          const errorData = await response.json();
          console.error("Recipe search failed:", errorData);
        } catch (error) {
          console.error(
            "Recipe search failed: could not parse error response",
            error,
          );
        }
        toast.error("Couldn't load recipes.", {
          id: toastId,
          duration: undefined,
        });
        return;
      }

      const data = await response.json();

      if (!Array.isArray(data.data)) {
        console.error(
          "Response from backend on recipe search is not in correct shape:",
          data.data,
        );
        toast.error("Something went wrong with the recipe results.", {
          id: toastId,
          duration: undefined,
        });
        return;
      }

      setRecipes(data.data); // Update the recipes state with the response from backend
      toast.dismiss(toastId);
      navigate("results");
    } catch (error) {
      console.error("Error fetching recipes", error);
      toast.error("Connection failed.", {
        id: toastId,
        duration: undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveIngredient = (index) => {
    setSelectedIngredients((prevIngredients) =>
      prevIngredients.filter((_, i) => i !== index),
    );
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
    <div className="min-w-full bg-black">
      <div className="flex justify-center items-center">
        <SearchBar
          searchText={searchText}
          setSearchText={setSearchText}
          handleSearch={handleSearch}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          handleAddIngredient={handleAddIngredient}
          isSubmitting={isSubmitting}
        />
      </div>
      {errorMessage && (
        <p className="text-rose-400 text-center absolute left-1/2 -translate-x-1/2 text-sm md:text-base w-full">
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
