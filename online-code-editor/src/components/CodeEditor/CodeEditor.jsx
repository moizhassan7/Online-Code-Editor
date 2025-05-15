import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { dracula } from '@uiw/codemirror-theme-dracula';
import { FiDownload, FiCode, FiX, FiEye, FiFile, FiFolderPlus } from 'react-icons/fi';
import { TbZip } from 'react-icons/tb';
import LivePreview from './LivePreview';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { loadProject, saveProject, createNewProject} from "./projectStorage";
export default function CodeEditor() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [files, setFiles] = useState([]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showAddFileDialog, setShowAddFileDialog] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [showPreview, setShowPreview] = useState(true);
  
  useEffect(() => {
    if (projectId === 'new') {
      const newProj = createNewProject();
      navigate(`/editor/${newProj.id}`);
      return;
    }
    const existing = loadProject(projectId);
    if (!existing) {
      navigate('/dashboard');
      return;
    }
    setProject(existing);
    setFiles(existing.files);
    setProjectName(existing.name);
  }, [projectId, navigate]);

  // Add new file handler
  const handleAddFile = () => {
    const parts = newFileName.split('.');
    if (parts.length < 2) {
      alert('Please include valid file extension (e.g. style.css)');
      return;
    }
    const ext = parts.pop();
    const name = parts.join('.');

    const newFile = {
      name,
      ext,
      content: ext === 'html' ? 
        '<!DOCTYPE html>\n<html>\n<head>\n    <title>Document</title>\n</head>\n<body>\n\n</body>\n</html>' :
        ext === 'css' ? 'body {\n    margin: 0;\n    padding: 0;\n}' :
        '// New JS File'
    };

    const updatedProject = {
      ...project,
      files: [...files, newFile],
      lastModified: new Date().toISOString()
    };

    saveProject(updatedProject);
    setFiles(updatedProject.files);
    setActiveFileIndex(updatedProject.files.length - 1);
    setNewFileName('');
    setShowAddFileDialog(false);
  };
