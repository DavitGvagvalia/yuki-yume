import { Link } from 'react-router-dom'
import logo from '../../../assets/images/logo.png';
import { ShoppingCartIcon, HomeIcon, BookOpenIcon, UserIcon } from '@heroicons/react/24/outline';

function NavBar({ ChosenProducts = [] }) {
  let ChosenProductsLength = ChosenProducts.length;

  return (
    <nav className={`
    fixed inset-0 w-full h-16  flex gap-6 justify-center items-center z-3 px-4 md:px-10 py-2 md:py-4 bg-background/60
      `}>
      <Link to="/home">
        <HomeIcon className='block md:hidden w-8 h-8' />
        <span className='hidden md:block'>Home</span>
      </Link>

      <Link to="/menu">
        <BookOpenIcon className='block md:hidden w-8 h-8' />
        <span className='hidden md:block'>Menu</span>
      </Link>

      <Link to="/home" className='aspect-square w-15'>
        <img src={logo} alt="" />
      </Link>

      <Link to="/menu">
        <ShoppingCartIcon className='block md:hidden w-8 h-8' />
        <span className='hidden md:block'>Menu</span>
      </Link>

      <Link to="/profile">
        <UserIcon className='block md:hidden w-8 h-8' />
        <span className='hidden md:block'>Profile</span>
      </Link>



    </nav>
  );
}

export default NavBar;
