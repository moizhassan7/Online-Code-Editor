import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiLock, FiMail, FiArrowRight } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function AuthForms({ type }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const { login, signup, isLoading } = useAuth();
  const navigate = useNavigate();
  const isLogin = type === 'login';

  useEffect(() => {
    document.title = isLogin ? 'Login - CodeCollab' : 'Sign Up - CodeCollab';
  }, [isLogin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await signup(
          formData.firstName,
          formData.lastName,
          formData.email,
          formData.password
        );
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-cyan-50 flex items-center justify-center p-4">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={formVariants}
        transition={{ duration: 0.4 }}
        className="bg-white backdrop-blur-lg rounded-2xl shadow-xl w-full max-w-md p-8 border border-white/20"
      >
        <div className="flex items-center justify-center mb-8">
          <div className="bg-indigo-600 w-12 h-12 rounded-lg flex items-center justify-center mr-3">
            <FiArrowRight className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
            CodeCollab
          </h1>
        </div>

        <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-center">
          {isLogin ? 'Welcome Back!' : 'Get Started'}
        </h2>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-3 bg-red-50 text-red-700 rounded-lg flex items-center"
          >
            <FiUser className="mr-2" />
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 gap-4"
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder="First Name"
                  className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 pl-11"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Last Name"
                  className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 pl-11"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </motion.div>
          )}

          <div className="relative">
            <input
              type="email"
              placeholder="Email Address"
              className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 pl-11"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          <div className="relative">
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 pl-11"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isLoading || !formData.email || !formData.password}
          className="w-full bg-gradient-to-r from-indigo-600 to-cyan-500 text-white py-4 px-6 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
        </motion.button>
        </form>

        <p className="mt-8 text-center text-gray-600">
          {isLogin ? (
            <>
              New to CodeCollab?{' '}
              <Link 
                to="/signup" 
                className="text-indigo-600 hover:text-indigo-800 font-semibold relative group"
              >
                Create account
                <span className="absolute bottom-0 left-0 w-0 h-px bg-indigo-600 transition-all group-hover:w-full"></span>
              </Link>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-indigo-600 hover:text-indigo-800 font-semibold relative group"
              >
                Login here
                <span className="absolute bottom-0 left-0 w-0 h-px bg-indigo-600 transition-all group-hover:w-full"></span>
              </Link>
            </>
          )}
        </p>
      </motion.div>
    </div>
  );
}