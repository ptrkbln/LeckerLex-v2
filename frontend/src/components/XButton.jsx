import { IoMdClose } from "react-icons/io";

export const XButton = ({ onClick }) => {
  return (
    <button
      type="button"
      className="absolute p-1 right-4 top-3 rounded-full text-xl sm:text-2xl bg-opacity-50 
              lg:opacity-0 lg:group-hover/close:opacity-100 lg:hover:bg-opacity-70 transition-all 
              bg-gray-900 active:scale-95 text-gray-300 hover:text-gray-200 z-10"
      onClick={onClick}
    >
      <IoMdClose />
    </button>
  );
};
