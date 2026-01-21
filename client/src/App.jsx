import { useState } from 'react'
import './App.css'
import { useFetch } from './hooks/fetch'
import NavBar from './components/sections/NavBar.jsx'
import Cart from './components/elements/cart.jsx'
import Hero from './components/sections/HeroSection.jsx'
import Menu from './components/sections/MenuSection.jsx'
import ReviewsSection from './components/sections/ReviewsSection.jsx'
import About from './components/sections/AboutSection.jsx'
import Contacts from './components/sections/ContactsSection.jsx'
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
      <ReviewsSection reviews={reviews} />
      <About />
      <Contacts />
    </div>
  )
}

export default App
