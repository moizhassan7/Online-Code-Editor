export const loadProjects = () => {
  return JSON.parse(localStorage.getItem('projects') || '[]');
};

// Load a single project by ID
export const loadProject = (projectId) => {
  const projects = loadProjects();
  return projects.find(p => p.id === projectId);
};

// Save updates to a project
export const saveProject = (project) => {
  const projects = loadProjects();
  const index = projects.findIndex(p => p.id === project.id);
  if (index >= 0) {
    projects[index] = {
      ...project,
      lastModified: new Date().toISOString()
    };
  }
  localStorage.setItem('projects', JSON.stringify(projects));
};

export const createNewProject = () => {
  const defaultProject = {
    id: Date.now().toString(),
    name: 'Untitled Project',
    files: [
      { name: 'index', ext: 'html', content: '<!-- Add HTML here -->' },
      { name: 'style', ext: 'css', content: '/* Add CSS here */' },
      { name: 'script', ext: 'js', content: '// Add JavaScript here' }
    ],
    lastModified: new Date().toISOString()
  };

  const projects = loadProjects();
  projects.push(defaultProject);
  localStorage.setItem('projects', JSON.stringify(projects));
  return defaultProject;
};

// Add a new file to an existing project
export const addFileToProject = (projectId, fileName) => {
  const projects = loadProjects();
  const project = projects.find(p => p.id === projectId);
  
  if (!project) return null;

  if (!fileName.includes('.')) {
    throw new Error('Filename must include extension');
  }

  const [name, ext] = fileName.split('.');
  const newFile = {
    name,
    ext,
    content: ext === 'html' ? '<!-- New File -->' :
             ext === 'css'  ? '/* New Styles */' :
             '// New Script'
  };

  project.files.push(newFile);
  project.lastModified = new Date().toISOString();
  localStorage.setItem('projects', JSON.stringify(projects));
  return newFile;
};