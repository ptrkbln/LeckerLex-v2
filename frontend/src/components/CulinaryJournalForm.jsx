import { useState } from "react";
import { FaUpload } from "react-icons/fa";

export default function CulinaryJournalForm({ recipeName, recipeId }) {
  const [notes, setNotes] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedImage(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedImage) {
      setErrorMessage("Please select an image to upload.");
      setTimeout(() => {
        setErrorMessage("");
      }, 5000);

      return;
    }
    if (notes.length < 5 || notes.length > 150) {
      setErrorMessage("Your notes must be between 5 and 150 characters long.");
      setTimeout(() => {
        setErrorMessage("");
      }, 5000);
      return;
    }

    const formData = new FormData();
    formData.append("imageUrl", selectedImage);
    formData.append("notes", notes);
    formData.append("recipeName", recipeName);
    formData.append("recipeId", recipeId);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/journal`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        },
      );
      if (!response.ok) {
        console.log("Error while creating journal entry.", response);
        setErrorMessage(
          "Something went wrong while saving your journal entry. Please try again.",
        );
        setTimeout(() => {
          setErrorMessage("");
        }, 5000);
        return;
      }
      setIsSubmitted(true);
    } catch (error) {
      console.log("Error while creating journal entry:", error);
      setErrorMessage("Network error. Please try again later.");
      setTimeout(() => {
        setErrorMessage("");
      }, 5000);
    }
  };
  return (
    <div className="flex-grow flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-900 p-8 shadow-lg rounded-3xl">
        <form onSubmit={handleSubmit}>
          <h2 className="text-2xl font-bold text-center mb-6">
            Dish complete? Add to journal!
          </h2>

          {/* Image Upload */}
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">
              Show Off Your Dish!
            </label>
            <div className="flex flex-col items-center">
              <label
                htmlFor="imageInput"
                className="w-full max-w-md bg-gray-700 border border-gray-600 rounded-3xl p-4 text-center cursor-pointer hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
              >
                <FaUpload />
                Upload Image
              </label>
              <input
                type="file"
                id="imageInput"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
            {selectedImage && (
              <div className="mt-4 flex justify-center">
                <img
                  width="250px"
                  src={URL.createObjectURL(selectedImage)}
                  alt="Preview of uploaded image"
                  className="rounded-lg shadow-lg"
                />
              </div>
            )}
          </div>

          {/* Notes Section */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              How Did It Turn Out?
            </label>
            <textarea
              rows="5"
              value={notes}
              placeholder="Share your thoughts..."
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-3xl focus:outline-none focus:ring focus:ring-indigo-500 font-playpen tracking-wide placeholder:font-sans"
            />
            {errorMessage && (
              <div className="block mx-auto text-center text-md text-red-600 font-bold px-4 py-1 rounded-3xl shadow-lg">
                {errorMessage}
              </div>
            )}
          </div>

          {/* Submit Button */}
          {isSubmitted ? (
            <div className="block mx-auto text-center text-md text-white px-4 py-2 rounded-3xl shadow-lg mt-10">
              Saved to your culinary journal!
            </div>
          ) : (
            <button
              type="submit"
              className="w-full px-4 py-2 mb-3 text-md bg-green-500 text-white rounded-full hover:bg-green-600 transition duration-300"
            >
              Add To My Culinary Journal
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
