import { useEffect, useRef, useState } from "react";
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import logo from "../../assets/images/логобезфона.png";
import { useProducts } from "../../hooks/useProducts";



const Logo = ({ className = "h-12 w-12" }) => {
  return (
    <div className="flex items-center gap-3">
      <img
        className={className}
        src={logo}
        alt="Yuki Yume"
      />

      <span className="text-sm font-semibold text-text-secondary">
        Yuki Yume
      </span>
    </div>
  );
};



const SearchButton = ({
  isSearchOpen,
  setIsSearchOpen,
  setIsMenuOpen,
  searchQuery,
}) => {
  return (
    <button
      type="button"
      aria-label={isSearchOpen ? "Close product search" : "Search products"}
      aria-expanded={isSearchOpen}
      onClick={() => {
        setIsSearchOpen((open) => {
          if (open) {
            // optional: clear search when closing
            // setSearchQuery("");
          }

          setIsMenuOpen(false);

          return !open;
        });
      }}
      className={`flex h-11 w-11 items-center justify-center rounded-full border transition ${
        searchQuery
          ? "border-accent bg-accent text-on-accent"
          : "border-border bg-control text-text hover:border-accent hover:bg-control-hover"
      }`}
    >
      {isSearchOpen ? (
        <XMarkIcon className="h-5 w-5" />
      ) : (
        <MagnifyingGlassIcon className="h-5 w-5" />
      )}
    </button>
  );
};



const CategoryList = ({
  categories,
  categoryLabels,
  activeCategory,
  handleCategoryClick,
  isMenuOpen,
  setIsMenuOpen,
  setIsSearchOpen,
}) => {
  return (
    <div>
      <button
        type="button"
        aria-label={isMenuOpen ? "Close categories" : "Open categories"}
        aria-expanded={isMenuOpen}
        onClick={() => {
          setIsMenuOpen((open) => !open);
          setIsSearchOpen(false);
        }}
        className={`flex h-11 w-11 items-center justify-center rounded-full border transition ${
          isMenuOpen
            ? "border-accent bg-control text-text"
            : "border-border bg-control text-text hover:border-accent hover:bg-control-hover"
        }`}
      >
        {isMenuOpen ? (
          <XMarkIcon className="h-5 w-5" />
        ) : (
          <Bars3Icon className="h-5 w-5" />
        )}
      </button>


      {isMenuOpen && (
        <div className="absolute left-0 top-full w-full pt-3">
          <div className="mx-auto grid max-h-[55vh] max-w-3xl grid-cols-2 gap-2 overflow-y-auto rounded-md border border-border bg-panel-elevated p-3 shadow-[0_18px_45px_rgb(23_36_63_/_0.14)] backdrop-blur-xl sm:grid-cols-3 md:grid-cols-4">

            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => handleCategoryClick(category)}
                aria-pressed={activeCategory === category}
                className={`min-h-11 rounded-md border px-3 py-2 text-sm font-semibold transition ${
                  activeCategory === category
                    ? "border-blossom bg-blossom text-text"
                    : "border-border bg-control text-text-secondary hover:border-accent hover:bg-control-hover hover:text-text"
                }`}
              >
                {categoryLabels?.get(category) || category}
              </button>
            ))}

          </div>
        </div>
      )}
    </div>
  );
};



export default function NavBar({
  categories = [],
  categoryLabels,
  activeCategory,
  setActiveCategory,
}) {

  const { searchQuery, setSearchQuery } = useProducts();


  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);


  const searchInputRef = useRef(null);



  useEffect(() => {
    if (!isSearchOpen) return;

    searchInputRef.current?.focus();

  }, [isSearchOpen]);



  function handleCategoryClick(category) {

    setActiveCategory?.(category);

    setSearchQuery("");

    setIsSearchOpen(false);

    setIsMenuOpen(false);
  }



  return (

    <nav
      className="
      relative
      sticky
      left-0
      top-0
      z-[110]
      flex
      w-full
      flex-col
      border-b
      border-border
      bg-panel/80
      px-3
      py-2
      shadow-[0_18px_45px_rgb(15_27_51_/_0.14)]
      backdrop-blur-2xl
      md:px-10
      "
    >

      <div className="flex items-center justify-between">

        <Logo />


        <div className="flex items-center gap-3">

          <SearchButton
            isSearchOpen={isSearchOpen}
            setIsSearchOpen={setIsSearchOpen}
            setIsMenuOpen={setIsMenuOpen}
            searchQuery={searchQuery}
          />

          <CategoryList
            categories={categories}
            categoryLabels={categoryLabels}
            activeCategory={activeCategory}
            handleCategoryClick={handleCategoryClick}
            isMenuOpen={isMenuOpen}
            setIsMenuOpen={setIsMenuOpen}
            setIsSearchOpen={setIsSearchOpen}
          />

        </div>

      </div>



      {isSearchOpen && (

        <div className="pb-3 pt-2">

          <label
            className="sr-only"
            htmlFor="product-search"
          >
            Search products
          </label>


          <div className="
            mx-auto
            flex
            w-full
            max-w-xl
            items-center
            gap-2
            rounded-3xl
            border
            border-border
            bg-panel-elevated
            px-4
            py-2
            shadow-[0_18px_45px_rgb(23_36_63_/_0.12)]
            backdrop-blur-xl
          ">

            <MagnifyingGlassIcon
              className="h-5 w-5 shrink-0 text-muted"
            />


            <input
              id="product-search"
              ref={searchInputRef}
              type="search"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
              placeholder="Search by name or ingredient"
              className="
                min-w-0
                flex-1
                bg-transparent
                text-sm
                font-medium
                text-text
                outline-none
                placeholder:text-muted
              "
            />

          </div>

        </div>

      )}

    </nav>

  );
}
