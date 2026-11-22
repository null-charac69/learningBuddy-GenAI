
import React, { useState, useEffect } from 'react';
import { FiSend, FiMic, FiMicOff } from 'react-icons/fi';
import useSpeechRecognition from '../../hooks/useSpeechRecognition';

const ChatInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const { transcript, isListening, isSupported, startListening, stopListening, setTranscript } =
    useSpeechRecognition();

  // Sync transcript into input field
  useEffect(() => {
    if (transcript) setMessage(transcript);
  }, [transcript]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
      setTranscript('');
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-secondary">
      <div className="relative flex items-center gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 bg-accent text-text rounded-full py-3 px-4 pr-20 focus:outline-none focus:ring-2 focus:ring-highlight"
          placeholder={isListening ? 'Listening...' : 'Type your message...'}
        />

        {/* Mic button */}
        {isSupported && (
          <button
            type="button"
            onClick={handleMicClick}
            title={isListening ? 'Stop listening' : 'Start voice input'}
            className={`absolute right-12 top-1/2 transform -translate-y-1/2 transition-colors ${
              isListening
                ? 'text-red-500 animate-pulse'
                : 'text-gray-400 hover:text-highlight'
            }`}
          >
            {isListening ? <FiMicOff className="text-xl" /> : <FiMic className="text-xl" />}
          </button>
        )}

        {/* Send button */}
        <button
          type="submit"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-highlight transition-colors"
        >
          <FiSend className="text-2xl" />
        </button>
      </div>
    </form>
  );
};

export default ChatInput;
