const io = require('socket.io')(5000, {
  cors: {
    origin: 'http://localhost:5001',
    methods: ['GET', 'POST'],
  },
});

const projectUsers = {};

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Code collaboration rooms
  socket.on('joinRoom', ({ projectId, fileName }) => {
    const roomId = `${projectId}-${fileName}`;
    socket.join(roomId);
  });

  socket.on('leaveRoom', ({ projectId, fileName }) => {
    const roomId = `${projectId}-${fileName}`;
    socket.leave(roomId);
  });

  socket.on('codeChange', ({ projectId, fileName, newCode }) => {
    const roomId = `${projectId}-${fileName}`;
    socket.to(roomId).emit('codeChange', newCode);
  });
  socket.on('disconnect', () => {
    Object.keys(projectUsers).forEach(projectId => {
      if (projectUsers[projectId].has(socket.id)) {
        projectUsers[projectId].delete(socket.id);
        io.to(`chat_${projectId}`).emit('chatUsersUpdate', {
          count: projectUsers[projectId].size
        });
      }
    });
  });
});
  // // Chat functionality
  // socket.on('joinChatRoom', (projectId) => {
  //   socket.join(`chat_${projectId}`);
    
  //   if (!projectUsers[projectId]) {
  //     projectUsers[projectId] = new Set();
  //   }
  //   projectUsers[projectId].add(socket.id);
    
  //   io.to(`chat_${projectId}`).emit('chatUsersUpdate', {
  //     count: projectUsers[projectId].size
  //   });
  // });

  // socket.on('sendMessage', ({ projectId, message }) => {
  //   const timestamp = new Date().toISOString();
    
  //   // Broadcast to others in the room
  //   socket.to(`chat_${projectId}`).emit('receiveMessage', {
  //     sender: 'Other User',
  //     message,
  //     timestamp
  //   });
    
  //   // Send back to sender
  //   // socket.emit('receiveMessage', {
  //   //   sender: 'You',
  //   //   message,
  //   //   timestamp
  //   // });
  // });
  
  


const style ={
  name: "red",
  code: "#ffff"
}
