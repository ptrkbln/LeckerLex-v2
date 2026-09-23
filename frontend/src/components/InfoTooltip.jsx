import { RiInformation2Fill } from "react-icons/ri";

export function InfoTooltip({ children }) {
  return (
    <div className="relative transition group">
      <RiInformation2Fill className="text-orange-200 cursor-help" />

      <div
        className="invisible group-hover:visible absolute
          bottom-8
          left-0 border border-orange-100/60
          w-[230px] md:w-[300px] bg-gray-900 text-white p-3
          rounded-2xl text-sm shadow-lg z-50"
      >
        {children}

        <div
          className="absolute
            -bottom-[5.5px]
            left-2 border-b border-l border-orange-100/60
            w-4 h-3 bg-gray-900
            rotate-[-29deg] z-40"
        />
      </div>
    </div>
  );
}
