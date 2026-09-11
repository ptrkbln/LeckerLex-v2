import { useState, useRef, useEffect } from "react";
import { ImSpinner2 } from "react-icons/im";
import {
  RiCheckboxBlankCircleLine,
  RiCheckboxCircleLine,
} from "react-icons/ri";
import { FiPlus } from "react-icons/fi";
import { MdKeyboardArrowDown } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import toast from "react-hot-toast";
import { InfoTooltip } from "./InfoTooltip";
import { PiUploadSimpleLight } from "react-icons/pi";

const DIET_OPTIONS = ["vegetarian", "vegan", "dairy-free", "gluten-free"];
const inputClasses =
  "w-full pl-4 py-2 border border-gray-600 bg-gray-900 text-gray-200 rounded-3xl focus:outline-none focus:ring-1 focus:ring-emerald-600 placeholder:italic placeholder:text-sm transition";
const labelClasses = "px-3 font-medium text-gray-300";
const allowedImageTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

export default function CreateRecipeForm() {
  const [recipeName, setRecipeName] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [ingrName, setIngrName] = useState("");
  const [ingrAmount, setIngrAmount] = useState("");
  const [ingrUnit, setIngrUnit] = useState("");
  const [steps, setSteps] = useState([]);
  const [step, setStep] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [servings, setServings] = useState("");
  const [servingPortion, setServingPortion] = useState("");
  const [diet, setDiet] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false); // Prevent multiple form submissions while request is in progress
  const [isDietDropdownOpen, setIsDietDropdownOpen] = useState(false);
  const dietDropdownRef = useRef(null);
  const recipeNameRef = useRef(null);
  const ingrAmountRef = useRef(null);
  const stepRef = useRef(null);
  const prepTimeRef = useRef(null);
  const servingsRef = useRef(null);
  const servingPortionRef = useRef(null);

  const [selectedImage, setSelectedImage] = useState(null);
  const [isPer100g, setIsPer100g] = useState(true);
  const [nutrition, setNutrition] = useState({
    per100g: {
      calories: "",
      fat: "",
      saturatedFat: "",
      carbohydrates: "",
      sugar: "",
      protein: "",
      sodium: "",
    },
    perServing: {
      calories: "",
      fat: "",
      saturatedFat: "",
      carbohydrates: "",
      sugar: "",
      protein: "",
      sodium: "",
    },
  });
  const activeNutritionKey = isPer100g ? "per100g" : "perServing";

  // Close calories / diet dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dietDropdownRef.current &&
        !dietDropdownRef.current.contains(e.target)
      ) {
        setIsDietDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAddIngredient = () => {
    if (!ingrAmount || !ingrName.trim() || !ingrUnit.trim()) {
      toast.error("Your ingredient is missing some details.");
      return;
    }
    if (Number(ingrAmount) <= 0) {
      toast.error("Ingredient amount should be greater than 0.");
      return;
    }
    if (
      ingredients.some((ingr) => ingr.name === ingrName.trim().toLowerCase())
    ) {
      toast.error("You already added this ingredient.");
      return;
    }

    const newIngredient = {
      name: ingrName.trim().toLowerCase(),
      amount: ingrAmount,
      unit: ingrUnit.trim().toLowerCase(),
    };

    setIngredients((prev) => [...prev, newIngredient]);

    setIngrAmount("");
    setIngrName("");
    setIngrUnit("");
  };

  const handleRemoveIngredient = (index) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const handleIngredientKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddIngredient();
    }
  };

  const handleAddStep = () => {
    if (!step.trim()) {
      toast.error("Add some instructions first.");
      return;
    }
    if (
      steps.some(
        (existingStep) =>
          existingStep.toLowerCase() === step.trim().toLowerCase(),
      )
    ) {
      toast.error("You already added this step.");
      return;
    }

    setSteps((prev) => [...prev, step.trim()]);

    setStep("");
  };

  const handleRemoveStep = (index) => {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStepKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddStep();
    }
  };

  const handleRemoveDiet = (index) => {
    setDiet((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!allowedImageTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, WEBP and AVIF images allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image should be under 5 MB.");
      return;
    }
    setSelectedImage(file);
  };

  const handleNutritionChange = (nutrient, value) => {
    setNutrition((prev) => ({
      ...prev,
      [activeNutritionKey]: { ...prev[activeNutritionKey], [nutrient]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    //setIsSubmitting(true);
    if (!recipeName.trim()) {
      toast.error("Add a recipe name first.");
      recipeNameRef.current?.focus();
      return;
    }
    if (ingredients.length === 0) {
      toast.error("Add some ingredients first.");
      ingrAmountRef.current?.focus();
      return;
    }
    if (
      servings &&
      (!Number.isInteger(Number(servings)) || Number(servings) <= 0)
    ) {
      toast.error("Servings should be a whole number greater than 0.");
      servingsRef.current?.focus();
      return;
    }
    if (steps.length === 0) {
      toast.error("Add some instructions first.");
      stepRef.current?.focus();
      return;
    }
    if (prepTime && Number(prepTime) <= 0) {
      toast.error("Total time should be at least 1 minute.");
      prepTimeRef.current?.focus();
      return;
    }
    if (servingPortion && Number(servingPortion) <= 0) {
      toast.error("Serving size should be greater than 0.");
      servingPortionRef.current?.focus();
      return;
    }

    const hasInvalidNutrition = (section) =>
      Object.values(nutrition[section]).some(
        (value) => value !== "" && Number(value) < 0,
      );

    if (hasInvalidNutrition("per100g")) {
      setIsPer100g(true);
      toast.error("Nutrition values shouldn't be negative.");
      return;
    }
    if (hasInvalidNutrition("perServing")) {
      setIsPer100g(false);
      toast.error("Nutrition values shouldn't be negative.");
      return;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-7">
      {/* Recipe name */}
      <div className="">
        <div className="relative flex flex-col items-start gap-1">
          <label htmlFor="recipe-name" className={labelClasses}>
            Recipe name
          </label>
          <input
            id="recipe-name"
            ref={recipeNameRef}
            type="text"
            className={`${inputClasses}`}
            value={recipeName}
            onChange={(e) => setRecipeName(e.target.value)}
          />
        </div>
      </div>

      {/* Ingredients */}
      <div className="flex flex-col gap-1 items-start">
        <div className={`${labelClasses} flex justify-between w-full`}>
          <span className="self-start flex items-center gap-1">
            <InfoTooltip>
              Enter the amount, unit and ingredient, then press the{" "}
              <span className="text-orange-200 border border-gray-600 rounded-full size-2 px-1.5">
                +
              </span>{" "}
              button to add it.
            </InfoTooltip>
            Ingredients{" "}
          </span>
          {ingredients.length > 0 && (
            <span className="text-sm self-end italic">
              {ingredients.length} added
            </span>
          )}
        </div>
        {ingredients.map((ingredient, index) => {
          return (
            <div
              key={index}
              className="flex w-full justify-between items-start text-left px-5"
            >
              <span className="text-orange-100/80 text-sm">
                {ingredient.amount} {ingredient.unit} {ingredient.name}
              </span>
              <button
                className="rounded-full text-lg md:text-xl bg-opacity-30 active:scale-95 transition-all duration-300 ease-in-out text-gray-400 hover:text-gray-200"
                onClick={() => handleRemoveIngredient(index)}
              >
                <IoMdClose />
              </button>
            </div>
          );
        })}
        <div className="flex flex-col sm:flex-row w-full gap-2 pt-0.5">
          <div className="flex w-full gap-2">
            <input
              type="number"
              ref={ingrAmountRef}
              placeholder="Amount"
              className={`${inputClasses} [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
              value={ingrAmount}
              onChange={(e) => setIngrAmount(e.target.value)}
              onKeyDown={handleIngredientKeyDown}
            />
            <input
              type="text"
              placeholder="Unit"
              className={`${inputClasses}`}
              value={ingrUnit}
              onChange={(e) => setIngrUnit(e.target.value)}
              onKeyDown={handleIngredientKeyDown}
            />
          </div>
          <div className="flex w-full gap-2">
            <input
              type="text"
              placeholder="Ingredient"
              className={`${inputClasses}`}
              value={ingrName}
              onChange={(e) => setIngrName(e.target.value)}
              onKeyDown={handleIngredientKeyDown}
            />
            <button
              type="button"
              className="flex items-center border gap-2 border-gray-600 hover:border-gray-400 active:scale-[0.98] transition-all rounded-full max-w-max p-2.5 cursor-pointer select-none group self-end"
              onClick={handleAddIngredient}
            >
              <FiPlus className="text-orange-200/70 group-hover:text-orange-200 transition size-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Servings */}
      <div className="flex items-center gap-2 w-full justify-end -my-4">
        <span className="text-gray-300 text-sm">for</span>{" "}
        <input
          type="number"
          ref={servingsRef}
          className={`${inputClasses} w-[70px] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
          value={servings}
          onChange={(e) => setServings(e.target.value)}
        />{" "}
        <span className="text-gray-300 text-sm">servings</span>{" "}
        <span className="text-sm text-gray-500">(optional)</span>
      </div>

      {/* Preparation step */}
      <div className="flex flex-col gap-1 items-start">
        <div className={`${labelClasses} flex justify-between w-full`}>
          <span className="self-start flex items-center gap-1">
            <InfoTooltip>
              Enter one preparation step at a time, then press the{" "}
              <span className="text-orange-200 border border-gray-600 rounded-full size-2 px-1.5">
                +
              </span>{" "}
              button to add it.
            </InfoTooltip>
            Preparation steps
          </span>
          {steps.length > 0 && (
            <span className="text-sm self-end italic">
              {steps.length} step{steps.length > 1 && "s"}
            </span>
          )}
        </div>
        {steps.map((step, index) => {
          return (
            <div
              key={index}
              className="flex w-full justify-between items-start text-left px-5"
            >
              <span className="text-orange-100/80 text-sm">
                <span className="text-xs">{index + 1}.</span> {step}
              </span>
              <button
                type="button"
                className="rounded-full text-lg md:text-xl bg-opacity-30 active:scale-95 transition-all duration-300 ease-in-out text-gray-400 hover:text-gray-200"
                onClick={() => handleRemoveStep(index)}
              >
                <IoMdClose />
              </button>
            </div>
          );
        })}
        <div className="flex w-full gap-2 pt-0.5">
          <input
            type="text"
            ref={stepRef}
            placeholder="eg. Chop vegetables"
            className={inputClasses}
            value={step}
            onChange={(e) => setStep(e.target.value)}
            onKeyDown={handleStepKeyDown}
          />
          <button
            type="button"
            className="flex items-center border gap-2 border-gray-600 hover:border-gray-400 active:scale-[0.98] transition-all rounded-full max-w-max p-2.5 cursor-pointer select-none group self-end"
            onClick={handleAddStep}
          >
            <FiPlus className="text-orange-200/70 group-hover:text-orange-200 size-5 transition" />
          </button>
        </div>
      </div>

      <div className="border-t border-gray-800"></div>

      <div className="flex w-full flex-col sm:flex-row gap-7">
        {/* Preparation/total time */}
        <div className="flex flex-col gap-1 sm:w-1/2">
          <div className={`${labelClasses} flex justify-between w-full`}>
            <span className="self-start flex items-center gap-1">
              Total time{" "}
              <span className="text-sm text-gray-500">(optional)</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              ref={prepTimeRef}
              className={`${inputClasses} w-[70px] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
              value={prepTime}
              onChange={(e) => setPrepTime(e.target.value)}
            />
            <span className="text-gray-400 text-sm">min</span>
          </div>
        </div>

        {/* Serving size */}
        <div className="flex flex-col gap-1 sm:w-1/2">
          <div className={`${labelClasses} flex justify-between w-full`}>
            <span className="self-start flex items-center gap-1">
              Serving size
              <span className="text-sm text-gray-500">(optional)</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              ref={servingPortionRef}
              className={`${inputClasses} w-full max-w-[70px] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
              value={servingPortion}
              onChange={(e) => setServingPortion(e.target.value)}
            />
            <span className="text-gray-400 text-sm">g</span>
          </div>
        </div>
      </div>

      {/* Diet labels */}
      <div>
        <div className={`${labelClasses} flex justify-between w-full`}>
          <span className="self-start">
            Diet type <span className="text-sm text-gray-500">(optional)</span>
          </span>
          {diet.length > 0 && (
            <span className="text-sm self-end italic">
              {diet.length} selected
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2 px-3 pt-0.5 pb-0.5">
          {diet.map((label, index) => {
            return (
              <button
                type="button"
                key={index}
                className="flex max-w-max justify-between items-end text-left px-2 rounded-full gap-1 group"
                onClick={() => handleRemoveDiet(index)}
              >
                <span className="text-orange-100/70 group-hover:text-orange-100/85 text-sm transition capitalize">
                  {label}
                </span>
                <IoMdClose className="text-gray-400 size-4 group-hover:text-gray-300 transition" />
              </button>
            );
          })}
        </div>
        <div className="relative w-fit" ref={dietDropdownRef}>
          <button
            type="button"
            className="flex items-center border gap-2 border-gray-600 bg-gray-900 hover:border-gray-400 active:scale-[0.98] transition-all rounded-full px-5 py-2 mt-0.5 cursor-pointer select-none"
            onClick={() => setIsDietDropdownOpen((prev) => !prev)}
          >
            <span className="text-sm text-gray-300">Select</span>
            <MdKeyboardArrowDown className="size-4 text-gray-300" />
          </button>
          {isDietDropdownOpen && (
            <div className="absolute min-w-max gap-1 mt-1 flex flex-col z-10 bg-gray-950 border border-gray-600 rounded-3xl py-3 px-2">
              {DIET_OPTIONS.map((option) => {
                const isSelected = diet.includes(option);
                return (
                  <button
                    type="button"
                    key={option}
                    className={`flex items-center gap-3 pl-3 pr-9 py-1.5 rounded-xl ${isSelected ? "text-orange-100" : "text-gray-300"}`}
                    onClick={() =>
                      isSelected
                        ? setDiet((prev) => prev.filter((x) => x !== option))
                        : setDiet((prev) => [...prev, option])
                    }
                  >
                    <div>
                      {isSelected ? (
                        <RiCheckboxCircleLine className="size-5 text-green-700" />
                      ) : (
                        <RiCheckboxBlankCircleLine className="size-5 text-gray-600" />
                      )}
                    </div>{" "}
                    <span className="text-sm capitalize">{option}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {/* Recipe image */}
      <div className="flex flex-col gap-1">
        <div className={`${labelClasses} flex justify-between w-full`}>
          <span className="self-start">
            Recipe image{" "}
            <span className="text-sm text-gray-500">(optional)</span>
          </span>
        </div>
        {selectedImage && (
          <div className="relative w-fit">
            <img
              width="140px"
              src={URL.createObjectURL(selectedImage)}
              alt="Preview of uploaded image"
              className="rounded-lg shadow-lg py-0.5"
            />
            <button
              type="button"
              className="absolute p-1 right-1 top-1 rounded-full text-xl bg-opacity-70 
              hover:scale-110 transition bg-gray-600 active:scale-95 text-white"
              onClick={() => setSelectedImage(null)}
            >
              <IoMdClose />
            </button>
          </div>
        )}
        <label
          htmlFor="imageInput"
          className="flex items-center border w-fit gap-1.5 text-gray-300 border-gray-600 bg-gray-900 hover:border-gray-400 active:scale-[0.98] transition-all rounded-full px-5 py-2 cursor-pointer"
        >
          <span className="text-sm">Upload</span>
          <PiUploadSimpleLight className="size-4" />
          <input
            type="file"
            id="imageInput"
            className="hidden"
            onChange={handleImageUpload}
          />
        </label>
      </div>

      <div className="border-t border-gray-800"></div>

      {/* Nutrition */}
      <div className="flex flex-col gap-2">
        <div
          className={`${labelClasses} flex flex-col sm:flex-row gap-2 justify-between w-full`}
        >
          <span className="self-start">
            Nutrition <span className="text-sm text-gray-500">(optional)</span>
          </span>
          <div className="grid grid-cols-2 bg-gray-900 rounded-full max-w-[250px]">
            <button
              type="button"
              className={`text-sm rounded-full px-4 py-2 text-center ${isPer100g ? "bg-orange-200/80 text-gray-800" : "text-gray-400"} transition`}
              onClick={() => setIsPer100g(true)}
            >
              Per 100g
            </button>
            <button
              type="button"
              className={`text-sm rounded-full px-4 py-2 text-center ${!isPer100g ? "bg-orange-200/80 text-gray-800" : "text-gray-400"} transition`}
              onClick={() => setIsPer100g(false)}
            >
              Per serving
            </button>
          </div>
        </div>

        <div className="flex flex-col items-start gap-0.5">
          <span className="text-sm px-3 text-gray-300">Calories</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              className={`${inputClasses} w-full max-w-[110px] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
              value={nutrition[activeNutritionKey].calories}
              onChange={(e) =>
                handleNutritionChange("calories", e.target.value)
              }
            />
            <span className="text-sm text-gray-400">kcal</span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-6">
          <div className="flex flex-col items-start gap-0.5">
            <span className="text-sm px-3 text-gray-300">Fat</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                className={`${inputClasses} w-full max-w-[110px] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
                value={nutrition[activeNutritionKey].fat}
                onChange={(e) => handleNutritionChange("fat", e.target.value)}
              />
              <span className="text-sm text-gray-400">g</span>
            </div>
          </div>
          <div className="flex flex-col items-start gap-0.5">
            <span className="text-sm px-3 text-gray-300">Saturated fat</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                className={`${inputClasses} w-full max-w-[110px] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
                value={nutrition[activeNutritionKey].saturatedFat}
                onChange={(e) =>
                  handleNutritionChange("saturatedFat", e.target.value)
                }
              />
              <span className="text-sm text-gray-400">g</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-6">
          <div className="flex flex-col items-start gap-0.5">
            <span className="text-sm px-3 text-gray-300">Carbohydrates</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                className={`${inputClasses} w-full max-w-[110px] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
                value={nutrition[activeNutritionKey].carbohydrates}
                onChange={(e) =>
                  handleNutritionChange("carbohydrates", e.target.value)
                }
              />
              <span className="text-sm text-gray-400">g</span>
            </div>
          </div>
          <div className="flex flex-col items-start gap-0.5">
            <span className="text-sm px-3 text-gray-300">Sugar</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                className={`${inputClasses} w-full max-w-[110px] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
                value={nutrition[activeNutritionKey].sugar}
                onChange={(e) => handleNutritionChange("sugar", e.target.value)}
              />
              <span className="text-sm text-gray-400">g</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-start gap-0.5">
          <span className="text-sm px-3 text-gray-300">Protein</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              className={`${inputClasses} w-full max-w-[110px] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
              value={nutrition[activeNutritionKey].protein}
              onChange={(e) => handleNutritionChange("protein", e.target.value)}
            />
            <span className="text-sm text-gray-400">g</span>
          </div>
        </div>
        <div className="flex flex-col items-start gap-0.5">
          <span className="text-sm px-3 text-gray-300">Salt</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              className={`${inputClasses} w-full max-w-[110px] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
              value={nutrition[activeNutritionKey].sodium}
              onChange={(e) => handleNutritionChange("sodium", e.target.value)}
            />
            <span className="text-sm text-gray-400">g</span>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="mx-auto flex items-center justify-center px-8 py-2.5 min-w-[168px] border border-green-600 text-green-500 rounded-full hover:border-green-400 hover:text-green-400 active:scale-[0.98] transition"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ImSpinner2 className="animate-spin size-6" />
        ) : (
          "Create Recipe"
        )}
      </button>
    </form>
  );
}
