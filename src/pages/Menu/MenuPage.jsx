import { useState, useMemo } from "react";
import Categories from "../../components/menu/Categories.jsx";
import Products from "../../components/menu/Products.jsx";
import { useProducts } from "../../hooks/useProducts.jsx";
import { useSelection } from "../../hooks/useSelection.jsx";


const SectionText = () => {
  return (
    <div className="mb-6 flex flex-col items-center border-b border-border bg-panel/85 pb-6 pt-6 text-center backdrop-blur">
      <h2 className="text-3xl font-bold text-text">Menu</h2>
      <p className="text-sm text-text-secondary">
        Choose your favorites
      </p>
    </div>
  );
};

export default function MenuPage() {
  const { products } = useProducts()
  const { addProduct } = useSelection()

  const [activeCategory, setActiveCategory] = useState("ALL");


  const categories = useMemo(() => {
    return ["ALL", ...new Set(products.map((p) => p.category))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (activeCategory === "ALL") return products;
    return products.filter((p) => p.category === activeCategory);
  }, [products, activeCategory]);



  return (
    <main className="relative min-h-screen overflow-hidden ">
      <div className="relative z-1 mx-auto w-full">
        <SectionText />
        <Categories
          categories={categories}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
        />
        <Products
          products={filteredProducts}
          onChoose={addProduct}
        />
      </div>
    </main>
  );
}
