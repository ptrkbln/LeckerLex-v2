import React, { useEffect } from "react";
import IngredientsGallery from "./IngredientsGallery";

// Images - Herbs and Spices
import Chilli from "../assets/Ingredients/Herbs_Spices/chilli.png";
import Cumin from "../assets/Ingredients/Herbs_Spices/cumin.png";
import Dill from "../assets/Ingredients/Herbs_Spices/dill.png";
import Dry_Bay from "../assets/Ingredients/Herbs_Spices/dry_bay_leaf.png";
import Ginger from "../assets/Ingredients/Herbs_Spices/ginger.png";
import Paprika from "../assets/Ingredients/Herbs_Spices/paprika.png";
import Parsley from "../assets/Ingredients/Herbs_Spices/parsley.png";
import Rosemary from "../assets/Ingredients/Herbs_Spices/rosemary.png";
import Spinach from "../assets/Ingredients/Herbs_Spices/spinach.png";
import Thyme from "../assets/Ingredients/Herbs_Spices/thyme.png";
import Turmeric from "../assets/Ingredients/Herbs_Spices/turmeric.png";
import Cinnamon from "../assets/Ingredients/Herbs_Spices/cinnamon.png";
import Nutmeg from "../assets/Ingredients/Herbs_Spices/nutmeg.png";

// Images - Vegetables
import Avocado from "../assets/Ingredients/Vegetables/avocado.png";
import Garlic from "../assets/Ingredients/Vegetables/garlic.png";
import Onion from "../assets/Ingredients/Vegetables/onion.png";
import Potato from "../assets/Ingredients/Vegetables/potato.png";
import Red_Onion from "../assets/Ingredients/Vegetables/red_onion.png";

// Images - Fruits
import Apple from "../assets/Ingredients/Fruits/apple.png";
import Banana from "../assets/Ingredients/Fruits/banana.png";
import Blueberry from "../assets/Ingredients/Fruits/blueberry.png";
import Lemon from "../assets/Ingredients/Fruits/lemon.png";
import Orange from "../assets/Ingredients/Fruits/orange.png";
import Strawberry from "../assets/Ingredients/Fruits/strawberry.png";
import Grape from "../assets/Ingredients/Fruits/grape.png";
import Lime from "../assets/Ingredients/Fruits/lime.png";
import Mango from "../assets/Ingredients/Fruits/mango.png";
import Pineapple from "../assets/Ingredients/Fruits/pineapple.png";
import Raspberry from "../assets/Ingredients/Fruits/raspberry.png";

// Images - Meat
import Bacon from "../assets/Ingredients/Meat/bacon.png";
import Chicken_Breast from "../assets/Ingredients/Meat/chicken_breast.png";
import Ham from "../assets/Ingredients/Meat/ham.png";
import Pork from "../assets/Ingredients/Meat/pork.png";
import Salami from "../assets/Ingredients/Meat/salami.png";

// Images - Seafood
import Salmon from "../assets/Ingredients/Fish/salmon.png";
import Shrimp from "../assets/Ingredients/Fish/shrimp.png";
import Tuna from "../assets/Ingredients/Fish/tuna.png";

// Images - Grains
import Rice from "../assets/Ingredients/Grains_Legumes/rice.png";
import Bulgur from "../assets/Ingredients/Grains_Legumes/bulgur.png";
import Oats from "../assets/Ingredients/Grains_Legumes/oats.png";
import Quinoa from "../assets/Ingredients/Grains_Legumes/quinoa.png";
import Lentils from "../assets/Ingredients/Grains_Legumes/lentils.png";
import Beans from "../assets/Ingredients/Grains_Legumes/beans.png";
import Corn from "../assets/Ingredients/Grains_Legumes/corn.png";
import Chickpeas from "../assets/Ingredients/Grains_Legumes/chickpeas.png";
import Couscous from "../assets/Ingredients/Grains_Legumes/couscous.png";
import Pasta from "../assets/Ingredients/Grains_Legumes/pasta.png";
import Macaroni from "../assets/Ingredients/Grains_Legumes/macaroni.png";

