import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login, register, loading, error } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    let success;
    if (isRegister) {
      success = await register(form.username, form.email, form.password);
    } else {
      success = await login(form.username, form.password);
    }
    if (success) navigate('/');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-primary">
      <div className="bg-secondary p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-700">
        {/* Logo / Title */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🧠</div>
          <h1 className="text-2xl font-bold text-text">LearningBuddy</h1>
          <p className="text-gray-400 text-sm mt-1">Your AI-powered study companion</p>
        </div>

        {/* Tab toggle */}
        <div className="flex mb-6 bg-accent rounded-lg p-1">
          <button
            onClick={() => setIsRegister(false)}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
              !isRegister ? 'bg-highlight text-white' : 'text-gray-400 hover:text-text'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsRegister(true)}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
              isRegister ? 'bg-highlight text-white' : 'text-gray-400 hover:text-text'
            }`}
          >
            Register
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-900/40 border border-red-700 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              className="w-full bg-accent text-text rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-highlight"
              placeholder="Enter username"
            />
          </div>

          {isRegister && (
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full bg-accent text-text rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-highlight"
                placeholder="Enter email"
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full bg-accent text-text rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-highlight"
              placeholder="Enter password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-highlight text-white py-3 rounded-lg font-medium hover:bg-opacity-80 transition-colors disabled:opacity-50"
          >
            {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-gray-500 text-xs mt-6">
          {isRegister ? 'Already have an account? ' : "Don't have an account? "}
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-highlight hover:underline"
          >
            {isRegister ? 'Sign In' : 'Register'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
