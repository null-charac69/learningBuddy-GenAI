import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiRefreshCw } from 'react-icons/fi';
import ChatInput from '../components/Chat/ChatInput';
import ChatMessage from '../components/Chat/ChatMessage';
import { Spinner } from '../components/common/ui';
import { errorMessage, listDocuments, sendChat } from '../services/api';

const STORAGE_KEY = 'lb-chat';
const GREETING = {
  greeting: true,
  sender: 'assistant',
  message: "Hi! Ask me anything about the material in your library, and I'll answer with references to your files.",
};
const SUGGESTIONS = ['Summarize my notes in 5 bullet points', 'Explain the hardest concept simply', 'What should I review first?'];

const loadHistory = () => {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || [GREETING];
  } catch {
    return [GREETING];
  }
};

const ChatPage = () => {
  const [messages, setMessages] = useState(loadHistory);
  const [pending, setPending] = useState(false);
  const [docCount, setDocCount] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); } catch { /* storage unavailable */ }
    bottomRef.current?.scrollIntoView?.({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    listDocuments().then(({ data }) => setDocCount(data.length)).catch(() => setDocCount(null));
  }, []);

  const handleSend = async (text) => {
    const history = messages
      .filter((m) => !m.greeting && !m.error)
      .slice(-10)
      .map((m) => ({ role: m.sender, content: m.message }));
    setMessages((prev) => [...prev, { sender: 'user', message: text }]);
    setPending(true);
    try {
      const { data } = await sendChat(text, history);
      setMessages((prev) => [...prev, { sender: 'assistant', message: data.answer, sources: data.sources }]);
    } catch (e) {
      setMessages((prev) => [...prev, { sender: 'assistant', message: errorMessage(e), error: true }]);
    } finally {
      setPending(false);
    }
  };

  const reset = () => setMessages([GREETING]);

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] md:h-[calc(100vh-4rem)] max-w-4xl card">
      <div className="flex items-center justify-between px-6 py-4 border-b border-accent">
        <div>
          <h1 className="text-xl font-bold">Study Chat</h1>
          {docCount === 0 ? (
            <p className="text-sm text-warning">
              Your library is empty, so answers will use general knowledge. <Link to="/library" className="underline">Upload notes</Link>
            </p>
          ) : (
            docCount !== null && <p className="text-sm text-text-secondary">Searching {docCount} document{docCount === 1 ? '' : 's'}</p>
          )}
        </div>
        <button onClick={reset} className="btn-ghost text-sm py-1.5 px-3" title="New conversation">
          <FiRefreshCw /> New
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {messages.map((msg, i) => (
          <ChatMessage key={i} {...msg} />
        ))}
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => handleSend(s)} className="text-sm border border-accent rounded-full px-3 py-1.5 hover:border-highlight">
                {s}
              </button>
            ))}
          </div>
        )}
        {pending && <Spinner label="Thinking…" className="ml-12" />}
        <div ref={bottomRef} />
      </div>

      <ChatInput onSendMessage={handleSend} disabled={pending} />
    </div>
  );
};

export default ChatPage;
