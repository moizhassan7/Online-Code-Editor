import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5000", // Update with your client URL
    methods: ["GET", "POST"]
  }
});

// Store active projects and users
const activeProjects = new Map();

io.on('connection', (socket) => {
  console.log('New connection:', socket.id);

  socket.on('join_project', (projectId) => {
    // Create project if not exists
    if (!activeProjects.has(projectId)) {
      activeProjects.set(projectId, {
        content: '',
        users: new Set()
      });
    }
    
    const project = activeProjects.get(projectId);
    project.users.add(socket.id);
    socket.join(projectId);
    
    console.log(`User ${socket.id} joined project ${projectId}`);
    
    // Send current content to new user
    socket.emit('content_update', project.content);
    
    // Update user list for everyone
    io.to(projectId).emit('users_update', Array.from(project.users));
  });

  socket.on('content_change', ({ projectId, content }) => {
    const project = activeProjects.get(projectId);
    if (project) {
      project.content = content;
      socket.to(projectId).emit('content_update', content);
    }
  });

  socket.on('disconnect', () => {
    activeProjects.forEach((project, projectId) => {
      if (project.users.has(socket.id)) {
        project.users.delete(socket.id);
        io.to(projectId).emit('users_update', Array.from(project.users));
      }
    });
  });
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Socket server running on port ${PORT}`);
});