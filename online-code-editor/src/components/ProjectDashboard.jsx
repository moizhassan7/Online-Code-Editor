import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { FaBars, FaTimes, FaTrash, FaEdit, FaComment, FaPaperPlane, FaPlus, FaDownload, FaFileCode } from 'react-icons/fa';
import JSZip from 'jszip';
import { io } from 'socket.io-client';

const getLanguageFromExtension = (filename) => {
  const extension = filename.split('.').pop();
  const languageMap = {
    js: 'javascript',
    html: 'html',
    css: 'css',
    json: 'json',
    md: 'markdown',
    py: 'python',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
  };
  return languageMap[extension] || 'plaintext';
};

const ChatPanel = ({ 
  messages, 
  newMessage, 
  onMessageChange, 
  onSendMessage, 
  onClose,
  users
}) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <div className="chat-title">
          <FaComment className="chat-icon" />
          <span>Project Chat ({users.length} online)</span>
        </div>
        <button className="chat-close-btn" onClick={onClose}>
          ×
        </button>
      </div>
      
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender === 'You' ? 'sent' : 'received'}`}>
            <div className="message-sender">
              {msg.sender}
            </div>
            <div className="message-content">
              {msg.message}
            </div>
            <div className="message-time">
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="chat-input-container">
        <div className="chat-input-wrapper">
          <input
            type="text"
            value={newMessage}
            onChange={onMessageChange}
            placeholder="Type a message..."
            className="chat-input"
            onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
          />
          <button
            onClick={onSendMessage}
            className="chat-send-btn"
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>
      
      <style jsx>{`
        .chat-panel {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 320px;
          background-color: white;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          z-index: 1000;
          overflow: hidden;
          font-family: 'Inter', sans-serif;
        }
        
        .chat-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 14px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .chat-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
        }
        
        .chat-icon {
          font-size: 14px;
        }
        
        .chat-close-btn {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 18px;
          padding: 0;
          line-height: 1;
        }
        
        .chat-messages {
          height: 300px;
          overflow-y: auto;
          padding: 12px;
          background-color: #f8f9fa;
        }
        
        .message {
          margin-bottom: 12px;
          max-width: 85%;
        }
        
        .message.sent {
          margin-left: auto;
        }
        
        .message.received {
          margin-right: auto;
        }
        
        .message-sender {
          font-weight: 600;
          font-size: 13px;
          margin-bottom: 4px;
          color: #667eea;
        }
        
        .message.sent .message-sender {
          color: #764ba2;
          text-align: right;
        }
        
        .message-content {
          padding: 8px 12px;
          border-radius: 12px;
          font-size: 14px;
          line-height: 1.4;
          word-break: break-word;
        }
        
        .message.sent .message-content {
          background: #e0e7ff;
          border-top-right-radius: 4px;
          color: #4c51bf;
        }
        
        .message.received .message-content {
          background: white;
          border-top-left-radius: 4px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .message-time {
          font-size: 11px;
          color: #9ca3af;
          margin-top: 4px;
          text-align: right;
        }
        
        .chat-input-container {
          padding: 12px;
          border-top: 1px solid #e5e7eb;
          background: white;
        }
        
        .chat-input-wrapper {
          display: flex;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .chat-input {
          flex: 1;
          padding: 10px 16px;
          border: none;
          background: #f3f4f6;
          font-size: 14px;
        }
        
        .chat-input:focus {
          outline: none;
          background: #e5e7eb;
        }
        
        .chat-send-btn {
          padding: 0 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  );
};

function ProjectDashboard() {
  const [projects, setProjects] = useState(JSON.parse(localStorage.getItem('projects')) || []);
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [code, setCode] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [socket, setSocket] = useState(null);
  const [showFileDialog, setShowFileDialog] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatUsers, setChatUsers] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const editorRef = useRef(null);

  // Load projects from localStorage
  useEffect(() => {
    const storedProjects = localStorage.getItem('projects');
    if (storedProjects) {
      setProjects(JSON.parse(storedProjects));
    }
  }, []);

  // Save projects to localStorage
  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);

  // Load files for selected project
  useEffect(() => {
    if (selectedProject) {
      const storedFiles = localStorage.getItem(`files-${selectedProject.id}`);
      if (storedFiles) {
        setFiles(JSON.parse(storedFiles));
      } else {
        setFiles([]);
      }
    }
  }, [selectedProject]);

  // Save files for selected project
  useEffect(() => {
    if (selectedProject) {
      localStorage.setItem(`files-${selectedProject.id}`, JSON.stringify(files));
    }
  }, [files, selectedProject]);

  // Initialize Socket.IO connection
  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Join room and handle code changes
  useEffect(() => {
    if (selectedProject && selectedFile && socket) {
      const roomData = {
        projectId: selectedProject.id,
        fileName: selectedFile.name
      };
      
      socket.emit('joinRoom', roomData);

      const handleCodeUpdate = (updatedCode) => {
        setCode(updatedCode);
        setFiles(prevFiles => 
          prevFiles.map(f => 
            f.name === selectedFile.name ? { ...f, content: updatedCode } : f
          )
        );
      };

      socket.on('codeChange', handleCodeUpdate);

      return () => {
        socket.off('codeChange', handleCodeUpdate);
        socket.emit('leaveRoom', roomData);
      };
    }
  }, [selectedProject, selectedFile, socket]);

  // Handle chat functionality
  useEffect(() => {
    if (!socket || !selectedProject) return;

    // Join chat room when project is selected
    socket.emit('joinChatRoom', selectedProject.id);

    // Listen for new messages
    const handleNewMessage = (message) => {
      setMessages(prev => [...prev, message]);
    };

    // Listen for user list updates
    const handleUserUpdate = (users) => {
      setChatUsers(users);
    };

    socket.on('receiveMessage', handleNewMessage);
    socket.on('chatUsersUpdate', handleUserUpdate);

    return () => {
      socket.off('receiveMessage', handleNewMessage);
      socket.off('chatUsersUpdate', handleUserUpdate);
      if (selectedProject) {
        socket.emit('leaveChatRoom', selectedProject.id);
      }
    };
  }, [socket, selectedProject]);

  const handleCreateProject = () => {
    if (newProjectName.trim() !== '') {
      const newProject = { id: Date.now(), name: newProjectName };
      setProjects([...projects, newProject]);
      setNewProjectName('');
      setSelectedProject(newProject);
      setFiles([]);
    }
  };

  const handleDeleteProject = (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      setProjects(projects.filter(project => project.id !== projectId));
      localStorage.removeItem(`files-${projectId}`);
      setSelectedProject(null);
      setFiles([]);
      setCode('');
    }
  };

  const handleRenameProject = (projectId) => {
    const newName = prompt('Enter new project name:');
    if (newName && newName.trim() !== '') {
      setProjects(projects.map(project =>
        project.id === projectId ? { ...project, name: newName.trim() } : project
      ));
    }
  };

  const handleSelectProject = (project) => {
    setSelectedProject(project);
    const storedFiles = localStorage.getItem(`files-${project.id}`);
    setFiles(storedFiles ? JSON.parse(storedFiles) : []);
    setSelectedFile(null);
    setCode('');
    setMessages([]);
  };

  const handleCreateFile = () => {
    if (newFileName.trim() === '') {
      setErrorMessage('File name cannot be empty');
      return;
    }
    
    if (files.some(file => file.name === newFileName.trim())) {
      setErrorMessage('File name already exists');
      return;
    }

    const newFile = { 
      name: newFileName.trim(), 
      language: getLanguageFromExtension(newFileName), 
      content: '' 
    };
    
    setFiles([...files, newFile]);
    setSelectedFile(newFile);
    setCode('');
    setNewFileName('');
    setErrorMessage('');
    setShowFileDialog(false);
  };

  const handleFileDialogClose = () => {
    setShowFileDialog(false);
    setNewFileName('');
    setErrorMessage('');
  };

  const handleDeleteFile = (fileName) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      setFiles(files.filter(file => file.name !== fileName));
      if (selectedFile && selectedFile.name === fileName) {
        setSelectedFile(null);
        setCode('');
      }
    }
  };

  const handleRenameFile = (fileName) => {
    const newName = prompt('Enter new file name:');
    if (newName && newName.trim() !== '' && !files.some(file => file.name === newName.trim())) {
      setFiles(files.map(file =>
        file.name === fileName ? { 
          ...file, 
          name: newName.trim(), 
          language: getLanguageFromExtension(newName.trim()) 
        } : file
      ));
    } else if (newName && files.some(file => file.name === newName.trim())) {
      alert('File name already exists. Please choose a unique name.');
    }
  };

  const handleSelectFile = (file) => {
    setSelectedFile(file);
    setCode(file.content);
  };

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    setFiles(files.map(f => 
      f.name === selectedFile.name ? { ...f, content: newCode } : f
    ));
    
    if (socket && selectedProject && selectedFile) {
      socket.emit('codeChange', {
        projectId: selectedProject.id,
        fileName: selectedFile.name,
        newCode,
      });
    }
  };

  const handleEditorMount = (editor) => {
    editorRef.current = editor;
  };

  const handleDownload = async () => {
    if (!selectedProject) {
      alert('Please select a project to download');
      return;
    }
    const zip = new JSZip();
    files.forEach(file => zip.file(file.name, file.content));
    const blob = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${selectedProject.name}.zip`;
    link.click();
  };

  const handleSendMessage = () => {
    if (newMessage.trim() === '' || !socket || !selectedProject) return;

    const messageData = {
      projectId: selectedProject.id,
      message: newMessage,
      sender: 'You'
    };

    // Add message to local state immediately
    setMessages(prev => [...prev, {
      ...messageData,
      timestamp: new Date().toISOString()
    }]);
    
    // Send to server
    socket.emit('sendMessage', messageData);
    setNewMessage('');
  };

  const handleMessageChange = (e) => {
    setNewMessage(e.target.value);
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
        </div>
        
        {sidebarOpen && (
          <>
            <div className="sidebar-header">
              <h2>Projects</h2>
              <div className="project-input-group">
                <input 
                  type="text" 
                  value={newProjectName} 
                  onChange={(e) => setNewProjectName(e.target.value)} 
                  placeholder="New project name" 
                  className="project-input"
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateProject()}
                />
                <button 
                  onClick={handleCreateProject} 
                  className="create-project-btn"
                >
                  <FaPlus size={14} />
                </button>
              </div>
            </div>
            
            <div className="project-list">
              {projects.map((project) => (
                <div 
                  key={project.id} 
                  className={`project-item ${selectedProject?.id === project.id ? 'active' : ''}`}
                  onClick={() => handleSelectProject(project)}
                >
                  <span className="project-name">{project.name}</span>
                  <div className="project-actions">
                    <FaEdit 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRenameProject(project.id);
                      }} 
                      className="project-action-icon" 
                    />
                    <FaTrash 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(project.id);
                      }} 
                      className="project-action-icon" 
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="main-content">
        {selectedProject ? (
          <>
            <div className="content-header">
              <h2 className="project-title">{selectedProject.name}</h2>
              <div className="action-buttons">
                <button 
                  onClick={() => setShowFileDialog(true)} 
                  className="action-btn primary"
                >
                  <FaPlus size={12} /> Add File
                </button>
                <button 
                  onClick={handleDownload} 
                  className="action-btn secondary"
                >
                  <FaDownload size={12} /> Export
                </button>
                <button 
                  onClick={() => setShowChat(!showChat)}
                  className={`action-btn ${showChat ? 'active' : ''}`}
                >
                  <FaComment size={12} /> {showChat ? 'Hide Chat' : 'Chat'}
                </button>
              </div>
            </div>
            
            <div className="file-tabs">
              {files.map((file) => (
                <div
                  key={file.name}
                  onClick={() => handleSelectFile(file)}
                  className={`file-tab ${selectedFile?.name === file.name ? 'active' : ''}`}
                >
                  <FaFileCode className="file-icon" />
                  <span className="file-name">{file.name}</span>
                  <div className="file-actions">
                    <FaEdit
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRenameFile(file.name);
                      }}
                      className="file-action-icon"
                    />
                    <FaTrash
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFile(file.name);
                      }}
                      className="file-action-icon"
                    />
                  </div>
                </div>
              ))}
            </div>
            
            {selectedFile ? (
              <div className="editor-container">
                <Editor
                  height="100%"
                  theme="vs-dark"
                  language={selectedFile.language}
                  value={code}
                  onChange={handleCodeChange}
                  onMount={handleEditorMount}
                  options={{ 
                    minimap: { enabled: false },
                    fontSize: 16,
                    
                    scrollBeyondLastLine: false,
                    renderWhitespace: 'selection',
                    padding: { top: 16 }
                  }}
                />
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-content">
                  <h3>No file selected</h3>
                  <p>Select an existing file or create a new one to start editing</p>
                  <button 
                    onClick={() => setShowFileDialog(true)} 
                    className="action-btn primary"
                  >
                    <FaPlus size={12} /> Create File
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-state-content">
              <h3>No project selected</h3>
              <p>Create or select a project to begin coding</p>
              <div className="project-input-group" style={{ maxWidth: '400px', marginTop: '20px' }}>
                <input 
                  type="text" 
                  value={newProjectName} 
                  onChange={(e) => setNewProjectName(e.target.value)} 
                  placeholder="New project name" 
                  className="project-input"
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateProject()}
                />
                <button 
                  onClick={handleCreateProject} 
                  className="create-project-btn"
                >
                  <FaPlus size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* File Creation Dialog */}
      {showFileDialog && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 className="modal-title">Create New File</h3>
            <div className="modal-body">
              <input
                type="text"
                value={newFileName}
                onChange={(e) => {
                  setNewFileName(e.target.value);
                  setErrorMessage('');
                }}
                placeholder="filename.ext (e.g., index.js)"
                className={`modal-input ${errorMessage ? 'error' : ''}`}
                autoFocus
              />
              {errorMessage && (
                <p className="error-message">{errorMessage}</p>
              )}
            </div>
            <div className="modal-footer">
              <button
                onClick={handleFileDialogClose}
                className="modal-btn cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFile}
                className="modal-btn confirm"
              >
                Create File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Panel */}
      {showChat && selectedProject && (
        <ChatPanel
          messages={messages}
          newMessage={newMessage}
          onMessageChange={handleMessageChange}
          onSendMessage={handleSendMessage}
          onClose={() => setShowChat(false)}
          users={chatUsers}
        />
      )}
      
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Fira+Code&display=swap');
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background-color: #f9fafb;
          color: #111827;
        }
        
        .dashboard-container {
          display: flex;
          height: 100vh;
          overflow: hidden;
        }
        
        /* Sidebar styles */
        .sidebar {
          width: 280px;
          background-color: #1f2937;
          color: white;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          position: relative;
          z-index: 10;
        }
        
        .sidebar.closed {
          width: 60px;
        }
        
        .sidebar-toggle {
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #9ca3af;
          transition: all 0.2s;
        }
        
        .sidebar-toggle:hover {
          color: white;
          background-color: #374151;
        }
        
        .sidebar-header {
          padding: 0 20px 20px;
          border-bottom: 1px solid #374151;
        }
        
        .sidebar-header h2 {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 16px;
          color: #f3f4f6;
        }
        
        .project-input-group {
          display: flex;
          gap: 8px;
        }
        
        .project-input {
          flex: 1;
          padding: 8px 12px;
          border-radius: 6px;
          border: 1px solid #374151;
          background-color: #1f2937;
          color: white;
          font-size: 14px;
          transition: all 0.2s;
        }
        
        .project-input:focus {
          outline: none;
          border-color: #4f46e5;
          box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
        }
        
        .create-project-btn {
          width: 36px;
          height: 36px;
          border-radius: 6px;
          background-color: #4f46e5;
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .create-project-btn:hover {
          background-color: #4338ca;
        }
        
        .project-list {
          flex: 1;
          overflow-y: auto;
          padding: 12px 0;
        }
        
        .project-item {
          padding: 10px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .project-item:hover {
          background-color: #374151;
        }
        
        .project-item.active {
          background-color: #4f46e5;
        }
        
        .project-name {
          font-size: 14px;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex: 1;
        }
        
        .project-actions {
          display: flex;
          gap: 8px;
          opacity: 0;
          transition: opacity 0.2s;
        }
        
        .project-item:hover .project-actions {
          opacity: 1;
        }
        
        .project-action-icon {
          color: #9ca3af;
          font-size: 13px;
          cursor: pointer;
          transition: color 0.2s;
        }
        
        .project-action-icon:hover {
          color: white;
        }
        
        /* Main content styles */
        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background-color: white;
        }
        
        .content-header {
          padding: 16px 24px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .project-title {
          font-size: 20px;
          font-weight: 600;
          color: #111827;
        }
        
        .action-buttons {
          display: flex;
          gap: 12px;
        }
        
        .action-btn {
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid transparent;
        }
        
        .action-btn.primary {
          background-color: #4f46e5;
          color: white;
          border-color: #4f46e5;
        }
        
        .action-btn.primary:hover {
          background-color: #4338ca;
        }
        
        .action-btn.secondary {
          background-color: white;
          color: #4f46e5;
          border-color: #d1d5db;
        }
        
        .action-btn.secondary:hover {
          background-color: #f9fafb;
          border-color: #9ca3af;
        }
        
        .action-btn.active {
          background-color: #e0e7ff;
          color: #4f46e5;
        }
        
        .file-tabs {
          display: flex;
          padding: 0 24px;
          border-bottom: 1px solid #e5e7eb;
          overflow-x: auto;
          background-color: #f9fafb;
        }
        
        .file-tab {
          padding: 10px 16px;
          border-radius: 6px 6px 0 0;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #6b7280;
          border: 1px solid transparent;
          border-bottom: none;
          margin-right: 4px;
          background-color: #f3f4f6;
          transition: all 0.2s;
        }
        
        .file-tab:hover {
          color: #4f46e5;
          background-color: #e5e7eb;
        }
        
        .file-tab.active {
          background-color: white;
          color: #111827;
          border-color: #e5e7eb;
          border-bottom-color: white;
          font-weight: 500;
        }
        
        .file-icon {
          font-size: 14px;
          color: #9ca3af;
        }
        
        .file-tab.active .file-icon {
          color: #4f46e5;
        }
        
        .file-name {
          white-space: nowrap;
        }
        
        .file-actions {
          display: flex;
          gap: 8px;
          margin-left: 8px;
          opacity: 0;
          transition: opacity 0.2s;
        }
        
        .file-tab:hover .file-actions {
          opacity: 1;
        }
        
        .file-action-icon {
          font-size: 12px;
          color: #9ca3af;
          cursor: pointer;
          transition: color 0.2s;
        }
        
        .file-action-icon:hover {
          color: #4f46e5;
        }
        
        .editor-container {
          flex: 1;
          overflow: hidden;
        }
        
        /* Empty state styles */
        .empty-state {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f9fafb;
        }
        
        .empty-state-content {
          text-align: center;
          max-width: 400px;
          padding: 24px;
        }
        
        .empty-state h3 {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 8px;
          color: #111827;
        }
        
        .empty-state p {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 16px;
        }
        
        /* Modal styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .modal {
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          width: 100%;
          max-width: 400px;
          overflow: hidden;
        }
        
        .modal-title {
          padding: 20px 24px;
          font-size: 18px;
          font-weight: 600;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .modal-body {
          padding: 20px 24px;
        }
        
        .modal-input {
          width: 100%;
          padding: 10px 12px;
          border-radius: 6px;
          border: 1px solid #d1d5db;
          font-size: 14px;
          transition: all 0.2s;
        }
        
        .modal-input:focus {
          outline: none;
          border-color: #4f46e5;
          box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
        }
        
        .modal-input.error {
          border-color: #ef4444;
        }
        
        .error-message {
          color: #ef4444;
          font-size: 13px;
          margin-top: 8px;
        }
        
        .modal-footer {
          padding: 16px 24px;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          border-top: 1px solid #e5e7eb;
          background-color: #f9fafb;
        }
        
        .modal-btn {
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .modal-btn.cancel {
          background-color: white;
          color: #4b5563;
          border: 1px solid #d1d5db;
        }
        
        .modal-btn.cancel:hover {
          background-color: #f3f4f6;
        }
        
        .modal-btn.confirm {
          background-color: #4f46e5;
          color: white;
          border: 1px solid #4f46e5;
        }
        
        .modal-btn.confirm:hover {
          background-color: #4338ca;
        }
      `}</style>
    </div>
  );
}

export default ProjectDashboard;