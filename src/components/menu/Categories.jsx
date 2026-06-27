import { PhoneIcon } from "@heroicons/react/24/outline";


const Categories = ({ categories, activeCategory, setActiveCategory }) => {

  const categoryClassNames = (category) =>
    `flex-shrink-0 rounded-md border px-4 py-2 text-sm font-semibold whitespace-nowrap transition
    ${
      activeCategory === category
        ? "border-accent bg-accent text-on-accent"
        : "border-border bg-control text-text-secondary hover:border-accent hover:text-text"
    }`;


    const ContactInformation = () => {
      return(
        <address className="not-italic flex items-center">
          <a className="text-sm transition w-10 hover:text-text" href='tel:+995555328809'><PhoneIcon className="inline mr-2 h-4 w-4" /></a>
        </address>
      )
    }

  return (
    <div className="flex gap-10 items-center overflow-x-auto border-y border-border bg-panel/70 p-2 pt-4 md:p-10 backdrop-blur md:justify-center fixed w-full z-100">
      <div className="flex gap-1 overflow-y-auto w-fit md:h-15">
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
      <ContactInformation className="text-sm" />

    </div>
  );
};

export default Categories;
