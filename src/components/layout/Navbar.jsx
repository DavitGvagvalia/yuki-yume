import { Link, NavLink } from "react-router-dom";
import {
  BookOpenIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import logo from "../../assets/images/logo.png";
import { useCheckout } from "../../hooks/useCheckout";



const Logo = () => {
  return (
    <img
      className="w-12 h-12 object-cover"
      src={logo} alt="Yuki Yume" />
  )
}

const Linker = ({ to, Icon, text }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex min-w-16 flex-col items-center rounded-3xl border px-4 py-2 text-text transition duration-300 ${
          isActive
            ? "border-accent bg-accent-soft"
            : "border-transparent hover:border-border hover:bg-control"
        }`
      }
    >
      <Icon className="h-8 w-8" />
      <span className="hidden md:block text-sm">{text}</span>
    </NavLink>
  );
};

export default function NavBar() {

    const { isCheckoutOpen } = useCheckout()

  return (
    !isCheckoutOpen && (
    <nav
      className="fixed left-0 top-0 z-8 flex h-20 w-full items-center justify-center gap-6 border-b border-border bg-background/80 px-4 py-3 backdrop-blur md:px-10"
    >
      <Linker to="/menu" Icon={BookOpenIcon} text="Menu" />

      {/* Logo */}
      <Linker to="/" Icon={Logo} text="Home" />


    </nav>)
  );
}
