import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiBookOpen,
  FiCheckSquare,
  FiGrid,
  FiLogOut,
  FiMessageSquare,
  FiSettings,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: FiGrid },
  { to: '/library', label: 'Library', icon: FiBookOpen },
  { to: '/chat', label: 'Study Chat', icon: FiMessageSquare },
  { to: '/quiz', label: 'Quiz', icon: FiCheckSquare },
  { to: '/settings', label: 'Settings', icon: FiSettings },
];

const Sidebar = ({ open, onNavigate }) => {
  const { user, logout } = useAuth();

  return (
    <aside
      className={`${open ? 'flex' : 'hidden'} md:flex fixed md:sticky top-0 z-20 w-64 h-screen bg-secondary p-5 flex-col shadow-lg shrink-0`}
    >
      <div className="text-2xl font-bold mb-8 text-highlight">LearningBuddy</div>
      <nav className="flex-1">
        <ul className="space-y-2">
          {LINKS.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    isActive ? 'bg-highlight text-white' : 'hover:bg-accent'
                  }`
                }
              >
                <Icon /> {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="border-t border-accent pt-4">
        <p className="text-sm font-medium truncate">{user?.username}</p>
        <p className="text-xs text-text-secondary truncate mb-3">{user?.email}</p>
        <button onClick={logout} className="flex items-center gap-2 text-sm text-text-secondary hover:text-text">
          <FiLogOut /> Sign out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