// Images - Snacks & Side Dishes
import Almonds from "../assets/Ingredients/Snacks_Side_Dishes/almonds.png";
import Bread from "../assets/Ingredients/Snacks_Side_Dishes/bread.png";
import Cashews from "../assets/Ingredients/Snacks_Side_Dishes/cashews.png";
import Hazelnuts from "../assets/Ingredients/Snacks_Side_Dishes/hazelnuts.png";
import Peanuts from "../assets/Ingredients/Snacks_Side_Dishes/peanuts.png";
import Tortilla from "../assets/Ingredients/Snacks_Side_Dishes/tortilla.png";
import Walnuts from "../assets/Ingredients/Snacks_Side_Dishes/walnuts.png";

// Images - Dairy products
import Butter from "../assets/Ingredients/Dairy_Products/butter.png";
import Cream from "../assets/Ingredients/Dairy_Products/cream.png";
import Milk from "../assets/Ingredients/Dairy_Products/milk.png";
import Mozzarella from "../assets/Ingredients/Dairy_Products/mozzarella.png";
import Parmesan from "../assets/Ingredients/Dairy_Products/parmesan.png";
import Quark from "../assets/Ingredients/Dairy_Products/quark.png";
import Shepherds_Cheese from "../assets/Ingredients/Dairy_Products/shepherds_cheese.png";
import Soft_Cheese from "../assets/Ingredients/Dairy_Products/soft_cheese.png";
import Yogurt from "../assets/Ingredients/Dairy_Products/yogurt.png";

// Images - Oils & Fats
import Butter_Oil from "../assets/Ingredients/Oils_Fats/butter_oil.png";
import Coconut_Oil from "../assets/Ingredients/Oils_Fats/coconut_oil.png";
import Margarine_Vegan from "../assets/Ingredients/Oils_Fats/margarine_vegan.png";
import Olive_Oil from "../assets/Ingredients/Oils_Fats/olive_oil.png";
import Sesame_Oil from "../assets/Ingredients/Oils_Fats/sesame_oil.png";
import Sunflower_Oil from "../assets/Ingredients/Oils_Fats/sunflower_oil.png";

// Images - Flour & Baking Ingredients
import Chocolate from "../assets/Ingredients/Flour_Baking_Ingredients/chocolate.png";
import Cocoa_Powder from "../assets/Ingredients/Flour_Baking_Ingredients/cocoa_powder.png";
import Flour from "../assets/Ingredients/Flour_Baking_Ingredients/flour.png";
import Honey from "../assets/Ingredients/Flour_Baking_Ingredients/honey.png";
import Maple_Syrup from "../assets/Ingredients/Flour_Baking_Ingredients/maple_syrup.png";
import Sugar from "../assets/Ingredients/Flour_Baking_Ingredients/sugar.png";
import Vanilla from "../assets/Ingredients/Flour_Baking_Ingredients/vanilla.png";
import Yeast from "../assets/Ingredients/Flour_Baking_Ingredients/yeast.png";

// Images - Eggs & Proteins
import Eggs from "../assets/Ingredients/Eggs_Proteins/eggs.png";
import Tempeh from "../assets/Ingredients/Eggs_Proteins/tempeh.png";
import Tofu from "../assets/Ingredients/Eggs_Proteins/tofu.png";

// Images - Canned goods & Sauces
import Broth from "../assets/Ingredients/Canned_Goods_Sauces/broth.png";
import Fish_Sauce from "../assets/Ingredients/Canned_Goods_Sauces/fish_sauce.png";
import Ketchup from "../assets/Ingredients/Canned_Goods_Sauces/ketchup.png";
import Mayonnaise from "../assets/Ingredients/Canned_Goods_Sauces/mayonnaise.png";
import Mustard from "../assets/Ingredients/Canned_Goods_Sauces/mustard.png";
import Soy_Sauce from "../assets/Ingredients/Canned_Goods_Sauces/soy_sauce.png";
import Tomato_Paste from "../assets/Ingredients/Canned_Goods_Sauces/tomato_paste.png";
import Vinegar from "../assets/Ingredients/Canned_Goods_Sauces/vinegar.png";
import Worcestershire_Sauce from "../assets/Ingredients/Canned_Goods_Sauces/worcestershire_sauce.png";

