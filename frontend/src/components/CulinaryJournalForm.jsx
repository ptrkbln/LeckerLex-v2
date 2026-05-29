import { useEffect, useState } from "react";
import { FaUpload } from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im";
import toast from "react-hot-toast";

export default function CulinaryJournalForm({ recipeName, recipeId }) {
  const [notes, setNotes] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedImage(file);
    setErrorMessage("");
  };

  useEffect(() => {
    if (
      selectedImage &&
      notes.length >= 5 &&
      notes.length <= 150 &&
      errorMessage
    )
      setErrorMessage("");
  }, [selectedImage, notes, errorMessage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!selectedImage) {
      setErrorMessage("Add a photo to save this journal entry.");
      return;
    }
    if (notes.length < 5 || notes.length > 150) {
      setErrorMessage("Tell us how it turned out in 5-150 characters.");
      return;
    }
    setIsSubmitting(true);

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
        toast.error("Something went wrong while saving your journal entry.");
        return;
      }
      toast.success("Saved to Culinary Journal!");
      setNotes("");
      setSelectedImage(null);
      setErrorMessage("");
    } catch {
      toast.error("Connection failed.");
    } finally {
      setIsSubmitting(false);
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
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            How Did It Turn Out?
          </label>
          <textarea
            rows="5"
            value={notes}
            placeholder="Share your thoughts..."
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-3xl focus:outline-none focus:ring focus:ring-orange-100 resize-none font-playpen tracking-wide placeholder:font-sans"
          />
          <div className="min-h-[40px] flex justify-center items-center">
            {errorMessage && (
              <p className="text-rose-400 text-center text-sm">
                {errorMessage}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full flex justify-center items-center px-4 py-2 mt-1.5 text-md bg-green-500 text-white rounded-3xl shadow-lg hover:bg-green-700 transition duration-300"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ImSpinner2 className="animate-spin size-6" />
            ) : (
              "Save Journal Entry"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
