import React, { useState } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { FiMenu } from 'react-icons/fi';
import ChatPage from './pages/ChatPage';
import DashboardPage from './pages/DashboardPage';
import LibraryPage from './pages/LibraryPage';
import QuizPage from './pages/QuizPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import Sidebar from './components/Layout/Sidebar';
import { Spinner } from './components/common/ui';
import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedLayout = () => {
  const { user, initializing } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner label="Loading your workspace" />
      </div>
    );
  }
  if (!user) return <LoginPage />;

  return (
    <div className="flex min-h-screen bg-primary text-text">
      <Sidebar open={menuOpen} onNavigate={() => setMenuOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center gap-3 p-4 border-b border-secondary">
          <button onClick={() => setMenuOpen((o) => !o)} aria-label="Toggle menu" className="text-2xl">
            <FiMenu />
          </button>
          <span className="font-bold text-highlight">LearningBuddy</span>
        </header>
        <main className="flex-1 p-4 md:p-8 min-h-0">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/upload" element={<Navigate to="/library" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <ProtectedLayout />
      </Router>
    </AuthProvider>
  );
}

export default App;
