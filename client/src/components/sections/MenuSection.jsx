import { useState, useMemo } from "react";
import Categories from './menuComponents/Categories'
import Products from "./menuComponents/Products";
/* =======================
   Section text (pure UI)
======================= */
const SectionText = () => {
  return (
    <div className="h-[20%] flex flex-col justify-center items-center">
      <h2 className="text-3xl font-bold">Menu Section</h2>
      <p className="text-sm opacity-80">Some text</p>
    </div>
  );
};



function Menu({ products = [], setChosenProducts }) {
  const [activeCategory, setActiveCategory] = useState("ALL");

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))),
    [products]
  );

  const filteredProducts = useMemo(() => {
    if (activeCategory === "ALL") return products;
    return products.filter((p) => p.category === activeCategory);
  }, [products, activeCategory]);

  const handleChooseProduct = (product) => {
    setChosenProducts((prev) => [...prev, product]);
  };

  return (
    <div
      id="Menu"
      className="h-screen bg-gray-800 text-yellow-300 flex flex-col py-20 px-6"
    >
      <SectionText />

      <Categories
        categories={categories}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

      <Products
        products={filteredProducts}
        onChoose={handleChooseProduct}
      />
    </div>
  );
}

export default Menu;
