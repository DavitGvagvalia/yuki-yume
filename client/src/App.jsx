import { useState } from 'react'
import './App.css'
import { useFetch } from './hooks/fetch'
import NavBar from './components/sections/NavBar.jsx'
import Cart from './components/elements/cart.jsx'
import Hero from './components/sections/Hero.jsx'
import Menu from './components/sections/Menu.jsx'
import Reviews from './components/sections/Reviews.jsx'
import About from './components/sections/About.jsx'
import Contacts from './components/sections/Contacts.jsx'
function App() {
  const {data: items} = useFetch('http://localhost:5000/items');
  const { data: reviews } = useFetch('http://localhost:5000/reviews');

  const [ChosenItems,ChooseItem] = useState([])
  const [toggle,toggleCart] = useState(false)




  return (
    <div>
      <NavBar ChoosenItems={ChosenItems} ToggleCart={toggleCart}/>
      <Cart Toggle ={toggle} ChosenItems={ChosenItems}/>
      <Hero />
      <Menu items={items} ChooseItem={ChooseItem} />
      <Reviews />
      <About />
      <Contacts />
    </div>
  )
}

export default App
