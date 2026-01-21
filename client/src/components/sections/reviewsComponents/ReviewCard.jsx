import React from 'react'
import Stars from './Stars'
function ReviewCard({ review }) {
    return (
        <div
            className="min-w-[200px] bg-gray-600 rounded-md text-white p-4 flex flex-col gap-2"
        >
            <div className="font-semibold">{review.reviewer}</div>
            <div className="text-sm">{review.review}</div>
            <div className="text-xs text-gray-300">{review.product}</div>
            <Stars stars={review.stars} className="fixed bottom-0" />
        </div>
    )
}

export default ReviewCard