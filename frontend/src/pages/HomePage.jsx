import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { RecipeContext } from "../context/RecipeContext";
import CategorySlider from "../components/CategorySlider";
import Ingredients from "../components/Ingredients";
import SearchBar from "../components/SearchBar";
import Sidebar from "../components/Sidebar";

export default function HomePage() {
  const [guestCount, setGuestCount] = useState(0);
  useEffect(() => {
    // Funktion zum Registrieren des Gastbesuchs

    const registerGuestVisit = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/guests/add-visit`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.log("failed to register guest visit:", errorData.message);
          return;
        }

        const data = await response.json();
        console.log("Guest visit registered successfully:", data);
      } catch (error) {
        console.log("Error registering guest visit:", error.message);
      }
    };

    // Funktion, um die Anzahl der Gäste abzurufen

    const fetchGuestCount = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/guests/count`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.log("Failed to fetch guests count:", errorData.message);
          return;
        }
        const data = await response.json();
        setGuestCount(data.count);
        console.log("Guest count fetched successfully:", data);
      } catch (error) {
        console.log("Error fetching guest count:", error.message);
      }
    };

    registerGuestVisit(); // gastbesuch registrieren
    fetchGuestCount(); // Gastanzahl abrufen
  }, []); // stellt sicher, dass dies nur einmal ausgeführt wird, wenn die Komponente bereitgestellt wird

  // access setRecipes from context to store fetched recipes
  const { recipes, setRecipes } = useContext(RecipeContext);

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

  /*   // selectedIngredients query format
  const formattedIngredients = selectedIngredients.map((ingredient) =>
    ingredient.replace(/\s+/g, "_")
  ); // replace spaces with underscores in ingredient name
  const ingredientQuery = formattedIngredients.join(","); // join ingredients with comma
  console.log("Ingredient Query:", ingredientQuery); // works! */

  // Update the formatted ingredients whenever selectedIngredients changes
  useEffect(() => {
    const formatted = selectedIngredients.map((ingredient) =>
      ingredient.replace(/\s+/g, "_")
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
    if (selectedIngredients.length < 2) {
      setErrorMessage("Please select at least 2 ingredients.");
      return;
    }
    setErrorMessage(""); // clear previous errors

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/search/recipes?ingredients=${ingredientQuery}`, // TODO pfad mit .env variable ersetzen
        {
          credentials: "include", // include cors credentials
        }
      );
      if (!response.ok) {
        let errorMessage = "Something went wrong. Please try again.";

        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (error) {
          console.error("Error parsing JSON response", error);
        }
        setErrorMessage(errorMessage);
        return;
      }
      const data = await response.json();

      if (!Array.isArray(data.data)) {
        setErrorMessage("API daily limit exceeded. Try again tomorrow.");
        setRecipes([]); // Ensure it's an array to prevent .map() errors when limit exceeded
        return;
      }

      setRecipes(data.data); // Update the recipes state with the response from backend
      navigate("results"); // navigate to recipes page
    } catch (error) {
      console.error("Error fetching recipes", error); // debug log
      setErrorMessage("An error occured. Please try again later.");
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
    <div className="min-h-full min-w-full bg-black">
      <div className="flex justify-center items-center">
        <SearchBar
          searchText={searchText}
          setSearchText={setSearchText}
          handleSearch={handleSearch}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          selectedIngredients={selectedIngredients}
          handleAddIngredient={handleAddIngredient}
        />
      </div>
      {errorMessage && (
        <p className="text-red-500 text-center mt-4">{errorMessage}</p>
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
