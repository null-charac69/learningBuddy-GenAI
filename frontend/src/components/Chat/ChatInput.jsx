
import React, { useState } from 'react';
import { FiSend } from 'react-icons/fi';

const ChatInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-secondary">
      <div className="relative">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full bg-accent text-text rounded-full py-3 px-4 pl-4 focus:outline-none focus:ring-2 focus:ring-highlight"
          placeholder="Type your message..."
        />
        <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-highlight transition-colors">
          <FiSend className="text-2xl" />
        </button>
      </div>
    </form>
  );
};

export default ChatInput;
