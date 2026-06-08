import { useEffect, useState } from "react";
import { ImSpinner2 } from "react-icons/im";
import { FaShoppingBasket } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function MyShoppingList() {
  const [showSaveButton, setShowSaveButton] = useState(false);
  const [showAddIngredient, setShowAddIngredient] = useState(false);
  const [shoppingList, setShoppingList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [purchasedItems, setPurchasedItems] = useState([]);
  const [newIngredient, setNewIngredient] = useState("");
  const navigate = useNavigate();

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

  // Save the updated shopping list to the backend
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
      setShowSaveButton(false);
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

  // Toggle purchased status on item click
  const handleIngredientChoise = (name) => {
    setPurchasedItems((prev) =>
      prev.includes(name)
        ? prev.filter((item) => item !== name)
        : [...prev, name],
    );
    setShowSaveButton(true);
  };

  // Mark all items as purchased
  const markAllAsPurchased = () => {
    setPurchasedItems(shoppingList.map((item) => item));
    setShowSaveButton(true);
  };

  // Save and remove all items
  const handleSaveAndRemoveAll = () => {
    saveShoppingList([]); // Save an empty shopping list
    setShoppingList([]);
    setPurchasedItems([]);
    setShowSaveButton(false);
  };

  const handleAddIngredientClick = () => {
    setShowAddIngredient(true);
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
    setShowAddIngredient(false);
  };

  return (
    <div className="flex flex-col items-center justify-center py-10">
      {shoppingList.length > 0 ? (
        <h1 className="text-3xl font-bold mb-10 text-orange-200 pb-3">
          Shop Smart, Stay Organized
        </h1>
      ) : (
        <div className="flex flex-col items-center justify-center text-center text-gray-100">
          <FaShoppingBasket className="size-12 text-orange-200 mb-4" />
          <h1 className="text-3xl font-bold mb-10 text-orange-200 pb-3">
            Your shopping list is empty
          </h1>
        </div>
      )}
      <div
        className="p-8 m-auto w-full border border-gray-800 rounded-3xl shadow-lg"
        style={{ background: "#11151E" }}
      >
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 relative">
          {shoppingList.length > 0 && (
            <button
              className="bg-green-500 text-gray-50 px-6 py-2 rounded-full hover:bg-green-600 hover:shadow-xl transition duration-300 mb-4 sm:mb-0"
              onClick={markAllAsPurchased}
            >
              Mark All as Purchased
            </button>
          )}
          <button
            className="bg-blue-500 text-gray-50 px-6 py-2 rounded-full hover:bg-blue-600 hover:shadow-xl transition duration-300"
            onClick={handleAddIngredientClick}
          >
            Add an Ingredient
          </button>

          {/* Add Ingredient Modal */}
          {showAddIngredient && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
              <div className="bg-orange-50 p-6 rounded-3xl shadow-lg w-80">
                <input
                  type="text"
                  value={newIngredient}
                  placeholder="Add an Ingredient..."
                  onChange={(e) => setNewIngredient(e.target.value)}
                  className="border border-gray-300 p-2 rounded mb-4 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition"
                    onClick={handleSaveNewIngredient}
                    disabled={isSubmitting}
                  >
                    Save
                  </button>
                  <button
                    className="bg-gray-500 text-white px-4 py-2 rounded-full hover:bg-gray-600 transition"
                    onClick={() => setShowAddIngredient(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Shopping List Items */}
        {shoppingList.length > 0 ? (
          <ul className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {shoppingList.map((item, index) => (
              <li
                key={index}
                onClick={() => handleIngredientChoise(item)}
                className={`flex flex-col sm:flex-row justify-between items-center p-4 border rounded-3xl transition-transform transform hover:scale-105 hover:shadow-md cursor-pointer ${
                  purchasedItems.includes(item)
                    ? "line-through text-gray-500 bg-gray-200"
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center mb-2 sm:mb-0">
                  <span className="font-semibold capitalize">{item}</span>
                </div>
                <span className="text-sm text-gray-700">
                  {/* If available, display amount and unit */}
                  {item.amount ? `${item.amount} ${item.unit}` : ""}
                </span>
              </li>
            ))}
            {showSaveButton && (
              <button
                onClick={handleSaveAndRemoveAll}
                className="bg-green-600 text-white px-6 py-3 rounded-full hover:bg-green-700 shadow-md transition inline-block mt-4"
                disabled={isSubmitting}
              >
                Remove all and save
              </button>
            )}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center text-center text-gray-100">
            <p className="sm:text-xl text-gray-300">
              Add ingredients manually or browse recipes for inspiration.
            </p>
            <button
              onClick={() => navigate("/home")}
              className="sm:text-lg mt-8 px-6 py-2.5 bg-green-500 hover:bg-green-600 rounded-full"
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
