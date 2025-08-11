import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Globe, User, LogOut } from 'lucide-react'

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
          
          {/* Main Navigation */}
          <nav className="hidden md:block animate-fade-in-down">
            <ul className="nav-links">
              <li className="animate-fade-in-down stagger-1">
                <Link 
                  to="/dashboard" 
                  className={location.pathname === '/dashboard' ? 'active' : ''}
                >
                  Dashboard
                </Link>
              </li>
              <li className="animate-fade-in-down stagger-2">
                <Link 
                  to="/my-trips" 
                  className={location.pathname === '/my-trips' ? 'active' : ''}
                >
                  My Trips
                </Link>
              </li>
              <li className="animate-fade-in-down stagger-3">
                <Link 
                  to="/search/cities" 
                  className={location.pathname.includes('/search') ? 'active' : ''}
                >
                  Explore
                </Link>
              </li>
              <li className="animate-fade-in-down stagger-4">
                <Link 
                  to="/profile" 
                  className={location.pathname === '/profile' ? 'active' : ''}
                >
                  Profile
                </Link>
              </li>
            </ul>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3 animate-fade-in-right">
            {/* Logout Button */}
            <button 
              onClick={onLogout}
              className="logout-btn hidden md:flex items-center gap-2"
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
