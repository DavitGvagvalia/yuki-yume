import { useRef } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PhoneIcon
} from "@heroicons/react/24/outline";


const Categories = ({ categories, activeCategory, setActiveCategory }) => {
  const categoriesRef = useRef(null);

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
          <a className="text-sm transition  hover:text-text" href='tel:+995511557707'><PhoneIcon className="inline h-6 w-6 mb-1" /></a>
        </address>
      )
    }

  const chevronClassNames = "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md border border-border bg-control text-text-secondary transition hover:border-accent hover:text-text md:h-9 md:w-9";

  function scrollCategories(direction) {
    categoriesRef.current?.scrollBy({
      left: direction * 180,
      behavior: "smooth"
    });
  }

  return (
    <div className="flex gap-3 items-center overflow-x-auto border-y border-border bg-panel/70 p-2 pt-4 md:gap-5 md:p-10 backdrop-blur md:justify-center fixed w-full z-100">
      <div className="flex  items-center gap-3 overflow-y-auto w-fit h-15">
        <button
          type="button"
          aria-label="Scroll categories left"
          onClick={() => scrollCategories(-1)}
          className={chevronClassNames}
        >
          <ChevronLeftIcon className="" />
        </button>

        <div ref={categoriesRef} className="flex gap-1 overflow-x-auto w-fit md:h-15 scrollbar-none">
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
      <button
        type="button"
        aria-label="Scroll categories right"
        onClick={() => scrollCategories(1)}
        className={chevronClassNames}
      >
        <ChevronRightIcon className="" />
      </button>
      </div>
      <ContactInformation className="text-sm" />

    </div>
  );
};

export default Categories;
