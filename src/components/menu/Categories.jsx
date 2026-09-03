import { useRef } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PhoneIcon
} from "@heroicons/react/24/outline";


const Categories = ({ categories, categoryLabels, activeCategory, setActiveCategory }) => {
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
        </address>
      )
    }


  function scrollCategories(direction) {
    categoriesRef.current?.scrollBy({
      left: direction * 180,
      behavior: "smooth"
    });
  }

  return (
    <div className="flex gap-3 items-center  border-y border-border/20 bg-panel/20 p-1 md:gap-5 md:p-3 md:justify-center sticky w-full z-100 backdrop-blur">
      <div className="flex  items-center gap-3 overflow-y-auto w-fit h-15">


        <div ref={categoriesRef} className="flex gap-1 overflow-x-auto w-fit scrollbar-none">
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => setActiveCategory(category)}
          aria-pressed={activeCategory === category}
          className={categoryClassNames(category)}
        >
          {categoryLabels?.get(category) || category}
        </button>
      ))}
      </div>

      </div>
      <ContactInformation className="text-sm" />

    </div>
  );
};

export default Categories;
