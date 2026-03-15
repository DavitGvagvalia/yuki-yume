const Categories = ({ categories, activeCategory, setActiveCategory }) => {

  const categoryClassNames = (category) =>
    `px-4 py-2 rounded flex-shrink-0 whitespace-nowrap transition
    ${
      activeCategory === category
        ? "bg-accent text-black"
        : "text-text hover:bg-surface"
    }`;

  return (
    <div className="flex bg-background/40 gap-4 py-2 overflow-x-auto items-center md:justify-center">

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