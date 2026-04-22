import { useState, useMemo } from "react";
import Categories from "../../components/menu/Categories.jsx";
import Products from "../../components/menu/Products.jsx";
import { useProducts } from "../../hooks/useProducts.jsx";
import { DetailProvider } from "../../hooks/useDetail.jsx";
import { useSelection } from "../../hooks/useSelection.jsx";


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
  const { products } = useProducts()
  const { addProduct } = useSelection()

  const [activeCategory, setActiveCategory] = useState("ALL");


  const categories = useMemo(() => {
    console.log(products)
    return ["ALL", ...new Set(products.map((p) => p.category))];
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
        onChoose={addProduct}
      />
    </main>
  );
}