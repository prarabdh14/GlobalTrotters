import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Globe, User, LogOut, Menu, X } from 'lucide-react'

const Header = ({ user, onLogout }) => {
  const location = useLocation()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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
          <Link to="/dashboard" className="logo flex items-center gap-3 animate-fade-in-left">
            <div className="relative">
              <Globe size={32} className="text-blue-600 animate-pulse" />
              <div className="absolute inset-0 bg-blue-400 rounded-full opacity-20 animate-ping"></div>
            </div>
            <span className="gradient-text">GlobeTrotter</span>
          </Link>
          
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
            </ul>
          </nav>

          <div className="flex items-center gap-4 animate-fade-in-right">
            <Link 
              to="/profile" 
              className="hidden md:flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-all duration-300 hover:scale-105"
            >
              <div className="relative">
                <User size={20} />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              {user?.name || 'Profile'}
            </Link>
            
            <button 
              onClick={onLogout}
              className="hidden md:flex items-center gap-2 text-gray-600 hover:text-red-600 transition-all duration-300 hover:scale-105"
            >
              <LogOut size={20} />
              Logout
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${
          isMobileMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <nav className="py-4 space-y-2">
            <Link 
              to="/dashboard" 
              className="block px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link 
              to="/my-trips" 
              className="block px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              My Trips
            </Link>
            <Link 
              to="/search/cities" 
              className="block px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Explore
            </Link>
            <Link 
              to="/profile" 
              className="block px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Profile
            </Link>
            <button 
              onClick={() => {
                onLogout()
                setIsMobileMenuOpen(false)
              }}
              className="block w-full text-left px-4 py-2 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              Logout
            </button>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
