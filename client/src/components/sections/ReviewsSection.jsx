import React from 'react'
import Reviews from './reviewsComponents/reviews'


const SectionText = () => {
  return (
    <div className="h-[20%] flex flex-col justify-center items-center">
      <h2 className="text-3xl font-bold">Reviews Section</h2>
      <p className="text-sm opacity-80">Some text</p>
    </div>
  )
}


function ReviewsSection({ reviews }) {
  return (
    <div>
      <SectionText />
      <Reviews reviews={reviews} />
    </div>
  )
}

export default ReviewsSection
