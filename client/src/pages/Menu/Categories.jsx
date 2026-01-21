const Categories = ({ categories, activeCategory, setActiveCategory }) => {

  const categoryClassNames = (category) => {
    return `px-4  h-fit rounded items-center ${
      activeCategory === category ? "bg-(--china-red) text-black" : ""
    }`;
  };
  return (
    <div className="flex bg-black/40 gap-6 py-2 h-fit overflow-x-scroll overflow-y-clip items-center md:justify-center">
      <button
        type="button"
        onClick={() => setActiveCategory("ALL")}
        aria-pressed={activeCategory === "ALL"}
        className={categoryClassNames("ALL")}
      >
        ALL
      </button>

      {categories.map((category) => (
        <button
          key={category}
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