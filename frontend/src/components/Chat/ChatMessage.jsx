
import React from 'react';
import { FiUser, FiCpu } from 'react-icons/fi';

const ChatMessage = ({ message, sender }) => {
  const isUser = sender === 'user';

  return (
    <div className={`flex items-start mb-4 ${isUser ? 'justify-end' : ''}`}>
      <div className={`flex items-center ${isUser ? 'flex-row-reverse' : ''}`}>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isUser ? 'bg-highlight ml-3' : 'bg-accent mr-3'}`}>
          {isUser ? <FiUser className="text-text" /> : <FiCpu className="text-text" />}
        </div>
        <div className={`px-4 py-2 rounded-lg shadow ${isUser ? 'bg-highlight text-white' : 'bg-accent text-text'}`}>
          {message}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
