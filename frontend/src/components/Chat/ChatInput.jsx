import React, { useEffect, useState } from 'react';
import { FiMic, FiMicOff, FiSend } from 'react-icons/fi';
import useSpeechRecognition from '../../hooks/useSpeechRecognition';

const ChatInput = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');
  const { transcript, isListening, isSupported, startListening, stopListening, setTranscript } =
    useSpeechRecognition();

  useEffect(() => {
    if (transcript) setMessage(transcript);
  }, [transcript]);

  const submit = () => {
    if (!message.trim() || disabled) return;
    if (isListening) stopListening();
    onSendMessage(message.trim());
    setMessage('');
    setTranscript('');
  };

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); submit(); }}
      className="p-4 border-t border-accent"
    >
      <div className="flex items-end gap-2">
        <textarea
          rows={1}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
          }}
          className="input resize-none max-h-40"
          placeholder={isListening ? 'Listening…' : 'Ask about your material (Shift+Enter for a new line)'}
          aria-label="Message"
        />
        {isSupported && (
          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            title={isListening ? 'Stop listening' : 'Voice input'}
            aria-label={isListening ? 'Stop listening' : 'Start voice input'}
            className={`btn-ghost px-3 ${isListening ? 'text-red-300 border-red-400 animate-pulse' : ''}`}
          >
            {isListening ? <FiMicOff /> : <FiMic />}
          </button>
        )}
        <button type="submit" disabled={disabled || !message.trim()} className="btn-primary px-4" aria-label="Send">
          <FiSend />
        </button>
      </div>
    </form>
  );
};

export default ChatInput;
