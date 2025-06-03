const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const app = express();
const http = require('http');
const { Server } = require('socket.io');



app.use(express.json());
app.use(cors());

// Configure CORS
app.use(cors({
  origin: 'http://localhost:5001', // Your frontend URL
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
// /api/auth/signup
//Registers a new user in the database.
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
///api/auth/login
// Verifies the provided user credentials (email and password).
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
///api/auth/me
//Retrieves and returns the information of the currently logged-in user.
app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json(req.user);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5001", // Update with your client URL
    methods: ["GET", "POST"]
  }
});
const projectRooms = {};

io.on('connection', (socket) => {
  const { projectId } = socket.handshake.query;
  
  if (!projectRooms[projectId]) {
    projectRooms[projectId] = { users: new Set() };
  }

  socket.join(projectId);
  projectRooms[projectId].users.add(socket.id);

  socket.on('chatMessage', (message) => {
    io.to(projectId).emit('chatMessage', message);
  });
socket.on('codeChange', ({ projectId, files }) => {
    socket.to(projectId).emit('codeUpdate', { files });
  });
  socket.on('requestInitialState', async (callback) => {
    const roomSockets = await io.in(projectId).fetchSockets();
    if (roomSockets.length > 1) {
      const firstSocket = roomSockets[0];
      firstSocket.emit('provideInitialState', (state) => {
        callback(state);
      });
    } else {
      callback(null);
    }
  });
  socket.on('provideInitialState', (callback) => {
    callback({ files: project.files, activeFileIndex: 0 });
  });
  socket.on('disconnect', () => {
    projectRooms[projectId]?.users.delete(socket.id);
    if (projectRooms[projectId]?.users.size === 0) {
      delete projectRooms[projectId];
    }
  });
});

server.listen(4000, () => {
  console.log('Chat server running on port 4000');
});