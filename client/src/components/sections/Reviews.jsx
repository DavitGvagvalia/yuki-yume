import React from 'react'

function Reviews({reviews}) {
  return (
    <div>
      <h2>Reviews</h2>
      <p>here what people think</p>
      <div className='h-[20%]  flex overflow-x-scroll  items-center gap-5' >
        {reviews.map((review, index) => (
          <div key={index} className='min-h-1/2 min-w-[300px] text-left px-5 py-1 bg-gray-600 rounded-md text-white' >
            <div>{review.reviewer}</div>
            <div>{review.review}</div>
            <div>{review.product}</div>
            <div>{review.stars}</div>
          </div>
        ))}
      </div>

    </div>
  )
}

export default Reviews