export default function NavDropdown({
  label,
  dropdownKey,
  activeDropdown,
  onToggle,
  items,
  onNavigate,
  widthClass = "w-44"
}) {
  return (
    <details className="relative" open={activeDropdown === dropdownKey}>
      <summary
        className="cursor-pointer list-none text-neutral-700 dark:text-neutral-200 hover:text-primary-600 dark:hover:text-primary-100 transition-colors"
        onClick={(event) => {
          event.preventDefault();
          onToggle(dropdownKey);
        }}
      >
        {label}
      </summary>
      <div className={`absolute right-0 mt-2 ${widthClass} rounded-xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800 shadow-xs z-10`}>
        {items.map((item) => (
          <button
            key={item.label}
            className={`block w-full text-left px-3 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-700 ${item.className || ""}`.trim()}
            onClick={item.onClick ? item.onClick : () => onNavigate(item.path)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </details>
  );
}
