import logo from '../../assets/images/logo.png';
import { ShoppingCartIcon,HomeIcon,BookOpenIcon,ExclamationCircleIcon,ChatBubbleOvalLeftIcon } from '@heroicons/react/24/outline';

function NavBar({ ChoosenItems = [],ToggleCart }) {
  let choosenItemsLength = ChoosenItems.length
  const showCartItemCount = choosenItemsLength > 0;


  const handleToggleCart = () =>{
    ToggleCart(prev => !prev)
  }
  return (
    <nav className={`
        fixed top-0 w-full h-20 z-51
        flex items-center justify-center md:gap-6 gap-9  px-4
        transition-all duration-300
        text-white
        scroll-smooth
        lg:border-b-2
      bg-black/40
      `}>
      <a href="#Hero">
        <HomeIcon className='block md:hidden w-8 h-8'/>
        <span className='hidden md:block'>Home</span>
      </a>
      <a href="#Menu">
        <BookOpenIcon className='block md:hidden w-8 h-8'/>
        <span className='hidden md:block'>Menu</span>
      </a>
      {showCartItemCount ? (
        <button onClick={handleToggleCart} className='shopping-cart' count = {`${choosenItemsLength}`}>
          <ShoppingCartIcon className="w-10 h-10 mx-4"   /></button>
      ) : (
        <a href='#Hero'><img src={logo} alt="Logo" className="w-16 h-16 mx-4" /></a>
      )}

      <a href="#About">
        <ExclamationCircleIcon className='block md:hidden w-8 h-8'/>
        <span className='hidden md:block'>About</span>
      </a>
      <a href="#Contacts">
        <ChatBubbleOvalLeftIcon className='block md:hidden w-8 h-8'/>
        <span className='hidden md:block'>Contacts</span>
      </a>
    </nav>
  );
}

export default NavBar;
