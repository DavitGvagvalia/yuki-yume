import { useState, useMemo } from "react";
import Categories from "../../components/menu/Categories.jsx";
import Products from "../../components/menu/Products.jsx";
import { useFetchProducts } from "./getProducts.js";
import { useProducts } from "../../hooks/useProducts.jsx";

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
  const { products, loading, error } = useFetchProducts();
  const { addProduct } = useProducts();

  const [activeCategory, setActiveCategory] = useState("ALL");

  const categories = useMemo(() => {
    return ["ALL", ...new Set(products.map((p) => p.category))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (activeCategory === "ALL") return products;
    return products.filter((p) => p.category === activeCategory);
  }, [products, activeCategory]);

  if (loading) {
    return <main className="min-h-screen bg-background py-20 px-2 text-text">Loading...</main>;
  }

  if (error) {
    return <main className="min-h-screen bg-background py-20 px-2 text-text">Failed to load products.</main>;
  }

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
        onChoose={addProduct}
      />
    </main>
  );
}