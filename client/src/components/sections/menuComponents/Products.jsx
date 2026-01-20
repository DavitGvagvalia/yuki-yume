import ProductCard from "./ProductCard.jsx";

const Products = ({ products, onChoose }) => {
  return (
    <div className="
  grid grid-cols-2 gap-4 mt-8
  overflow-y-auto
  md:grid-cols-none
  md:grid-flow-col
  md:auto-cols-[40vw]
  md:overflow-x-auto
  md:overflow-y-hidden
">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onChoose={() => onChoose(product)}
        />
      ))}
    </div>
  );
};
export default Products;