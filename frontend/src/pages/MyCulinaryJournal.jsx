import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoMdClose } from "react-icons/io";

export default function MyCulinaryJournal() {
  const [journalEntries, setJournalEntries] = useState("");
  const [loading, setLoading] = useState(false);
  const [isJournalLoaded, setIsJournalLoaded] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // get request on mount (empty dependency array)
  useEffect(() => {
    setLoading(true);
    const getJournalHistory = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/journal/history`,
          {
            credentials: "include",
          }
        );

        if (response.status === 204) {
          setError(
            "Your journal awaits 📷 \n\nCook something delicious and share your experience!"
          );
          return;
        }

        const result = await response.json();

        if (result.length > 0) setJournalEntries(result);

        setTimeout(() => {
          setIsJournalLoaded(true);
        }, 100);
      } catch (error) {
        console.log(error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    getJournalHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center">
        <p className="sm:text-xl text-center font-bold text-gray-300">
          Reading through your journal...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center text-gray-50">
        <p className="sm:text-2xl text-center  whitespace-pre-line">{error}</p>
        <button
          onClick={() => navigate("/home")}
          className="px-4 py-2 mt-10 bg-green-500 hover:bg-green-600 transition-colors rounded-full shadow text-sm sm:text-md"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const handleClick = async (journalEntryId) => {
    try {
      const prevEntries = journalEntries;

      // Remove the entry from the state to update the UI
      setJournalEntries(
        journalEntries.filter((entry) => entry._id !== journalEntryId)
      );

      // Remove the entry from database
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/journal/delete-post/${journalEntryId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
    } catch (error) {
      setJournalEntries(prevEntries);
      console.log("Error deleting journal entry:", error);
      setError("Failed to delete journal entry. Please try again later.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-10">
      <h1 className="text-3xl font-bold mb-10 text-orange-200 pb-3">
        Culinary Snapshots
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {journalEntries &&
          journalEntries.map((entry, index) => {
            const delay = index * 80;
            return (
              <figure
                key={entry._id}
                style={{ transitionDelay: `${delay}ms` }}
                className={`bg-white group relative flex flex-col items-center p-4 shadow-lg rounded-lg
            w-72 md:w-80 mx-auto pb-12 border border-gray-300 font-playpen
            ${index % 2 === 0 ? "rotate-[-3deg]" : "rotate-[3deg]"}
            shadow-[5px_5px_10px_rgba(255,255,255,0.3)] tracking-wide text-gray-700 transition-opacity duration-700 ease-in-out
            ${isJournalLoaded ? "opacity-100" : "opacity-0"}`}
              >
                <button
                  className="absolute p-1 right-4 top-4 rounded-full text-lg md:text-xl bg-opacity-30 
              lg:opacity-0 lg:group-hover:opacity-100 lg:hover:bg-opacity-50 transition-all duration-300 ease-in-out 
              bg-black text-white z-10"
                  onClick={() => handleClick(entry._id)}
                >
                  <IoMdClose />
                </button>

                {/* Image Container (Fixed Square) */}
                <div className="w-64 h-64 md:w-72 md:h-72 overflow-hidden rounded-md shadow-md">
                  <img
                    className="w-full h-full object-cover"
                    src={entry.imageUrl}
                    alt="Cooked Dish"
                  />
                </div>

                {/* Caption Area - Simulating Polaroid Style */}
                <figcaption className="mt-4 text-center text-gray-800 font-semibold w-full px-4">
                  {entry.recipeName}
                  <p className="text-gray-600 text-center mt-2 text-sm font-normal">
                    {entry.notes}
                  </p>
                </figcaption>
              </figure>
            );
          })}
      </div>
    </div>
  );
}
