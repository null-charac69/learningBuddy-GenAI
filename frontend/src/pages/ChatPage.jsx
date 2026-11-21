
import React, { useState } from 'react';
import ChatInput from '../components/Chat/ChatInput';
import ChatMessage from '../components/Chat/ChatMessage';
import { sendMessage } from '../services/api';

const ChatPage = () => {
  const [messages, setMessages] = useState([
    { message: "Hello! I am your personal learning assistant. How can I help you today?", sender: 'assistant' }
  ]);

  const handleSendMessage = async (message) => {
    const userMessage = { message, sender: 'user' };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    const response = await sendMessage(userMessage);
    const assistantMessage = { message: response.data.message, sender: 'assistant' };
    setMessages((prevMessages) => [...prevMessages, assistantMessage]);
  };

  return (
    <div className="flex flex-col h-full bg-secondary rounded-lg shadow-lg">
      <div className="flex-1 overflow-y-auto p-6">
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg.message} sender={msg.sender} />
        ))}
      </div>
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatPage;
