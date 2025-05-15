import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiFolder, FiClock, FiTrash2, FiArrowRight } from 'react-icons/fi';
import { formatDate } from '../utils/helpers';

export default function ProjectCard({ project, onDelete }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5 }}
      className="group relative bg-gradient-to-br from-white to-indigo-50 border border-indigo-100 rounded-2xl p-6 transition-all hover:border-indigo-200 hover:shadow-lg"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 rounded-xl">
            <FiFolder className="text-indigo-600 w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 truncate">
            {project.name.split('_')[0]}
          </h3>
        </div>
        <button
          onClick={() => onDelete(project.id)}
          className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
          title="Delete project"
        >
          <FiTrash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <FiClock className="text-gray-400" />
        <span>Last modified: {formatDate(project.lastModified)}</span>
      </div>

      <div className="absolute bottom-4 right-4">
        <Link
          to={`/editor/${project.id}`}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 group/link"
        >
          <span className="font-medium">Open Project</span>
          <FiArrowRight className="w-5 h-5 transition-transform group-hover/link:translate-x-1" />
        </Link>
      </div>
      
    </motion.div>
  );
}