import { useState, useRef, useEffect } from "react";
import { ImSpinner2 } from "react-icons/im";
import {
  RiCheckboxBlankCircleLine,
  RiCheckboxCircleLine,
} from "react-icons/ri";
import { FiPlus } from "react-icons/fi";
import { MdKeyboardArrowDown } from "react-icons/md";
import { FaCameraRetro } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import toast from "react-hot-toast";
import { InfoTooltip } from "./InfoTooltip";
import { PiUploadSimpleLight } from "react-icons/pi";

const DIET_OPTIONS = ["vegetarian", "vegan", "dairy-free", "gluten-free"];
const inputClasses =
  "w-full pl-4 py-2 border border-gray-600 bg-gray-900 text-gray-200 rounded-3xl focus:outline-none focus:ring-1 focus:ring-emerald-600 placeholder:italic placeholder:text-sm transition";
const labelClasses = "px-3 text-gray-300";
const allowedImageTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

export default function CreateRecipeForm() {
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
    setErrorMessage("");
    if (!ingrAmount || !ingrName.trim() || !ingrUnit.trim()) {
      setErrorMessage("Your ingredient is missing some details.");
      return;
    }
    if (
      ingredients.some((ingr) => ingr.name === ingrName.trim().toLowerCase())
    ) {
      setErrorMessage("You already added this ingredient.");
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
    setErrorMessage("");
    if (!step.trim()) {
      setErrorMessage("Add some instructions first.");
      return;
    }
    if (
      steps.some(
        (existingStep) =>
          existingStep.toLowerCase() === step.trim().toLowerCase(),
      )
    ) {
      setErrorMessage("You already added this step.");
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
      setErrorMessage("Only JPG, PNG, WEBP and AVIF images allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Image must be under 5 MB.");
      return;
    }
    setSelectedImage(file);
    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    if (ingredients.length === 0) {
      setErrorMessage("Add some ingredients first.");
      return;
    }
    if (steps.lenght === 0) {
      setErrorMessage("Add some instructions first.");
      return;
    }
    // form
  };

  const [recipeName, setRecipeName] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [ingrName, setIngrName] = useState("");
  const [ingrAmount, setIngrAmount] = useState("");
  const [ingrUnit, setIngrUnit] = useState("");
  const [steps, setSteps] = useState([]);
  const [step, setStep] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [servings, setServings] = useState("");
  const [diet, setDiet] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // Prevent multiple form submissions while request is in progress
  const [isDietDropdownOpen, setIsDietDropdownOpen] = useState(false);
  const dietDropdownRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);

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
            type="text"
            placeholder="eg. Mushroom pasta"
            className={inputClasses}
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

      <div className="flex w-full flex-col sm:flex-row gap-7">
        {/* Preparation time */}
        <div className="flex flex-col gap-1 w-1/2">
          <div className={`${labelClasses} flex justify-between w-full`}>
            <span className="self-start flex items-center gap-1">
              Preparation time{" "}
              <span className="text-sm text-gray-500">(optional)</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Amount"
              className={`${inputClasses} w-full max-w-[104px] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
              value={prepTime}
              onChange={(e) => setPrepTime(e.target.value)}
            />
            <span className="text-gray-400 text-sm">minutes</span>
          </div>
        </div>

        {/* Servings */}
        <div className="flex flex-col gap-1 w-1/2">
          <div className={`${labelClasses} flex justify-between w-full`}>
            <span className="self-start flex items-center gap-1">
              Servings
              <span className="text-sm text-gray-500">(optional)</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Amount"
              className={`${inputClasses} w-full max-w-[104px] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
              value={servings}
              onChange={(e) => setServings(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Diet labels */}
      <div>
        <div className={`${labelClasses} flex justify-between w-full`}>
          <span className="self-start">
            Diet <span className="text-sm text-gray-500">(optional)</span>
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

      <div className="flex flex-col gap-1">
        <div className={`${labelClasses} flex justify-between w-full`}>
          <span className="self-start">
            Recipe image{" "}
            <span className="text-sm text-gray-500">(optional)</span>
          </span>
        </div>
        {selectedImage && (
          <img
            width="140px"
            src={URL.createObjectURL(selectedImage)}
            alt="Preview of uploaded image"
            className="rounded-lg shadow-lg py-0.5"
          />
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

      <div className="flex flex-col gap-2">
        {/* Error messages */}
        <div className="min-h-[20px] flex justify-center items-center">
          {errorMessage && (
            <p className="text-rose-400 text-center text-sm">{errorMessage}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full max-w-md mx-auto flex justify-center items-center px-4 py-2 text-md border border-green-600 text-green-600 rounded-3xl shadow-lg hover:border-green-400 hover:text-green-400 active:scale-95 transition"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ImSpinner2 className="animate-spin size-6" />
          ) : (
            "Create Recipe"
          )}
        </button>
      </div>
    </form>
  );
}
