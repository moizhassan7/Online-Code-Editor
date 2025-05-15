import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCode, FiUsers, FiVideo, FiShare } from 'react-icons/fi';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 text-white">
      <div className="container mx-auto px-4 py-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="inline-block mb-8">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl">
              <FiCode className="w-12 h-12 text-cyan-400 mx-auto" />
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
            Code Together in Real-Time
          </h1>
          
          <p className="text-xl text-cyan-100 mb-12 max-w-3xl mx-auto">
            Collaborate seamlessly on web projects with live code editing, instant chat, and integrated video calls.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-24">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                to="/signup" 
                className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-indigo-600 px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-cyan-500/30 transition-all"
              >
                <FiShare className="w-5 h-5" />
                Get Started
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                to="/login" 
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/20 transition-all"
              >
                <FiUsers className="w-5 h-5" />
                Existing User
              </Link>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-left">
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white/5 p-6 rounded-xl backdrop-blur-sm border border-white/10"
            >
              <FiCode className="w-8 h-8 text-cyan-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Live Coding</h3>
              <p className="text-cyan-100">Real-time code collaboration with syntax highlighting</p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white/5 p-6 rounded-xl backdrop-blur-sm border border-white/10"
            >
              <FiVideo className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Video Chat</h3>
              <p className="text-cyan-100">Integrated video calls for seamless communication</p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white/5 p-6 rounded-xl backdrop-blur-sm border border-white/10"
            >
              <FiShare className="w-8 h-8 text-indigo-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Share Instantly</h3>
              <p className="text-cyan-100">Quick project sharing with secure access control</p>
            </motion.div>
          </div>

          <div className="mt-24 border-t border-white/10 pt-12 text-center">
            <p className="text-cyan-200">
              Trusted by developers at leading tech companies worldwide
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}