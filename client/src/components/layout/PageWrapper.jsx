import React from 'react'
function PageWrapper({ children }) {
  return (
    <div
      className="
        min-h-screen
        bg-background
        text-text
        flex
        flex-col
        overflow-x-hidden
      ">
      {children}
    </div>
  );
}

export default PageWrapper;