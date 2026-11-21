
import React from 'react';

const SettingsPage = () => {
  return (
    <div className="text-text">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <div className="bg-secondary p-8 rounded-lg shadow-lg">
        <form>
          <div className="mb-4">
            <label htmlFor="username" className="block text-text-secondary mb-2">Username</label>
            <input type="text" id="username" className="w-full bg-accent text-text rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-highlight" value="testuser" />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-text-secondary mb-2">Email</label>
            <input type="email" id="email" className="w-full bg-accent text-text rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-highlight" value="testuser@example.com" />
          </div>
          <div className="mb-4">
            <label htmlFor="learning_goals" className="block text-text-secondary mb-2">Learning Goals</label>
            <textarea id="learning_goals" className="w-full bg-accent text-text rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-highlight" rows="3">Python, FastAPI, React</textarea>
          </div>
          <button type="submit" className="bg-highlight text-white py-3 px-6 rounded-lg hover:bg-opacity-80 transition-colors">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
