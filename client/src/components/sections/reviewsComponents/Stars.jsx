import React from 'react'
import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
function Stars({stars}) {
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) =>
        i < stars ? (
          <StarIconSolid key={i} className="w-5 h-5 text-yellow-400" />
        ) : (
          <StarIconOutline key={i} className="w-5 h-5 text-gray-400" />
        )
      )}
    </div>
  )
}

export default Stars