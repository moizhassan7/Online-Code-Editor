import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaCode, FaUserCircle, FaSignOutAlt, FaHome } from 'react-icons/fa';

export default function Navbar({ isLoggedIn }) {
  const { token, logout, user } = useAuth();
  
  return (
    <nav className="bg-gradient-to-r from-indigo-900 to-blue-900 backdrop-blur-lg border-b border-blue-200/20">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 group"
          >
            <FaCode className="w-8 h-8 text-cyan-400 transition-transform group-hover:rotate-45" />
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              CodeCollab
            </span>
          </Link>

          {/* User Welcome Section */}
          {user && (
            <div className="flex items-center space-x-4">
              <span className="hidden md:inline-flex items-center bg-white/10 px-4 py-2 rounded-full text-sm text-cyan-100 backdrop-blur-sm">
                <FaUserCircle className="mr-2 text-cyan-300" />
                Welcome, {user.firstName} {user.lastName}
              </span>
            </div>
          )}

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            {token ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 group text-cyan-100 hover:text-white transition-colors"
                >
                  <FaHome className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-cyan-400 after:transition-all group-hover:after:w-full">
                    Dashboard
                  </span>
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 bg-cyan-500/20 hover:bg-cyan-500/30 px-4 py-2 rounded-lg transition-all group"
                >
                  <FaSignOutAlt className="w-5 h-5 text-cyan-300 group-hover:rotate-180 transition-transform" />
                  <span className="text-cyan-100 group-hover:text-white">
                    Logout
                  </span>
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-6">
                {!isLoggedIn && (
                  <>
                    <Link
                      to="/login"
                      className="relative text-cyan-100 hover:text-white after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-cyan-400 after:transition-all hover:after:w-full"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-600 transition-colors shadow-lg hover:shadow-cyan-500/30"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}