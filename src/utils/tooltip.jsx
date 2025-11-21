export const OriginalTooltip = ({ children, text }) => {
  return (
    <legend className="relative group inline-block">
      {children}

      <div className="
          absolute z-10 invisible group-hover:visible
          opacity-0 group-hover:opacity-100
          transition-opacity duration-300
          bg-gray-400 text-white text-xs rounded px-2 py-1
          whitespace-nowrap
      ">
        {text}
      </div>
    </legend>
  );
};

