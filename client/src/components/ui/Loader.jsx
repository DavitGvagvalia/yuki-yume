import React from 'react'
import sushi from '../../../assets/images/loading.svg'
function Loader({ loading }) {
    // if (!loading) return null
    return (
        <div className="aspect-square animate-spin rounded-full w-29">
            <img src={sushi} alt="Loading..." />
            <img src="" alt="" />
        </div>

    )
}

export default Loader