import React, { useEffect, useState } from 'react'

const AnimatedPage = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 30)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      style={{ position: 'relative', minHeight: '100%', background: 'transparent', zIndex: 1 }}
      className={`transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    >
      {children}
    </div>
  )
}

export default AnimatedPage