export default function Ingredients({
  selectedCategory,
  selectedIngredients,
  setSelectedIngredients,
  searchText,
  setSearchText,
}) {
  // All categories / ingredients

  // Herbs and Spices
  const herbsAndSpices = [
    { src: Chilli, alt: "Chilli" },
    { src: Cinnamon, alt: "Cinnamon" },
    { src: Cumin, alt: "Cumin" },
    { src: Dill, alt: "Dill" },
    { src: Dry_Bay, alt: "Dried Bay leaf" },
    { src: Paprika, alt: "Paprika" },
    { src: Parsley, alt: "Parsley" },
    { src: Spinach, alt: "Spinach" },
    { src: Rosemary, alt: "Rosemary" },
    { src: Thyme, alt: "Thyme" },
    { src: Ginger, alt: "Ginger" },
    { src: Turmeric, alt: "Turmeric" },
    { src: Nutmeg, alt: "Nutmeg" },
  ];

  // Vegetables
  const vegetables = [
    { src: Avocado, alt: "Avocado" },
    { src: Garlic, alt: "Garlic" },
    { src: Onion, alt: "Onion" },
    { src: Potato, alt: "Potato" },
    { src: Red_Onion, alt: "Red Onion" },
  ];

  // Fruits
  const fruits = [
    { src: Apple, alt: "Apple" },
    { src: Banana, alt: "Banana" },
    { src: Blueberry, alt: "Blueberry" },
    { src: Grape, alt: "Grape" },
    { src: Lemon, alt: "Lemon" },
    { src: Lime, alt: "Lime" },
    { src: Mango, alt: "Mango" },
    { src: Orange, alt: "Orange" },
    { src: Pineapple, alt: "Pineapple" },
    { src: Raspberry, alt: "Raspberry" },
    { src: Strawberry, alt: "Strawberry" },
  ];

  // Meat
  const meat = [
    { src: Bacon, alt: "Bacon" },
    { src: Chicken_Breast, alt: "Chicken Breast" },
    { src: Ham, alt: "Ham" },
    { src: Pork, alt: "Pork" },
    { src: Salami, alt: "Salami" },
  ];

  // Fish
  const seafood = [
    { src: Salmon, alt: "Salmon" },
    { src: Shrimp, alt: "Shrimp" },
    { src: Tuna, alt: "Tuna" },
  ];

  // Snacks & Side Dishes
  const snacks_side_dishes = [
    { src: Almonds, alt: "Almonds" },
    { src: Bread, alt: "Bread" },
    { src: Cashews, alt: "Cashews" },
    { src: Hazelnuts, alt: "Hazelnuts" },
    { src: Peanuts, alt: "Peanuts" },
    { src: Tortilla, alt: "Tortilla" },
    { src: Walnuts, alt: "Walnuts" },
  ];

  // Oils & Fats
  const oils_fats = [
    { src: Butter_Oil, alt: "Butter as oil" },
    { src: Coconut_Oil, alt: "Coconut oil" },
    { src: Olive_Oil, alt: "Olive oil" },
    { src: Sesame_Oil, alt: "Sesame oil" },
    { src: Sunflower_Oil, alt: "Sunflower oil" },
    { src: Margarine_Vegan, alt: "Margarine vegan" },
  ];

  // Grains & Legumes
  const grains_legumes = [
    { src: Beans, alt: "Beans" },
    { src: Bulgur, alt: "Bulgur" },
    { src: Chickpeas, alt: "Chickpeas" },
    { src: Corn, alt: "Corn" },
    { src: Couscous, alt: "Couscous" },
    { src: Lentils, alt: "Lentils" },
    { src: Macaroni, alt: "Macaroni" },
    { src: Oats, alt: "Oats" },
    { src: Pasta, alt: "Pasta" },
    { src: Quinoa, alt: "Quinoa" },
    { src: Rice, alt: "Rice" },
  ];

  // Flour & baking ingredients
  const flour_baking_ingredients = [
    { src: Chocolate, alt: "Chocolate" },
    { src: Cocoa_Powder, alt: "Cocoa Powder" },
    { src: Flour, alt: "Flour" },
    { src: Honey, alt: "Honey" },
    { src: Maple_Syrup, alt: "Maple Syrup" },
    { src: Sugar, alt: "Sugar" },
    { src: Vanilla, alt: "Vanilla" },
    { src: Yeast, alt: "Yeast" },
  ];

  // Eggs & proteins
  const eggs_proteins = [
    { src: Eggs, alt: "Eggs" },
    { src: Tempeh, alt: "Tempeh" },
    { src: Tofu, alt: "Tofu" },
  ];

  // Dairy products
  const dairy_products = [
    { src: Butter, alt: "Butter" },
    { src: Cream, alt: "Cream" },
    { src: Milk, alt: "Milk" },
    { src: Mozzarella, alt: "Mozzarella" },
    { src: Parmesan, alt: "Parmesan" },
    { src: Quark, alt: "Quark" },
    { src: Shepherds_Cheese, alt: "Shepherds Cheese" },
    { src: Soft_Cheese, alt: "Soft Cheese" },
    { src: Yogurt, alt: "Yogurt" },
  ];

  // Canned goods & sauces
  const canned_goods_sauces = [
    { src: Broth, alt: "Broth" },
    { src: Fish_Sauce, alt: "Fish Sauce" },
    { src: Ketchup, alt: "Ketchup" },
    { src: Mayonnaise, alt: "Mayonnaise" },
    { src: Mustard, alt: "Mustard" },
    { src: Soy_Sauce, alt: "Soy Sauce" },
    { src: Tomato_Paste, alt: "Tomato Paste" },
    { src: Vinegar, alt: "Vinegar" },
    { src: Worcestershire_Sauce, alt: "Worcestershire" },
  ];

  // Function to handle the click event on an ingredient image
  const handleImageClick = (ingredientName) => {
    // check if the ingredient is already selected
    const updated = selectedIngredients.includes(ingredientName)
      ? // if selected, remove it from the list
        selectedIngredients.filter((item) => item !== ingredientName)
      : // if not selected, add it to the list
        [...selectedIngredients, ingredientName];

    // update the state with the new list of selected ingredients
    setSelectedIngredients(updated);

    // if there is no search text, reset it to an empty string
    if (!searchText) {
      setSearchText("");
    }
  };

  // Convert the typed text into a list of ingredients (case-insensitive)
  useEffect(() => {
    // if there is no search text, exit the effect
    if (!searchText) return;

    // split the search text by commas, convert to lowercase, trim whitespace, and capitalize the first letter
    const typed = searchText
      .split(",")
      .map((item) =>
        item
          .trim()
          .toLowerCase()
          .replace(/^\w/, (c) => c.toUpperCase())
      )
      .filter((ingredient) => ingredient); // filter out any empty strings

    // Filter array to matches

    const matched = [
      ...herbsAndSpices,
      ...vegetables,
      ...fruits,
      ...meat,
      ...seafood,
      ...grains_legumes,
      ...snacks_side_dishes,
      ...dairy_products,
      ...oils_fats,
      ...flour_baking_ingredients,
      ...eggs_proteins,
      ...canned_goods_sauces,
    ]

      .filter((h) => typed.includes(h.alt.toLowerCase()))
      .map(
        (ingredient) =>
          ingredient.alt.charAt(0).toUpperCase() +
          ingredient.alt.slice(1).toLowerCase()
      );

    const uniqueIngredients = Array.from(
      new Set([...selectedIngredients, ...matched])
    );

    // Update selectedIngredients if changed
    if (
      JSON.stringify(uniqueIngredients) !== JSON.stringify(selectedIngredients)
    ) {
      setSelectedIngredients(uniqueIngredients);
    }
  }, [searchText, selectedIngredients]);

  return (
    <IngredientsGallery
      herbsAndSpices={herbsAndSpices}
      vegetables={vegetables}
      fruits={fruits}
      meat={meat}
      seafood={seafood}
      grainsAndLegumes={grains_legumes}
      snacksAndSideDishes={snacks_side_dishes}
      dairyProducts={dairy_products}
      oilsAndFats={oils_fats}
      flourAndBakingIngredients={flour_baking_ingredients}
      eggsAndProteins={eggs_proteins}
      cannedGoodsAndSauces={canned_goods_sauces}
      selectedIngredients={selectedIngredients}
      handleImageClick={handleImageClick}
      selectedCategory={selectedCategory}
    />
  );
}
