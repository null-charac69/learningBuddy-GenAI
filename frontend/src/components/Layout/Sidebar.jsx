
import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiMessageSquare, FiGrid, FiUpload, FiCheckSquare, FiSettings } from 'react-icons/fi';

const Sidebar = () => {
  return (
    <div className="w-64 bg-secondary text-text h-screen p-5 flex flex-col shadow-lg">
      <div className="text-2xl font-bold mb-10 text-highlight">LearningBuddy</div>
      <nav>
        <ul>
          <li className="mb-4">
            <NavLink to="/chat" className={({ isActive }) => `flex items-center p-3 rounded-lg transition-colors ${isActive ? 'bg-highlight text-white' : 'hover:bg-accent'}`}>
              <FiMessageSquare className="mr-3" /> Chat
            </NavLink>
          </li>
          <li className="mb-4">
            <NavLink to="/dashboard" className={({ isActive }) => `flex items-center p-3 rounded-lg transition-colors ${isActive ? 'bg-highlight text-white' : 'hover:bg-accent'}`}>
              <FiGrid className="mr-3" /> Dashboard
            </NavLink>
          </li>
          <li className="mb-4">
            <NavLink to="/upload" className={({ isActive }) => `flex items-center p-3 rounded-lg transition-colors ${isActive ? 'bg-highlight text-white' : 'hover:bg-accent'}`}>
              <FiUpload className="mr-3" /> Upload
            </NavLink>
          </li>
          <li className="mb-4">
            <NavLink to="/quiz" className={({ isActive }) => `flex items-center p-3 rounded-lg transition-colors ${isActive ? 'bg-highlight text-white' : 'hover:bg-accent'}`}>
              <FiCheckSquare className="mr-3" /> Quiz
            </NavLink>
          </li>
          <li className="mb-4">
            <NavLink to="/settings" className={({ isActive }) => `flex items-center p-3 rounded-lg transition-colors ${isActive ? 'bg-highlight text-white' : 'hover:bg-accent'}`}>
              <FiSettings className="mr-3" /> Settings
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
