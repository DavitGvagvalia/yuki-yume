import { Link, NavLink } from "react-router-dom";
import {
  BookOpenIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import logo from "../../../assets/images/logo.png";

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
        `flex flex-col items-center text-text px-4 py-1 rounded-b-3xl   transition ${isActive ? "bg-linear-to-b" : ""
        } duration-500 from-transparent to-accent`
      }
    >
      <Icon className="w-10 h-10 " />
      <span className="hidden md:block text-sm">{text}</span>
    </NavLink>
  );
};

export default function NavBar() {

  return (
    <nav
      className="fixed top-0 left-0 w-full h-18 px-4 py-4 md:px-10 flex justify-center items-center gap-10 bg-background/60 backdrop-blur z-10"
    >
      <Linker to="/menu" Icon={BookOpenIcon} text="Menu" />

      {/* Logo */}
      <Linker to="/" Icon={Logo} text="Home" />


      <Linker to="/profile" Icon={UserIcon} text="Profile" />
    </nav>
  );
}