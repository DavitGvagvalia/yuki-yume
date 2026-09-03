import React from 'react'

const SectionUI = ({children}) => {
    return (
        <div className="mb-6 flex flex-col justify-center rounded-xl px-3 border-b border-border bg-panel/85 py-3 text-center backdrop-blur">
            {children}
        </div>
    )
}

export default SectionUI