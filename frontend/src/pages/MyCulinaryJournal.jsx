import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoMdClose } from "react-icons/io";
import { ImSpinner2 } from "react-icons/im";
import { FaBookOpen } from "react-icons/fa";
import toast from "react-hot-toast";

export default function MyCulinaryJournal() {
  const [journalEntries, setJournalEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isJournalLoaded, setIsJournalLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteEntryModal, setShowDeleteEntryModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    const getJournalHistory = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/journal/history`,
          {
            credentials: "include",
          },
        );

        if (!response.ok) {
          toast.error("Unable to read your journal entries at this moment.");
          return;
        }

        const journalData = await response.json();

        if (journalData.data.length > 0) {
          setJournalEntries(journalData.data);
          // Triggers journal cards staggered fade-in animation
          setTimeout(() => {
            setIsJournalLoaded(true);
          }, 100);
        }
      } catch {
        toast.error("Unable to read your journal entries at this moment.");
      } finally {
        setIsLoading(false);
      }
    };

    getJournalHistory();
  }, []);

  if (isLoading) {
    return (
      <ImSpinner2 className="animate-spin size-8 sm:size-10 text-orange-100" />
    );
  }

  if (journalEntries.length === 0) {
    return (
      <div className="bg-gray-900/50 rounded-[70px] p-10 shadow-lg text-center max-w-lg">
        <div className="flex flex-col items-center justify-center text-center text-gray-100">
          <FaBookOpen className="size-12 text-orange-200 mb-4" />
          <h1 className="text-xl sm:text-3xl font-semibold mb-4">
            Your journal awaits
          </h1>
          <p className="sm:text-xl text-gray-300 max-w-md">
            Cook something delicious and share your experience!
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
  }

  // Open confirmation modal when deleting a selected journal entry
  const handleShowDeleteEntryModal = (journalEntry) => {
    setSelectedEntry(journalEntry);
    setShowDeleteEntryModal(true);
  };

  // Remove entry from UI & database, restore UI if deletion from database fails
  const handleDeleteJournalEntry = async (journalEntry) => {
    if (isSubmitting) return;

    setShowDeleteEntryModal(false);
    setIsSubmitting(true);
    const prevEntries = journalEntries; // Store current entries so UI can be restored if delete request fails

    try {
      setJournalEntries(
        journalEntries.filter((entry) => entry._id !== journalEntry._id),
      );

      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/journal/delete-post/${journalEntry._id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        },
      );

      if (!response.ok) {
        setJournalEntries(prevEntries); // Restore removed entry if delete request fails
        toast.error("Something went wrong while deleting your journal entry.");
      }
    } catch {
      setJournalEntries(prevEntries); // Restore removed entry if delete request fails
      toast.error("Couldn't delete journal entry. Try again later.");
    } finally {
      setIsSubmitting(false);
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
                  onClick={() => handleShowDeleteEntryModal(entry)}
                >
                  <IoMdClose />
                </button>

                <div className="w-64 h-64 md:w-72 md:h-72 overflow-hidden rounded-md shadow-md">
                  <img
                    className="w-full h-full object-cover"
                    src={entry.imageUrl}
                    alt="Cooked Dish"
                  />
                </div>

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

      {showDeleteEntryModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70">
          <div className="relative bg-gray-900 rounded-3xl shadow-2xl p-6 mx-2 w-full max-w-sm text-center animate-popIn">
            <p className="text-center text-white/90 mb-1">
              Delete{" "}
              <span className="font-semibold text-orange-200">
                {selectedEntry?.recipeName}
              </span>{" "}
              from your journal?
            </p>
            <div className="flex gap-5">
              <button
                className="mt-4 w-full bg-rose-400 text-white py-2 rounded-3xl hover:bg-rose-500 transition"
                onClick={() => handleDeleteJournalEntry(selectedEntry)}
                disabled={isSubmitting}
              >
                Delete
              </button>
              <button
                className="mt-4 w-full bg-gray-700 text-white py-2 rounded-3xl hover:bg-gray-800 transition"
                onClick={() => setShowDeleteEntryModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
