import React, { useState, useEffect } from "react";

export default function MyCulinaryJournal() {
  const [journalEntries, setJournalEntries] = useState("");
  const [loading, setLoading] = useState(false);
  const [isJournalLoaded, setIsJournalLoaded] = useState(false);
  const [error, setError] = useState("");

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
          onClick={() => (window.location.href = "/home")}
          className="px-4 py-2 mt-10 bg-green-500 hover:bg-green-600 transition-colors rounded-full shadow text-sm sm:text-md"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-10">
      <h1 className="text-3xl font-bold mb-10 text-orange-200 pb-3">
        Culinary Snapshots
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {journalEntries &&
          journalEntries.map((entry, index) => {
            const delay = index * 80; // delay for smooth effect
            return (
              <figure
                key={entry._id}
                style={{ transitionDelay: `${delay}ms` }}
                className={`bg-white flex flex-col justify-between h-full p-4 pb-10 shadow-lg rounded-lg w-80 mx-auto ${
                  index % 2 === 0 ? "rotate-[-3deg]" : "rotate-[3deg]"
                } border border-gray-300 font-playpen shadow-[5px_5px_10px_rgba(255,255,255,0.3)] tracking-wide text-gray-700 transition-opacity duration-700 ease-in-out
                ${isJournalLoaded ? "opacity-100" : "opacity-0"}`}
              >
                <img
                  className="w-full h-auto rounded-md shadow-md"
                  src={entry.imageUrl}
                  alt="Cooked Dish"
                />
                <figcaption className="mt-4 text-center text-gray-800 font-semibold">
                  {entry.recipeName}
                  <p className="text-gray-600 text-center mt-2 px-4 font-normal">
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
