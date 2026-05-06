import Navbar from "./components/layout/Navbar.jsx";
import CartDrawer from "./components/cart/CartDrawer.jsx";
import AppRoutes from "./routes.jsx";
import PageWrapper from "./components/layout/PageWrapper.jsx";
import Footer from "./components/layout/Footer.jsx";
import { CartButton } from "./components/cart/CartButton.jsx";
import { DetailProvider } from "./hooks/useDetail.jsx";
export default function App() {
  

  return (
    <PageWrapper>
      <Navbar />
      <AppRoutes />
      <CartDrawer />
      <CartButton />
      <Footer />
    </PageWrapper>
  );
}