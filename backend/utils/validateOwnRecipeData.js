// Take raw FormData values -> parse JSON -> convert numbers -> validate -> return clean recipe object OR error object
export function validateOwnRecipeData({
  title,
  ingredients,
  preparationSteps,
  servingsAmount,
  preparationTime,
  servingPortion,
  diet,
  nutritionPer100g,
  nutritionPerServing,
}) {
  // Parse values that are arrays/objects
  let parsedIngredients;
  let parsedPreparationSteps;
  let parsedServingPortion;
  let parsedDiet;
  let parsedNutritionPer100g;
  let parsedNutritionPerServing;
  // FormData sends arrays/objects as JSON strings.
  // Catch JSON.parse error if invalid/non-JSON data is sent and return 400 instead of letting it become a 500 server error.
  try {
    parsedIngredients = ingredients ? JSON.parse(ingredients) : undefined;
    parsedPreparationSteps = preparationSteps
      ? JSON.parse(preparationSteps)
      : undefined;
    parsedServingPortion = servingPortion
      ? JSON.parse(servingPortion)
      : undefined;
    parsedDiet = diet ? JSON.parse(diet) : undefined;
    parsedNutritionPer100g = nutritionPer100g
      ? JSON.parse(nutritionPer100g)
      : undefined;
    parsedNutritionPerServing = nutritionPerServing
      ? JSON.parse(nutritionPerServing)
      : undefined;
  } catch {
    return {
      error:
        "Invalid data format. Ingredients and preparation steps should be valid JSON arrays; serving portion, diet, and nutrition should be valid JSON objects.",
    };
  }
  // Validation for object-type properties
  if (
    parsedServingPortion &&
    (typeof parsedServingPortion !== "object" ||
      Array.isArray(parsedServingPortion))
  ) {
    return { error: "Serving portion should be an object." };
  }
  if (
    parsedDiet &&
    (typeof parsedDiet !== "object" || Array.isArray(parsedDiet))
  ) {
    return { error: "Diet should be an object." };
  }
  if (
    parsedNutritionPer100g &&
    (typeof parsedNutritionPer100g !== "object" ||
      Array.isArray(parsedNutritionPer100g))
  ) {
    return { error: "Nutrition per 100g should be an object." };
  }
  if (
    parsedNutritionPerServing &&
    (typeof parsedNutritionPerServing !== "object" ||
      Array.isArray(parsedNutritionPerServing))
  ) {
    return { error: "Nutrition per serving should be an object." };
  }

  // Transform strings into numbers
  const formattedServingsAmount = servingsAmount
    ? Number(servingsAmount)
    : undefined;
  const formattedPreparationTime = preparationTime
    ? Number(preparationTime)
    : undefined;
  const formattedServingPortion = parsedServingPortion
    ? {
        amount: Number(parsedServingPortion.amount),
        unit: parsedServingPortion.unit,
      }
    : undefined;
  const formattedNutritionPer100g = parsedNutritionPer100g
    ? {
        calories: parsedNutritionPer100g.calories
          ? Number(parsedNutritionPer100g.calories)
          : undefined,
        fat: parsedNutritionPer100g.fat
          ? Number(parsedNutritionPer100g.fat)
          : undefined,
        saturatedFat: parsedNutritionPer100g.saturatedFat
          ? Number(parsedNutritionPer100g.saturatedFat)
          : undefined,
        carbohydrates: parsedNutritionPer100g.carbohydrates
          ? Number(parsedNutritionPer100g.carbohydrates)
          : undefined,
        sugar: parsedNutritionPer100g.sugar
          ? Number(parsedNutritionPer100g.sugar)
          : undefined,
        protein: parsedNutritionPer100g.protein
          ? Number(parsedNutritionPer100g.protein)
          : undefined,
        sodium: parsedNutritionPer100g.sodium
          ? Number(parsedNutritionPer100g.sodium)
          : undefined,
      }
    : undefined;
  const formattedNutritionPerServing = parsedNutritionPerServing
    ? {
        calories: parsedNutritionPerServing.calories
          ? Number(parsedNutritionPerServing.calories)
          : undefined,
        fat: parsedNutritionPerServing.fat
          ? Number(parsedNutritionPerServing.fat)
          : undefined,
        saturatedFat: parsedNutritionPerServing.saturatedFat
          ? Number(parsedNutritionPerServing.saturatedFat)
          : undefined,
        carbohydrates: parsedNutritionPerServing.carbohydrates
          ? Number(parsedNutritionPerServing.carbohydrates)
          : undefined,
        sugar: parsedNutritionPerServing.sugar
          ? Number(parsedNutritionPerServing.sugar)
          : undefined,
        protein: parsedNutritionPerServing.protein
          ? Number(parsedNutritionPerServing.protein)
          : undefined,
        sodium: parsedNutritionPerServing.sodium
          ? Number(parsedNutritionPerServing.sodium)
          : undefined,
      }
    : undefined;

  // Format validation
  if (typeof title !== "string") return { error: "Title should be a string." };
  if (!Array.isArray(parsedIngredients))
    return { error: "Ingredients should be an array." };
  if (!Array.isArray(parsedPreparationSteps))
    return { error: "Preparation steps should be an array." };
  if (
    formattedServingsAmount !== undefined &&
    (!Number.isInteger(formattedServingsAmount) || formattedServingsAmount <= 0)
  ) {
    return { error: "Servings should be a positive whole number." };
  }
  if (
    formattedPreparationTime !== undefined &&
    (!Number.isInteger(formattedPreparationTime) ||
      formattedPreparationTime <= 0)
  ) {
    return { error: "Total time should be a positive whole number." };
  }
  if (
    formattedServingPortion &&
    (Number.isNaN(formattedServingPortion.amount) ||
      formattedServingPortion.amount <= 0 ||
      typeof formattedServingPortion.unit !== "string")
  ) {
    return {
      error:
        "Serving portion should contain a positive amount and a string-type unit.",
    };
  }
  if (
    parsedDiet &&
    (typeof parsedDiet.vegetarian !== "boolean" ||
      typeof parsedDiet.vegan !== "boolean" ||
      typeof parsedDiet.glutenFree !== "boolean" ||
      typeof parsedDiet.dairyFree !== "boolean")
  ) {
    return { error: "Diet properties should be boolean values." };
  }
  if (
    formattedNutritionPer100g &&
    Object.values(formattedNutritionPer100g).some(
      (value) => value !== undefined && (Number.isNaN(value) || value < 0),
    )
  ) {
    return {
      error: "Nutrition per 100g values should be valid numbers of 0 or more.",
    };
  }
  if (
    formattedNutritionPerServing &&
    Object.values(formattedNutritionPerServing).some(
      (value) => value !== undefined && (Number.isNaN(value) || value < 0),
    )
  ) {
    return {
      error:
        "Nutrition per serving values should be valid numbers of 0 or more.",
    };
  }

  if (
    !title.trim() ||
    !parsedIngredients ||
    parsedIngredients.length === 0 ||
    !parsedPreparationSteps ||
    parsedPreparationSteps.length === 0
  ) {
    return { error: "Missing mandatory form inputs" };
  }
  return {
    title,
    ingredients: parsedIngredients,
    preparationSteps: parsedPreparationSteps,
    servingsAmount: formattedServingsAmount,
    preparationTime: formattedPreparationTime,
    servingPortion: formattedServingPortion,
    diet: parsedDiet,
    nutritionPer100g: formattedNutritionPer100g,
    nutritionPerServing: formattedNutritionPerServing,
  };
}
