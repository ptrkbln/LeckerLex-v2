import { useEffect, useState } from "react";
import { FaCameraRetro } from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im";
import toast from "react-hot-toast";

export default function CulinaryJournalForm({ recipeName, recipeId }) {
  const [notes, setNotes] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [fileKey, setFileKey] = useState(0); // Used to reset the file input after submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const allowedImageTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
  ];

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

  // Clear error messages when all inputs become valid
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
    if (isSubmitting) return; // Prevent duplicate submission while upload in progress
    if (!selectedImage) {
      setErrorMessage("Add a photo to save this journal entry.");
      return;
    }
    if (notes.length < 5 || notes.length > 150) {
      setErrorMessage("Tell us how it turned out in 5-150 characters.");
      return;
    }
    setIsSubmitting(true);

    // Build multipart form for image upload (req.file) and journal entry data (req.body)
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
      // Reset form after successful submission
      setNotes("");
      setSelectedImage(null);
      setErrorMessage("");
      // Reset file input after submission to allow re-uploading the same image after form submission
      setFileKey((prev) => prev + 1);
    } catch {
      toast.error("Connection failed.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="bg-gray-900 p-6 shadow-lg rounded-3xl w-full h-full">
      <form onSubmit={handleSubmit}>
        <h2 className="text-xl font-semibold mb-6">Recipe Journal</h2>
        <div className="mb-4">
          <div className="flex flex-col items-center text-gray-400 hover:text-gray-300 transition-all">
            <label
              htmlFor="imageInput"
              className="w-full max-w-md border border-gray-600 rounded-3xl p-3 text-center cursor-pointer hover:border-gray-400 transition-all flex items-center justify-center active:scale-95 gap-2"
            >
              <FaCameraRetro className="size-5" />
              Upload your dish
            </label>
            <input
              type="file"
              id="imageInput"
              key={fileKey}
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
        <textarea
          rows="4"
          value={notes}
          placeholder="How did it turn out?"
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-4 py-2 flex max-w-md mx-auto border border-gray-600 bg-gray-800 rounded-3xl focus:outline-none focus:ring-1 focus:ring-gray-400 resize-none font-playpen tracking-wide placeholder:font-sans placeholder:italic"
        />
        <div className={`min-h-[40px] flex justify-center items-center`}>
          {errorMessage && (
            <p className="text-rose-400 text-center text-sm">{errorMessage}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full max-w-md mx-auto flex justify-center items-center px-4 py-2 mt-1.5 text-md border border-green-600 text-green-600 rounded-3xl shadow-lg hover:border-green-400 hover:text-green-400 active:scale-95 transition"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ImSpinner2 className="animate-spin size-6" />
          ) : (
            "Save to Journal"
          )}
        </button>
      </form>
    </div>
  );
}
