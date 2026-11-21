import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ChatPage from './pages/ChatPage';
import DashboardPage from './pages/DashboardPage';
import FileUploadPage from './pages/FileUploadPage';
import QuizPage from './pages/QuizPage';
import SettingsPage from './pages/SettingsPage';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';

function App() {
  return (
    <Router>
      <div className="flex bg-primary text-text">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="p-6 flex-1">
            <Routes>
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/upload" element={<FileUploadPage />} />
              <Route path="/quiz" element={<QuizPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/" element={<ChatPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;