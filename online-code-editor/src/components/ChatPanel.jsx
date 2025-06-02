import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageCircle, FiX } from 'react-icons/fi';
import io from 'socket.io-client';

export default function ChatPanel({ projectId, user, showChat, setShowChat }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const socketRef = useRef(null);

  useEffect(() => {
    if (!projectId) return;

    socketRef.current = io('http://localhost:4000', {
      query: { projectId },
    });

    socketRef.current.on('chatMessage', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [projectId]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to send messages');
      return;
    }
    if (newMessage.trim() && socketRef.current) {
      const message = {
        text: newMessage,
        timestamp: new Date().toISOString(),
        sender: {
          id: user.id,
          fname: user.firstName,
          lname: user.lastName
        }
      };
      socketRef.current.emit('chatMessage', message);
      setNewMessage('');
    }
  };

  return (
    <AnimatePresence>
      {showChat && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          className="absolute right-0 top-0 h-full w-96 bg-gradient-to-b from-gray-800 to-gray-900 backdrop-blur-sm border-l border-indigo-500/30 z-10 shadow-2xl"
        >
          <div className="h-full flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-indigo-500/30 flex justify-between items-center bg-gradient-to-r from-indigo-600/20 to-purple-600/20">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <FiMessageCircle className="text-indigo-400" />
                Project Chat
              </h2>
              <button
                onClick={() => setShowChat(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5 text-gray-400 hover:text-indigo-400" />
              </button>
            </div>
            
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, index) => (
                <div 
                  key={index}
                  className={`flex ${msg.sender.id === user.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`p-3 rounded-xl max-w-[80%] ${
                    msg.sender.id === user.id 
                      ? 'bg-indigo-600/80 ml-auto rounded-br-none'
                      : 'bg-gray-700/50 rounded-bl-none'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium ${
                        msg.sender.id === user.id 
                          ? 'text-indigo-200' 
                          : 'text-emerald-300'
                      }`}>
                        {msg.sender.fname} {msg.sender.lname}
                      </span>
                      <span className="text-[0.6rem] text-white/40">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-gray-100 text-sm">{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-indigo-500/30 bg-gray-900/50">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 bg-white/5 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-400"
                  aria-label="Chat message input"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                  <FiMessageCircle className="w-4 h-4" />
                  Send
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}