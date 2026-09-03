import React from 'react'

const SectionUI = ({children}) => {
    return (
        <div className="rounded-xl px-2 py-3 border-b border-border bg-panel/85  backdrop-blur">
            {children}
        </div>
    )
}

export default SectionUI