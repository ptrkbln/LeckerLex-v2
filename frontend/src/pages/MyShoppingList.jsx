import { useEffect, useState, useRef } from "react";
import { ImSpinner2 } from "react-icons/im";
import { FaShoppingBasket } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  RiCheckboxBlankCircleLine,
  RiCheckboxCircleLine,
} from "react-icons/ri";

function MyShoppingList() {
  const [showAddIngredient, setShowAddIngredient] = useState(false);
  const [shoppingList, setShoppingList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [purchasedItems, setPurchasedItems] = useState([]);
  const [newIngredient, setNewIngredient] = useState("");
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (showAddIngredient) inputRef.current?.focus();
  }, [showAddIngredient, shoppingList]);

  useEffect(() => {
    setIsLoading(true);
    const getShoppingList = async () => {
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

    getShoppingList();
  }, []);

  const saveShoppingList = async (updatedList) => {
    setIsSubmitting(true);
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
            shoppingList: updatedList,
            action: "replace",
          }),
        },
      );
      if (!response.ok) {
        toast.error("Something went wrong while updating your shopping list.");
      }
    } catch {
      toast.error("Something went wrong while updating your shopping list.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <ImSpinner2 className="animate-spin size-8 sm:size-10 text-orange-100" />
    );
  }

  /*   if (shoppingList.length === 0) {
    return (
      <div className="bg-gray-900/50 rounded-[70px] p-10 shadow-lg text-center max-w-lg">
        <div className="flex flex-col items-center justify-center text-center text-gray-100">
          <FaShoppingBasket className="size-12 text-orange-200 mb-4" />
          <h1 className="text-xl sm:text-3xl font-semibold mb-4">
            Your shopping list is empty
          </h1>
          <p className="sm:text-xl text-gray-300 max-w-md">
            Add ingredients manually or browse recipes for inspiration.
          </p>
          <button
            onClick={() => navigate("/home")}
            className="sm:text-lg mt-8 px-6 py-2.5 bg-green-500 hover:bg-green-600 rounded-full"
          >
            Discover Recipes
          </button>
        </div>
      </div>
    );
  } */

  const handleEnterKey = (e) => {
    if (e.key === "Enter") handleSaveNewIngredient();
  };

  // Toggle purchased status on item click
  const handleIngredientChoise = (name) => {
    setPurchasedItems((prev) =>
      prev.includes(name)
        ? prev.filter((item) => item !== name)
        : [...prev, name],
    );
  };

  // Mark all items as purchased
  const markAllAsPurchased = () => {
    setPurchasedItems(shoppingList.map((item) => item));
  };

  //// UPDATE THIS ONE
  // Save and remove all items
  const handleRemovePurchasedItems = () => {
    saveShoppingList([]); // Save an empty shopping list
    setShoppingList([]);
    setPurchasedItems([]);
  };

  const toggleAddIngredientClick = () => {
    setShowAddIngredient((prev) => !prev);
  };

  // Save new ingredient if not empty or already added
  const handleSaveNewIngredient = () => {
    const formattedIngredient = newIngredient.trim().toLowerCase();
    if (formattedIngredient === "") {
      toast.error("Enter an ingredient to add to your shopping list.");
      return;
    }
    if (shoppingList.includes(formattedIngredient)) {
      toast.error("This ingredient is already on your list.");
      return;
    }
    const updatedList = [...shoppingList, formattedIngredient];
    setShoppingList(updatedList);
    saveShoppingList(updatedList);
    setNewIngredient("");
  };

  return (
    <div className="flex flex-col my-2 w-full max-w-2xl border border-gray-800 bg-[#11151E] rounded-3xl shadow-2xl sm:p-10">
      <div className="w-full rounded-3xl p-6 sm:p-3">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 relative">
          <h1 className="text-3xl font-bold text-orange-200">Groceries</h1>
          <button
            className="bg-gray-700 text-white px-6 py-2.5 rounded-full hover:bg-gray-800 transition"
            onClick={toggleAddIngredientClick}
          >
            Add Ingredient
          </button>
          {showAddIngredient && (
            <div className="absolute sm:top-0 sm:right-0 z-10 w-2/3 sm:w-[42.5%] bg-[#11151E]">
              <input
                type="text"
                value={newIngredient}
                placeholder="Bread, Milk, Eggs..."
                onChange={(e) => setNewIngredient(e.target.value)}
                onKeyDown={(e) => handleEnterKey(e)}
                ref={inputRef}
                className="border text-sm sm:text-base border-gray-300 p-3 bg-orange-50 placeholder:pl-2 rounded-full mb-2.5 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
              />

              <div className="flex justify-center sm:justify-end gap-2.5">
                <button
                  className="bg-green-500 text-white py-2 rounded-full hover:bg-green-600 w-full sm:w-[85px] transition"
                  onClick={handleSaveNewIngredient}
                  disabled={isSubmitting}
                >
                  Add
                </button>

                <button
                  className="bg-gray-500 text-white py-2  rounded-full hover:bg-gray-600 w-full sm:w-[85px] transition"
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
            <ul className="my-8 sm:my-12">
              {shoppingList.map((item, index) => (
                <li
                  key={index}
                  className="flex items-center gap-4 px-4 pt-4 pb-1 border-b border-green-500/15 cursor-pointer"
                  onClick={() => handleIngredientChoise(item)}
                >
                  {purchasedItems.includes(item) ? (
                    <RiCheckboxCircleLine className="size-5 text-green-800" />
                  ) : (
                    <RiCheckboxBlankCircleLine className="size-5 text-gray-700" />
                  )}
                  <span
                    className={`tracking-wider transition-all capitalize ${purchasedItems.includes(item) ? "line-through  text-slate-300/50 scale-[0.98]" : "text-orange-100/95 font-semibold"}`}
                  >
                    {item}
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

            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-5 sm:mb-3">
              <button
                className="bg-orange-400 text-white px-6 py-2 rounded-full hover:bg-orange-500 transition"
                onClick={markAllAsPurchased}
              >
                Select all
              </button>

              {purchasedItems.length > 0 && (
                <button
                  onClick={handleRemovePurchasedItems}
                  className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition"
                  disabled={isSubmitting}
                >
                  Remove Purchased Items
                </button>
              )}
            </div>
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
  );
}

export default MyShoppingList;
