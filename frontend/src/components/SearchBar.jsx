import { FaSearch, FaTimes } from "react-icons/fa";

/**
 * Controlled search input. Filtering stays with the calling page or store so it
 * can be shared between table and card views.
 */
export default function SearchBar({
  value = "",
  onChange,
  onClear,
  placeholder = "Search guests, phone, villa, passport or ID...",
  label = "Search guests",
  id,
  name = "guest-search",
  disabled = false,
  className = "",
  inputClassName = "",
}) {
  const clearSearch = () => {
    if (onClear) {
      onClear();
      return;
    }

    onChange?.({
      target: { name, value: "" },
      currentTarget: { name, value: "" },
    });
  };

  return (
    <label className={`relative block w-full ${className}`}>
      <span className="sr-only">{label}</span>
      <FaSearch
        aria-hidden="true"
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted"
      />
      <input
        id={id}
        name={name}
        type="search"
        value={value ?? ""}
        onChange={onChange}
        disabled={disabled}
        readOnly={!onChange}
        placeholder={placeholder}
        aria-label={label}
        className={`h-11 w-full rounded-xl border border-line bg-white py-2.5 pl-11 pr-11 text-sm text-ink outline-none transition duration-200 placeholder:text-gray-400 hover:border-gray-300 focus:border-hallmark focus:ring-4 focus:ring-hallmark/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-muted ${inputClassName}`}
      />
      {value && !disabled && (
        <button
          type="button"
          onClick={clearSearch}
          className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted transition hover:bg-[#800C18]/[0.07] hover:text-hallmark focus:outline-none focus-visible:ring-2 focus-visible:ring-hallmark"
          aria-label="Clear search"
        >
          <FaTimes aria-hidden="true" className="text-sm" />
        </button>
      )}
    </label>
  );
}
