import React from 'react'
import Hero from './Hero'
import Review from './Review'
import About from './About'
import Contact from './Contact'
import Sales from './sales.jsx'
const Home = () => {
  return (
    
    <main className='font-primary z-1'>
      <Hero />
      <Sales />
      <Review />
      <About />
      <Contact />
    </main>
  )
}

export default Home