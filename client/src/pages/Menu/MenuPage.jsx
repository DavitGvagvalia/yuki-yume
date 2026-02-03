import { useState, useMemo } from "react";
import Categories  from "../../components/menu/Categories.jsx";
import Products from "../../components/menu/Products.jsx";
import { useProducts } from "./useProducts.js";
import { useCart } from "../../hooks/useCart.jsx";

const SectionText = () => {
  return (
    <div className="flex flex-col items-center text-center mb-8">
      <h2 className="text-3xl font-bold text-text">Menu</h2>
      <p className="text-sm text-muted">
        Choose your favorites
      </p>
    </div>
  );
};

export default function MenuPage() {
  const { products, loading, error } = useProducts();

  const [activeCategory, setActiveCategory] = useState("ALL");
  const { addItem } = useCart();
  /* ---------- derived data ---------- */

  const categories = useMemo(() => {
    return [ ...new Set(products.map((p) => p.category))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (activeCategory === "ALL") return products;
    return products.filter(
      (p) => p.category === activeCategory
    );
  }, [products, activeCategory]);

  /* ---------- render ---------- */

  return (
    <main className="min-h-screen bg-background py-20 px-2">
      <SectionText />

      <Categories
        categories={categories}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

      <Products
        products={filteredProducts}
        onChoose={addItem}
      />
    </main>
  );
}
