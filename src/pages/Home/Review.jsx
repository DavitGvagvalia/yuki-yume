import React from "react";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { StarIcon as StarIconOutline } from "@heroicons/react/24/outline";
import { ReviewsProvider } from "../../hooks/useReviews.jsx";
import { useReviews } from "../../hooks/useReviews.jsx";

function SectionText() {
  return (
    <div className="flex flex-col items-center text-center mb-6">
      <h2 className="text-3xl font-bold text-text">Reviews</h2>
      <p className="text-sm text-muted">What our guests say</p>
    </div>
  );
}


function Stars({ stars }) {
  console.log(stars)
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) =>
        i < stars ? 
        (
          <StarIconSolid
            key={i}
            className="w-5 h-5 text-accent"
          />
        ) 
        : 
        (
          <StarIconOutline
            key={i}
            className="w-5 h-5 text-muted"
          />
        )
        
      )}
    </div>
  );
}


function ReviewCard({ review }) {
  return (
    <div className="min-w-[300px] bg-card rounded-md p-4 flex flex-col gap-2">
      <div className="font-semibold text-text">
        {review.reviewer}
      </div>

      <div className="text-xs text-muted">
        {review.product}
      </div>

      <div className="text-sm text-text-secondary">
        {review.review}
      </div>

      <Stars stars={review.stars} />
    </div>
  );
}


function ReviewList() {
  const { reviews } = useReviews();

  return (
    <div className="flex gap-5 overflow-x-auto py-4">
      {reviews.map((review, index) => (
        <div key={index} className="">
          <ReviewCard review={review} />
        </div>
      ))}
    </div>
  );
}


export default function Reviews() {

  return (
    <ReviewsProvider>
    <section className="py-12 bg-surface">
      <SectionText />
      <ReviewList/>
    </section>
    </ReviewsProvider>

  );
}
