import React from 'react'
import Hero from './Hero'
import Review from './Review'
import About from './About'
import Contact from './Contact'

const Home = () => {
  return (
    <main className='z-0'>
      <Hero />
      <Review />
      <About />
      <Contact />
    </main>
  )
}

export default Home