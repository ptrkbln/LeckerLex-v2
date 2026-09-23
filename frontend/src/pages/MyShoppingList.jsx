import { useEffect, useState, useRef } from "react";
import { ImSpinner2 } from "react-icons/im";
import { FaShoppingBasket } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  RiCheckboxBlankCircleLine,
  RiCheckboxCircleLine,
  RiCheckboxBlankCircleFill,
} from "react-icons/ri";

function MyShoppingList() {
  const [showAddIngredient, setShowAddIngredient] = useState(false);
  const [shoppingList, setShoppingList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newIngredient, setNewIngredient] = useState("");
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const isAnyCompleted = shoppingList.some((item) => item.completed);

  useEffect(() => {
    if (showAddIngredient) inputRef.current?.focus();
  }, [showAddIngredient, shoppingList]);

  useEffect(() => {
    setIsLoading(true);
    const getShoppingListDatabase = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/users/shoppinglist`,
          {
            credentials: "include",
          },
        );

        if (!response.ok) {
          toast.error("Unable to read your shopping list at this moment.");
          return;
        }

        const shoppingListItems = await response.json();

        if (shoppingListItems.data.length > 0) {
          setShoppingList(shoppingListItems.data);
        }
      } catch {
        toast.error("Unable to read your shopping list at this moment.");
      } finally {
        setIsLoading(false);
      }
    };

    getShoppingListDatabase();
  }, []);

  const updateShoppingListDatabase = async (updatedList) => {
    setIsSubmitting(true);
    // Ensure ingredient names are stored in a consistent format
    const formattedList = updatedList.map((item) => ({
      ...item,
      ingredient: item.ingredient.trim().toLowerCase(),
    }));

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/users/update-shoppinglist`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            shoppingList: formattedList,
            action: "replace",
          }),
        },
      );
      if (!response.ok) {
        throw new Error("Failed to update shopping list.");
      }
    } catch (error) {
      toast.error("Something went wrong while updating your shopping list.");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="self-stretch w-full flex items-center justify-center">
        <ImSpinner2 className="animate-spin size-8 sm:size-10 text-orange-100" />
      </div>
    );
  }

  const handleEnterKey = (e) => {
    if (e.key === "Enter") handleAddNewIngredient();
  };

  // Toggle completed status on item click
  const handleToggleIngredientCompleted = async (ingr) => {
    // Save the current state in case the database update fails
    const previousList = shoppingList;

    const updatedList = shoppingList.map((item) =>
      item.ingredient === ingr.ingredient
        ? { ...item, completed: !item.completed }
        : item,
    );

    setShoppingList(updatedList);

    try {
      await updateShoppingListDatabase(updatedList);
    } catch {
      setShoppingList(previousList);
    }
  };

  const areAllCompleted =
    shoppingList.length > 0 && shoppingList.every((item) => item.completed);

  const handleToggleAllCompleted = async () => {
    // Save the current state in case the database update fails
    const previousList = shoppingList;

    const updatedList = areAllCompleted
      ? shoppingList.map((item) => ({ ...item, completed: false }))
      : shoppingList.map((item) => ({ ...item, completed: true }));

    setShoppingList(updatedList);

    try {
      await updateShoppingListDatabase(updatedList);
    } catch {
      setShoppingList(previousList);
    }
  };

  const handleRemoveCompletedItems = async () => {
    // Save the current state in case the database update fails
    const previousList = shoppingList;

    const updatedList = shoppingList.filter((item) => item.completed === false);

    setShoppingList(updatedList);
    try {
      await updateShoppingListDatabase(updatedList);
    } catch {
      setShoppingList(previousList);
    }
  };

  // Save new ingredient if not empty or already added
  const handleAddNewIngredient = async () => {
    // Save the current state in case the database update fails
    const previousList = shoppingList;

    const formattedIngredient = newIngredient.trim().toLowerCase();
    if (formattedIngredient === "") {
      toast.error("Enter an ingredient to add to your shopping list.");
      return;
    }
    if (shoppingList.some((item) => item.ingredient === formattedIngredient)) {
      toast.error("This ingredient is already on your list.");
      return;
    }
    const updatedList = [
      ...shoppingList,
      { ingredient: formattedIngredient, completed: false },
    ];

    setShoppingList(updatedList);

    try {
      await updateShoppingListDatabase(updatedList);
      setNewIngredient("");
    } catch {
      setShoppingList(previousList);
    }
  };

  return (
    <div className="self-stretch w-full flex items-center justify-center">
      <div className="flex flex-col my-2 w-full max-w-2xl border border-gray-800 bg-[#11151E] rounded-3xl shadow-2xl sm:p-10">
        <div className="w-full rounded-3xl p-6 sm:p-3">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 relative">
            <h1 className="text-3xl font-bold text-orange-200 tracking-wide">
              Groceries
            </h1>
            <button
              className={`border-green-400/60 text-green-300/80 hover:text-green-300 hover:border-green-400 px-6 py-2 rounded-full border min-w-[180px] ${showAddIngredient ? "invisible" : ""} transition`}
              onClick={() => setShowAddIngredient((prev) => !prev)}
            >
              Add Ingredient
            </button>
            {showAddIngredient && (
              <div className="absolute top-1 sm:top-0 sm:right-0 z-10 w-2/3 max-w-64 sm:w-[42.5%] bg-[#11151E]">
                <input
                  type="text"
                  value={newIngredient}
                  placeholder="Enter ingredient..."
                  onChange={(e) => setNewIngredient(e.target.value)}
                  onKeyDown={(e) => handleEnterKey(e)}
                  ref={inputRef}
                  className="bg-slate-800/50 border border-gray-600 text-gray-100 placeholder:text-gray-400 p-3 placeholder:pl-2 rounded-full mb-1.5 w-full focus:outline-none"
                />

                <div className="flex justify-center sm:justify-end gap-2.5">
                  <button
                    className="border border-green-400/60 text-green-300/80 hover:text-green-300 hover:border-green-400 py-1.5 rounded-full w-full transition"
                    onClick={handleAddNewIngredient}
                    disabled={isSubmitting}
                  >
                    Add
                  </button>

                  <button
                    className="border border-gray-400/60 text-gray-300/80 hover:text-gray-300 hover:border-gray-300 py-1.5 rounded-full w-full transition"
                    onClick={() => setShowAddIngredient(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>

          {shoppingList.length > 0 ? (
            <>
              <ul className="pb-4 pt-6">
                <div className="flex flex-col-reverse sm:flex-row justify-between items-start sm:items-end min-h-[92px]">
                  <button
                    className="flex items-center pl-4 pr-6 py-2.5 border border-gray-400 rounded-full gap-3 sm:gap-6 min-w-[180px] hover:border-gray-300 text-gray-400 hover:text-gray-300 transition"
                    onClick={handleToggleAllCompleted}
                  >
                    {areAllCompleted ? (
                      <RiCheckboxBlankCircleFill className="size-5 text-green-800" />
                    ) : (
                      <RiCheckboxBlankCircleLine className="size-5 text-gray-700" />
                    )}
                    <span className="tracking-widest text-xs">
                      {areAllCompleted ? "DESELECT ALL" : "SELECT ALL"}
                    </span>
                  </button>

                  {isAnyCompleted && (
                    <button
                      onClick={handleRemoveCompletedItems}
                      className="border border-rose-400/40 text-rose-300/80 hover:border-rose-400/70 hover:text-rose-300 px-6 py-2 rounded-full transition min-w-[180px]"
                    >
                      Remove Selected
                    </button>
                  )}
                </div>

                {shoppingList.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-4 sm:gap-7 px-4 pt-4 pb-1 border-b border-green-500/15 cursor-pointer"
                    onClick={() => handleToggleIngredientCompleted(item)}
                  >
                    {item.completed ? (
                      <RiCheckboxCircleLine className="size-5 text-green-800" />
                    ) : (
                      <RiCheckboxBlankCircleLine className="size-5 text-gray-700" />
                    )}
                    <span
                      className={`tracking-wider transition-all capitalize ${item.completed ? "line-through  text-slate-300/50 scale-[0.98]" : "text-orange-100/95 font-semibold"}`}
                    >
                      {item.ingredient}
                    </span>
                  </li>
                ))}

                {/* Placeholder rows */}
                {Array.from({ length: 7 - shoppingList.length }).map((_, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-4 px-4 pt-4 pb-1 border-b border-green-500/15"
                  >
                    <RiCheckboxBlankCircleLine className="size-5 text-gray-800/30" />
                    <span className="invisible">placeholder</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="flex flex-col items-center text-center p-4 pt-6 sm:pt-8">
              <FaShoppingBasket className="size-10 sm:size-12 text-orange-200 mb-4 sm:mb-3" />

              <h2 className="text-xl sm:text-2xl font-bold mb-3 text-gray-300">
                Your shopping list is empty
              </h2>

              <p className="text-gray-400 max-w-md mb-10">
                Add ingredients manually or browse recipes for inspiration.
              </p>

              <button
                onClick={() => navigate("/home")}
                className="px-6 py-2.5 bg-green-500 text-white hover:bg-green-600 rounded-full transition"
              >
                Discover Recipes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyShoppingList;
