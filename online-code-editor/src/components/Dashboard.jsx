import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiFile, FiFolder, FiAlertCircle } from 'react-icons/fi';
import ProjectCard from './ProjectCard';
import { loadProjects,createNewProject } from '../utils/projectStorage';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showProjDialog, setShowProjDialog] = useState(false);
  const [showFileDialog, setShowFileDialog] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const stored = loadProjects();
    setProjects(stored);
    setIsLoading(false);
  }, []);

  const handleCreateProject = () => {
    if (!projectName.trim()) {
      setError('Please enter a project name');
      return;
    }
    setError('');
    setProjectName(projectName)
    setShowProjDialog(false);
    setShowFileDialog(true);
  };

  const handleCreateFile = () => {
  if (!fileName.includes('.')) {
    setError('Please include an extension (e.g. "index.html")');
    return;
  }

  // Split filename into name and extension
  const [fileBaseName, fileExtension] = fileName.split('.');
  
  if (!fileExtension) {
    setError('Invalid file extension');
    return;
  }

  // Create initial file content based on extension
  const initialContent = {
    html: '<!DOCTYPE html>\n<html>\n<head>\n    <title>Document</title>\n</head>\n<body>\n\n</body>\n</html>',
    css: 'body {\n    margin: 0;\n    padding: 0;\n}',
    js: '// JavaScript code here'
  }[fileExtension] || '';

  const newProject = createNewProject(projectName.trim(), [
    {
      name: fileBaseName || 'index',
      ext: fileExtension,
      content: initialContent
    }
  ]);

  setProjectName('');
  setFileName('');
  setShowFileDialog(false);
  navigate(`/editor/${newProject.id}`);
};

  const handleDeleteProject = (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      const updated = projects.filter(p => p.id !== projectId);
      localStorage.setItem('projects', JSON.stringify(updated));
      setProjects(updated);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-cyan-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="h-12 w-12 rounded-full border-4 border-indigo-500 border-t-transparent"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-cyan-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent"
          >
            Your Workspace
          </motion.h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowProjDialog(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-indigo-200 transition-all"
          >
            <FiPlus className="text-lg" />
            New Project
          </motion.button>
        </div>

        <AnimatePresence>
          {showProjDialog && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-[1000]"
              onClick={() => setShowProjDialog(false)}
            >
              <motion.div
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl z-[1001]"
              >
                <div className="flex items-center gap-3 mb-6 z-[102]">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <FiFolder className="text-indigo-600 text-xl" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">New Project</h2>
                </div>

                <input
                  type="text"
                  placeholder="Project Name"
                  className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />

                {error && (
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg mb-4">
                    <FiAlertCircle />
                    {error}
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowProjDialog(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateProject}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Continue
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showFileDialog && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-[1000]"
              onClick={() => setShowFileDialog(false)}
            >
              <motion.div
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl z-[1001]"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-cyan-100 rounded-lg">
                    <FiFile className="text-cyan-600 text-xl" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">Initial File</h2>
                </div>

                <input
                  type="text"
                  placeholder="Filename (e.g. index.html)"
                  className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                />

                {error && (
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg mb-4">
                    <FiAlertCircle />
                    {error}
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => { setShowFileDialog(false); setShowProjDialog(true); }}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleCreateFile}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Create
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="mb-8 mx-auto w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center">
              <FiFolder className="text-indigo-600 text-3xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No projects found</h3>
            <p className="text-gray-600 mb-6">Start by creating a new project</p>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 z-0 relative"
          >
            <AnimatePresence>
              {projects.map(p => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  onDelete={handleDeleteProject}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}