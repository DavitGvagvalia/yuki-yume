import { useState, useMemo } from "react";
import Categories from "./Categories.jsx";
import Products from "./Products.jsx";
import { useProducts } from "./useProducts.js";
// import { useCart } from "../../hooks/useCart.js";

const SectionText = () => {
  return (
    <div className="flex flex-col items-center text-center mb-8">
      <h2 className="text-3xl font-bold text-text">Menu</h2>
      <p className="text-sm text-muted">Choose your favorites</p>
    </div>
  );
};

function MenuPage() {
  const { products, loading, error } = useProducts();
  // const { addItem } = useCart();

  const [activeCategory, setActiveCategory] = useState("ALL");

  if (loading) return <div className="text-center">Loading…</div>;
  if (error) return <div className="text-center">Failed to load menu</div>;

  const categories = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.category)));
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (activeCategory === "ALL") return products;
    return products.filter((p) => p.category === activeCategory);
  }, [products, activeCategory]);

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
        // onChoose={addItem}
      />
    </main>
  );
}

export default MenuPage;
