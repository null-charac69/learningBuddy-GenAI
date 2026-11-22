import React from 'react';
import { FiCpu, FiFileText, FiUser } from 'react-icons/fi';
import Markdown from '../common/Markdown';

const ChatMessage = ({ message, sender, sources = [], error }) => {
  const isUser = sender === 'user';

  return (
    <div className={`flex items-start gap-3 mb-5 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${isUser ? 'bg-highlight' : 'bg-accent'}`}>
        {isUser ? <FiUser /> : <FiCpu />}
      </div>
      <div className={`max-w-[85%] md:max-w-[75%] ${isUser ? 'text-right' : ''}`}>
        <div
          className={`inline-block text-left px-4 py-3 rounded-lg ${
            isUser ? 'bg-highlight text-white whitespace-pre-wrap' : error ? 'bg-danger/15 border border-danger/50 text-red-200' : 'bg-accent'
          }`}
        >
          {isUser || error ? message : <Markdown>{message}</Markdown>}
        </div>
        {sources.length > 0 && (
          <div className="mt-2 space-y-1">
            {sources.map((s, i) => (
              <details key={`${s.document_id}-${i}`} className="text-xs text-text-secondary">
                <summary className="cursor-pointer hover:text-text inline-flex items-center gap-1.5">
                  <span className="text-blue-300 font-semibold">[{i + 1}]</span>
                  <FiFileText /> {s.filename}
                </summary>
                <p className="mt-1 pl-5 italic">{s.snippet}</p>
              </details>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
