import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Globe, User, LogOut, Sparkles } from 'lucide-react'

const Header = ({ user, onLogout }) => {
  const location = useLocation()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navigationItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/my-trips', label: 'My Trips' },
    { path: '/search/cities', label: 'Explore' },
    { path: '/ai-itinerary', label: 'AI Planner' },
    { path: '/budget', label: 'Budget' },
    { path: '/profile', label: 'Profile' }
  ]

  const isActive = (path) => {
    if (path === '/search/cities') {
      return location.pathname.includes('/search')
    }
    return location.pathname === path
  }

  return (
    <header className={`header transition-all duration-300 ${isScrolled ? 'shadow-lg' : ''}`}>
      <div className="container">
        <div className="header-content">
          {/* Logo Section */}
          <Link to="/dashboard" className="logo flex items-center gap-3 animate-fade-in-left">
            <div className="relative">
              <Globe size={32} className="text-blue-600 animate-pulse" />
              <div className="absolute inset-0 bg-blue-400 rounded-full opacity-20 animate-ping"></div>
            </div>
            <span className="gradient-text">GlobeTrotter</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="animate-fade-in-down">
            <ul className="nav-links">
              {navigationItems.map((item, index) => (
                <li key={item.path} className={`animate-fade-in-down stagger-${index + 1}`}>
                  <Link 
                    to={item.path} 
                    className={isActive(item.path) ? 'active' : ''}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3 animate-fade-in-right">
            {/* Logout Button */}
            <button 
              onClick={onLogout}
              className="logout-btn flex items-center gap-2"
              title="Logout"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
