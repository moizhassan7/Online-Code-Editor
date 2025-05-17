// projectStorage.js

export const loadProjects = () => {
  return JSON.parse(localStorage.getItem('projects') || '[]');
};

export const loadProject = (projectId) => {
  const projects = loadProjects();
  return projects.find(p => p.id === projectId);
};

export const saveProject = (project) => {
  const projects = loadProjects();
  const index = projects.findIndex(p => p.id === project.id);
  
  if (index >= 0) {
    // Update existing project
    projects[index] = {
      ...project,
      lastModified: new Date().toISOString()
    };
  } else {
    // Add new project
    projects.push(project);
  }
  
  localStorage.setItem('projects', JSON.stringify(projects));
};

export const createNewProject = (name = 'Untitled Project', initialFiles = []) => {
  const defaultFiles = [
    { name: 'index', ext: 'html', content: '<!-- Add HTML here -->' },
    { name: 'style', ext: 'css', content: '/* Add CSS here */' },
    { name: 'script', ext: 'js', content: '// Add JavaScript here' }
  ];

  const newProject = {
    id: Date.now().toString(),
    name: name.trim() || 'Untitled Project',
    files: initialFiles.length > 0 ? initialFiles : defaultFiles,
    lastModified: new Date().toISOString()
  };

  saveProject(newProject);
  return newProject;
};

export const addFileToProject = (projectId, fileName) => {
  const projects = loadProjects();
  const project = projects.find(p => p.id === projectId);

  if (!project) return null;

  const [name, ext] = fileName.split('.');
  const newFile = {
    name: name || 'new-file',
    ext: ext || 'txt',
    content: ext === 'html' ? '<!-- New File -->' :
             ext === 'css'  ? '/* New Styles */' :
             ext === 'js'   ? '// New Script' :
             ''
  };

  project.files.push(newFile);
  saveProject(project);
  return newFile;
};