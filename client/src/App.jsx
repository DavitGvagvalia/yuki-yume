import Navbar from "./components/layout/Navbar.jsx";
import CartDrawer from "./components/cart/CartDrawer.jsx";
import AppRoutes from "./routes/routes.jsx";
import PageWrapper from "./components/layout/PageWrapper.jsx";
import Footer from "./components/layout/Footer.jsx";
import { CartProvider,useCart } from "./hooks/useCart.jsx";
export default function App() {

  return (
    <PageWrapper>
      <CartProvider>
      <Navbar />
      <AppRoutes />
      <CartDrawer />
      <Footer />
    </CartProvider>
    </PageWrapper>
  );
}