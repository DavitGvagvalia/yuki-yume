import React from 'react'
import ReviewCard from './reviewCard'
function Reviews({reviews}) {
  return (
    <div className="flex overflow-x-auto gap-5 py-4 relative">
    {reviews.map((review, index) => (
        <ReviewCard key={index} review={review} />
    ))}
  </div>
  )
}

export default Reviews