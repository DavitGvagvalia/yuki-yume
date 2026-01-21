import React from "react";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { StarIcon as StarIconOutline } from "@heroicons/react/24/outline";
import { useReviews } from "./useReviews.js";

/* ---------- Section header ---------- */

function SectionText() {
  return (
    <div className="flex flex-col items-center text-center mb-6">
      <h2 className="text-3xl font-bold text-text">Reviews</h2>
      <p className="text-sm text-muted">What our guests say</p>
    </div>
  );
}

/* ---------- Stars ---------- */

function Stars({ stars }) {
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) =>
        i < stars ? (
          <StarIconSolid
            key={i}
            className="w-5 h-5 text-accent"
          />
        ) : (
          <StarIconOutline
            key={i}
            className="w-5 h-5 text-muted"
          />
        )
      )}
    </div>
  );
}

/* ---------- Review card ---------- */

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

/* ---------- Review list ---------- */

function ReviewList({ reviews }) {
  return (
    <div className="flex gap-5 overflow-x-auto py-4 snap-x snap-mandatory">
      {reviews.map((review, index) => (
        <div key={index} className="snap-start">
          <ReviewCard review={review} />
        </div>
      ))}
    </div>
  );
}

/* ---------- Page section ---------- */

export default function Reviews() {
  const { reviews, loading, error } = useReviews();

  if (loading) return <div className="text-center">Loading…</div>;
  if (error) return <div className="text-center">Failed to load reviews</div>;

  return (
    <section className="py-12 bg-surface">
      <SectionText />
      <ReviewList reviews={reviews} />
    </section>
  );
}
