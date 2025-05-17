const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const Project = require('./src/models/Project');
const projectRoutes = require('./src/routes/project');
const { Server } = require('socket.io');
const http = require("http");
const app = express();
app.use(express.json());
app.use(cors());

// Configure CORS
app.use(cors({
  origin: 'http://localhost:5002', // Your frontend URL
  credentials: true
}));
// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codecollab')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// User Schema
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Middleware
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId);
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword
    });
    
    await user.save();
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });
    
    res.status(201).json({ token, user: {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    }});
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });
    
    res.json({ token, user: {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    }});
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json(req.user);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


// const PORT = process.env.PORT || 5888; 



// Routes for project


// Create a new project
// app.post('/projects',  async (req, res) => {
//   try {
//     const newProject = new Project({
//       name: req.body.name,
//       files: [],
//       owner: req.user._id,
//     });
//     await newProject.save();
//     res.status(201).json(newProject);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// // Update a project
// app.put('/projects/:id',  async (req, res) => {
//   try {
//     const updatedProject = await Project.findOneAndUpdate(
//       { _id: req.params.id, owner: req.user._id },
//       req.body,
//       { new: true }
//     );
//     if (!updatedProject) return res.status(404).json({ error: 'Project not found or unauthorized' });
//     res.json(updatedProject);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// // Add a new file to a project
// // Update file creation endpoint response
// app.post('/projects/:id/files',async (req, res) => {
//   try {
//     const project = await Project.findOne({ _id: req.params.id, owner: req.user._id })
//       .populate('owner')
//       .lean();

//     const newFile = {
//       name: req.body.name,
//       ext: req.body.ext,
//       content: req.body.content
//     };

//     const updatedProject = await Project.findByIdAndUpdate(
//       req.params.id,
//       { $push: { files: newFile } },
//       { new: true }
//     );

//     res.status(201).json({
//       ...updatedProject.toObject(),
//       _id: updatedProject._id.toString()
//     });
    
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });
// // Add these after MongoDB connection

// // Real-time Collaboration Logic
// io.on('connection', (socket) => {
//   let currentRoom = null;

//   socket.on('joinProject', async ({ projectId, fileName }) => {
//     try {
//       // Leave previous room
//       if (currentRoom) {
//         socket.leave(currentRoom);
//       }

//       // Join new room (projectId + fileName combination)
//       currentRoom = `${projectId}_${fileName}`;
//       socket.join(currentRoom);
      
//       // Notify others
//       socket.to(currentRoom).emit('userJoined', socket.id);

//     } catch (error) {
//       console.error('Join error:', error);
//     }
//   });

//   socket.on('codeChange', async ({ projectId, fileName, newCode }) => {
//     try {
//       // Update database
//       const project = await Project.findById(projectId);
//       const fileIndex = project.files.findIndex(f => 
//         `${f.name}.${f.ext}` === fileName
//       );
      
//       if (fileIndex > -1) {
//         project.files[fileIndex].content = newCode;
//         await project.save();
        
//         // Broadcast to room
//         socket.to(`${projectId}_${fileName}`).emit('codeUpdate', {
//           fileName,
//           newCode,
//           sender: socket.id
//         });
//       }
//     } catch (error) {
//       console.error('Code update error:', error);
//     }
//   });

//   socket.on('disconnect', () => {
//     if (currentRoom) {
//       socket.leave(currentRoom);
//     }
//   });
// });
// app.use('/api/projects', projectRoutes);
// io.on('connection', (socket) => {
//   console.log('A user connected:', socket.id);

//   // Join a project room
//   socket.on('joinProject', (projectId) => {
//     socket.join(`project:${projectId}`);
//     console.log(`Socket ${socket.id} joined room project:${projectId}`);
//   });

//   // Handle code changes: broadcast to others & save to DB
//   socket.on('fileChange', async ({ projectId, fileId, content }) => {
//     // Update content in MongoDB
//     await Project.findOneAndUpdate(
//       { _id: projectId, 'files._id': fileId },
//       { $set: { 'files.$.content': content } }
//     );
//     // Broadcast to other clients in the room
//     socket.to(`project:${projectId}`).emit('fileChange', { fileId, content });
//   });

//   // Handle adding a new file
//   socket.on('addFile', async ({ projectId, fileName }) => {
//     const project = await Project.findById(projectId);
//     if (!project) return;
//     project.files.push({ name: fileName, content: '' });
//     const newFile = project.files[project.files.length - 1];
//     await project.save();
//     io.to(`project:${projectId}`).emit('fileAdded', {
//       id: newFile._id.toString(),
//       name: newFile.name,
//       content: newFile.content
//     });
//   });

//   // Handle deleting a file
//   socket.on('deleteFile', async ({ projectId, fileId }) => {
//     await Project.findByIdAndUpdate(projectId, {
//       $pull: { files: { _id: fileId } }
//     });
//     io.to(`project:${projectId}`).emit('fileDeleted', fileId);
//   });

//   socket.on('disconnect', () => {
//     console.log('A user disconnected:', socket.id);
//   });
// });

// Start the server
// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });