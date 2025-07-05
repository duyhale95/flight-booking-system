import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { FaPlane, FaUser, FaSignOutAlt, FaUserCircle, FaBars, FaTimes, FaChevronDown, FaTicketAlt, FaSearch, FaHistory } from 'react-icons/fa'
import Button from '../ui/Button'

export default function Navbar() {
  const { user, role, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showBookingMenu, setShowBookingMenu] = useState(false)

  const handleLogout = () => {
    logout()
    setShowUserMenu(false)
  }

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-lg shadow-md group-hover:shadow-lg transition-all duration-200">
              <FaPlane className="w-5 h-5 text-white transform group-hover:scale-110 transition-transform duration-200" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              FlightBooking
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/destinations" 
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              Khám phá Việt Nam
            </Link>
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowBookingMenu(!showBookingMenu)}
                  className="flex items-center space-x-1 bg-white text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200"
                >
                  <span>Đặt vé</span>
                  <FaChevronDown className={`w-3 h-3 transition-transform duration-200 ${showBookingMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Booking Dropdown */}
                {showBookingMenu && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <Link
                      to="/bookings"
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                      onClick={() => setShowBookingMenu(false)}
                    >
                      <FaHistory className="w-4 h-4" />
                      Lịch sử đặt vé
                    </Link>
                    <Link
                      to="/"
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                      onClick={() => setShowBookingMenu(false)}
                    >
                      <FaTicketAlt className="w-4 h-4" />
                      Đặt vé trực tuyến
                    </Link>
                    <Link
                      to="/ticket-lookup"
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                      onClick={() => setShowBookingMenu(false)}
                    >
                      <FaSearch className="w-4 h-4" />
                      Tra cứu vé
                    </Link>
                  </div>
                )}
              </div>
            )}
            <Link 
              to="/about" 
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              Giới thiệu
            </Link>
            <Link 
              to="/contact" 
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              Liên hệ
            </Link>
          </div>

          {/* Desktop User Section */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 bg-gray-50 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors duration-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <FaUserCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-xs text-gray-500">
                      Khách hàng
                    </div>
                  </div>
                </button>

                {/* User Dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <FaUser className="w-4 h-4" />
                      Trang cá nhân
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 text-left bg-transparent border-0"
                      style={{backgroundColor: 'transparent'}}
                    >
                      <FaSignOutAlt className="w-4 h-4" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button 
                    variant="outline" 
                    className="px-6 py-2 border-2 border-blue-500 text-blue-600 hover:bg-blue-50 rounded-full font-medium transition-all duration-200"
                  >
                    Đăng nhập
                  </Button>
                </Link>
                <Link to="/register">
                  <Button 
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full font-medium shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    Đăng ký
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
            >
              {showMobileMenu ? (
                <FaTimes className="w-6 h-6" />
              ) : (
                <FaBars className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/destinations"
                className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg"
                onClick={() => setShowMobileMenu(false)}
              >
                Khám phá Việt Nam
              </Link>
              {user && (
                <>
                  <Link
                    to="/bookings"
                    className="flex items-center gap-3 px-3 py-2 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <FaHistory className="w-4 h-4" />
                    Lịch sử đặt vé
                  </Link>
                  <Link
                    to="/"
                    className="flex items-center gap-3 px-3 py-2 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <FaTicketAlt className="w-4 h-4" />
                    Đặt vé trực tuyến
                  </Link>
                  <Link
                    to="/ticket-lookup"
                    className="flex items-center gap-3 px-3 py-2 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <FaSearch className="w-4 h-4" />
                    Tra cứu vé
                  </Link>
                </>
              )}
              <Link
                to="/about"
                className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg"
                onClick={() => setShowMobileMenu(false)}
              >
                Giới thiệu
              </Link>
              <Link
                to="/contact"
                className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg"
                onClick={() => setShowMobileMenu(false)}
              >
                Liên hệ
              </Link>
            </div>

            {/* Mobile User Section */}
            <div className="border-t border-gray-200 pt-4 pb-3">
              {user ? (
                <div className="space-y-3 px-2">
                  <div className="flex items-center space-x-3 px-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                      <FaUserCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-base font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        Khách hàng
                      </div>
                    </div>
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-3 py-2 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <FaUser className="w-5 h-5" />
                    Trang cá nhân
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout()
                      setShowMobileMenu(false)
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg text-left bg-transparent border-0"
                    style={{backgroundColor: 'transparent'}}
                  >
                    <FaSignOutAlt className="w-5 h-5" />
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <div className="space-y-2 px-2">
                  <Link
                    to="/login"
                    className="block w-full"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <Button 
                      variant="outline" 
                      className="w-full px-4 py-3 border-2 border-blue-500 text-blue-600 hover:bg-blue-50 rounded-lg font-medium"
                    >
                      Đăng nhập
                    </Button>
                  </Link>
                  <Link
                    to="/register"
                    className="block w-full"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <Button 
                      className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium"
                    >
                      Đăng ký
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Backdrop for mobile menu */}
      {showMobileMenu && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-40 md:hidden"
          onClick={() => setShowMobileMenu(false)}
        />
      )}

      {/* Backdrop for user menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}

      {/* Backdrop for booking menu */}
      {showBookingMenu && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setShowBookingMenu(false)}
        />
      )}
    </nav>
  )
} 