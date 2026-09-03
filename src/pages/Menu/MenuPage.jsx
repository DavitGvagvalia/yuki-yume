import { useState, useMemo } from "react";
import Categories from "../../components/menu/Categories.jsx";
import Products from "../../components/menu/Products.jsx";
import { useProducts } from "../../hooks/useProducts.jsx";
import { useCategories } from "../../hooks/useCategories.jsx";
import { useSelection } from "../../hooks/useSelection.jsx";
import { useImagePreloader } from "../../hooks/useImagePreloader.jsx";
import {
  getProductsMatchingCategory
} from "../../services/product.service.js";

import sakura from "../../assets/images/сакура.png";
import NavBar from "../../components/layout/Navbar.jsx";

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


const MainWithBackground = ({ children }) => {
  return (
      <main className="relative min-h-screen overflow-hidden bg-[#557abd]">
        
        <img src={sakura} alt="sakura" className="fixed top-15 -left-8 w-40 h-40 object-cover z-0 rotate-60" />
        <img src={sakura} alt="sakura" className="fixed aspect-square top-1/2 -right-25 w-45 object-cover z-0" />
        <img src={sakura} alt="sakura" className="fixed bottom-25 -left-15 w-30 h-30 object-cover z-0 rotate-45" />
        {children}
    </main>
  )}

export default function MenuPage() {
  const { visibleProducts } = useProducts()
  const { categories: menuCategories } = useCategories()
  const { addProduct } = useSelection()

  const [activeCategory, setActiveCategory] = useState("POPULAR");

  const categories = useMemo(() => {
    return ["POPULAR", ...menuCategories.map((category) => category.id)];
  }, [menuCategories]);

  const categoryLabels = useMemo(() => {
    return new Map([
      ['POPULAR', 'POPULAR'],
      ...menuCategories.map((category) => [category.id, category.name])
    ]);
  }, [menuCategories]);

  const filteredProducts = useMemo(() => {
    return getProductsMatchingCategory(visibleProducts, activeCategory);
  }, [visibleProducts, activeCategory]);

  const priorityImageUrls = useMemo(() => {
    return filteredProducts.map((product) => product.imageUrl);
  }, [filteredProducts]);

  const backgroundImageUrls = useMemo(() => {
    return visibleProducts.map((product) => product.imageUrl);
  }, [visibleProducts]);

  useImagePreloader({
    priorityUrls: priorityImageUrls,
    backgroundUrls: backgroundImageUrls,
    concurrency: 8
  });

  return (
    <MainWithBackground>

      <div className="relative z-1 mx-auto w-full ">
        <NavBar
          categories={categories}
          categoryLabels={categoryLabels}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
        />

        <Categories
          categories={categories}
          categoryLabels={categoryLabels}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
        />
        <Products
          products={filteredProducts}
          onChoose={addProduct}
        />
      </div>
    </MainWithBackground>
  );
}
