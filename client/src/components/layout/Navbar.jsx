import { Link } from "react-router-dom";
import {
  ShoppingCartIcon,
  HomeIcon,
  BookOpenIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import logo from "../../../assets/images/logo.png";
import CartBadge from "../cart/CartBadge.jsx";
import { useCart } from "../../hooks/useCart.jsx";

const Linker = ({ to, Icon, text }) => {
  return (
    <Link to={to} className="flex flex-col items-center text-text p-4 engage rounded-b-2xl">
      <Icon className="w-8 h-8" />
      <span className="hidden md:block text-sm">{text}</span>
    </Link>
  );
};

export default function NavBar() {
  const { isOpen, toggleCart, totalCount, } = useCart();
  return (
    <nav
      className="
        fixed
        top-0
        left-0
        w-full
        h-16
        px-4
        py-4
        md:px-10
        flex
        justify-center
        items-center
        gap-6
        bg-background/60
        backdrop-blur
        z-10
        
      "
    >
      <Linker to="/" Icon={HomeIcon} text="Home" />
      <Linker to="/menu" Icon={BookOpenIcon} text="Menu" />

      {/* Logo */}
      <Link to="/" className="w-14 flex justify-center">
        <img src={logo} alt="Yuki Yume" />
      </Link>

      {/* Cart */}
      <button
        onClick={toggleCart}
        className={`relative flex flex-col items-center text-text p-4 rounded-2xl ${isOpen && 'bg-accent-muted'}`}
      >
        <CartBadge count={totalCount} />
        <ShoppingCartIcon className="w-8 h-8" />
        <span className="hidden md:block text-sm">Cart</span>
      </button>

      <Linker to="/profile" Icon={UserIcon} text="Profile" />
    </nav>
  );
}
