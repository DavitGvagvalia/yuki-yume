const Categories = ({ categories, activeCategory, setActiveCategory }) => {

  const categoryClassNames = (category) =>
    `flex-shrink-0 rounded-md border px-4 py-2 text-sm font-semibold whitespace-nowrap transition
    ${
      activeCategory === category
        ? "border-accent bg-accent text-on-accent"
        : "border-border bg-control text-text-secondary hover:border-accent hover:text-text"
    }`;

  return (
    <div className="flex gap-3 overflow-x-auto border-y border-border bg-panel/70 p-3 backdrop-blur md:justify-center">

      {categories.map((category,i) => (
        <button
          key={i}
          type="button"
          onClick={() => setActiveCategory(category)}
          aria-pressed={activeCategory === category}
          className={categoryClassNames(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

export default Categories;
