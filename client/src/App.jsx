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
  const {data: products} = useFetch('http://localhost:5000/items');
  const { data: reviews } = useFetch('http://localhost:5000/reviews');

  const [ChosenProducts,setChosenProducts] = useState([])
  const [Toggle,toggleCart] = useState(false)

  const HandleToggleCart = () =>{
    toggleCart(prev => !prev)
  }



  return (
    <div>
      <NavBar ChosenProducts={ChosenProducts} handleToggleCart={HandleToggleCart} toggle={Toggle}/>
      <Cart HandleToggleCart ={HandleToggleCart} Toggle ={Toggle} ChosenProducts={ChosenProducts} setChosenProducts={setChosenProducts} />
      <Hero />
      <Menu products={products} setChosenProducts={setChosenProducts} />
      <Reviews reviews={reviews} />
      <About />
      <Contacts />
    </div>
  )
}

export default App