// Delete-file
const handleDeleteFile = (index) => {
  // Check if user actually wants to delete
  if (!window.confirm('Are you sure you want to delete this file?')) {
    return;
  }

  // Prevent deletion if it's the last file
  if (files.length === 1) {
    alert('Project must contain at least one file');
    return;
  }

  // Create updated files array
  const updatedFiles = files.filter((_, i) => i !== index);
  
  // Update project state
  const updatedProject = { ...project, files: updatedFiles };
  saveProject(updatedProject);
  setFiles(updatedFiles);

  // Adjust active file index
  const newActiveIndex = activeFileIndex >= updatedFiles.length 
    ? updatedFiles.length - 1 
    : activeFileIndex;
  setActiveFileIndex(newActiveIndex);
};
  // Auto-save
  const autoSave = useCallback(() => {
    if (!project) return;
    const updated = { ...project, files, lastModified: new Date().toISOString() };
    saveProject(updated);
    setProject(updated);
  }, [files, project]);

  // Handle code edits
  const handleCodeChange = (value) => {
    const updatedFiles = [...files];
    updatedFiles[activeFileIndex].content = value;
    setFiles(updatedFiles);
    autoSave();
  };

  // Export
  const handleExport = async (type) => {
    if (!project) return;
    const htmlFile = files.find(f => f.ext === 'html');
    const cssFile = files.find(f => f.ext === 'css');
    const jsFile = files.find(f => f.ext === 'js');
    
    if (type === 'zip') {
      const zip = new JSZip();
      htmlFile && zip.file(`${htmlFile.name}.html`, htmlFile.content);
      cssFile && zip.file(`${cssFile.name}.css`, cssFile.content);
      jsFile && zip.file(`${jsFile.name}.js`, jsFile.content);
      const blob = await zip.generateAsync({ type: 'blob' });
      saveAs(blob, `${projectName}.zip`);
    } else if (type === 'html' && htmlFile) {
      const blob = new Blob([htmlFile.content], { type: 'text/html' });
      saveAs(blob, `${projectName}.html`);
    }
    setShowExportMenu(false);
  };


  // Rename
  const handleRenameProject = () => {
    if (!project) return;
    const updated = { ...project, name: projectName };
    saveProject(updated);
    setProject(updated);
  };

  if (!project) return <div>Loading...</div>;


  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Header */}
      <div className="flex justify-between items-center bg-gray-800/50 backdrop-blur-sm p-4 border-b border-gray-700">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-3"
        >
         <input
    id="projectName"
    type="text"
    value={projectName}
    onChange={e => setProjectName(e.target.value)}
    onBlur={handleRenameProject}
    onKeyPress={(e) => e.key === 'Enter' && handleRenameProject()}
    className="bg-white/5 text-white text-xl font-semibold px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
    aria-label="Project name"
  />
        </motion.div>

        <div className="flex gap-3 items-center relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 text-gray-300 rounded-lg hover:bg-white/10"
          >
            <FiEye className="w-5 h-5" />
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddFileDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <FiFolderPlus className="w-5 h-5" />
            Add File
          </motion.button>

          <motion.div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 z-index-1"
            >
              <FiDownload className="w-5 h-5" />
              Export
            </motion.button>

            <AnimatePresence>
              {showExportMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 top-12 bg-gray-800/90 backdrop-blur-sm rounded-lg p-2 shadow-xl border border-gray-700"
                >
                  <button 
                    onClick={() => handleExport('zip')}
                    className="flex items-center gap-3 px-4 py-2 w-48 hover:bg-white/5 rounded-md"
                  >
                    <TbZip className="w-5 h-5 text-emerald-400" />
                    <span>Download ZIP</span>
                  </button>
                  
                  <button 
          onClick={() => handleExport('html')}
          className="flex items-center gap-3 px-4 py-2 w-48 hover:bg-white/5 rounded-md"
        >
          <FiFile className="w-5 h-5 text-blue-400" />
          <span>Export HTML</span>
        </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Add File Dialog */}
      <AnimatePresence>
        {showAddFileDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-index 1"
            onClick={() => setShowAddFileDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 w-96 border border-gray-700"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">New File</h2>
                <button 
                  onClick={() => setShowAddFileDialog(false)}
                  className="p-2 hover:bg-white/10 rounded-lg"
                >
                  <FiX className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              
              <input
                type="text"
                placeholder="filename.html"
                className="w-full px-4 py-3 bg-white/5 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 border border-gray-700"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
              />
              
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  onClick={() => setShowAddFileDialog(false)}
                  className="px-4 py-2 text-gray-300 hover:bg-white/5 rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddFile}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Create File
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex bg-gray-800/50 backdrop-blur-sm p-2 border-b border-gray-700">
        {files.map((f, idx) => (
          <motion.button
            key={`${f.name}-${f.ext}-${idx}`}
            whileHover={{ scale: 1.05 }}
            onClick={() => setActiveFileIndex(idx)}
            className={`px-4 py-2 rounded-lg mr-2 flex items-center gap-2 ${
              idx === activeFileIndex 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
            
          >
            <FiCode className="w-4 h-4" />
            {f.name}.{f.ext}
            <button
        onClick={(e) => {
          e.stopPropagation();
          handleDeleteFile(idx);
        }}
        className="ml-2 hover:bg-white/10 p-1 rounded"
        aria-label={`Delete ${f.name}.${f.ext}`}
      >
        <FiX className="w-3 h-3" />
      </button>
          </motion.button>
        ))}
      </div>

      {/* Editor & Preview */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto">
          <CodeMirror
            value={files[activeFileIndex]?.content || ''}
            height="100%"
            extensions={[
              files[activeFileIndex]?.ext === 'html' ? html() :
              files[activeFileIndex]?.ext === 'css'  ? css() :
              javascript({ jsx: true })
            ]}
            theme={dracula}
            onChange={handleCodeChange}
            basicSetup={{ 
              lineNumbers: true,
              foldGutter: true,
              highlightActiveLineGutter: true,
              autocompletion: true
            }}
            style={{ fontSize: '14px' }}
          />
        </div>

        {showPreview && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            className="flex-1 bg-white border-l border-gray-700"
          >
            <LivePreview
              html={files.find(f => f.ext === 'html')?.content || ''}
              css={files.find(f => f.ext === 'css')?.content || ''}
              js={files.find(f => f.ext === 'js')?.content || ''}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}