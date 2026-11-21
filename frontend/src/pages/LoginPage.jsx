import React from 'react';
import { Link } from 'react-router-dom';

const LoginPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
      <div className="bg-secondary p-8 rounded-xl shadow-lg max-w-md w-full border border-gray-700">
        <div className="text-4xl mb-4">🚧</div>
        <h2 className="text-2xl font-bold mb-2 text-text">Auth Under Construction</h2>
        <p className="text-gray-400 mb-6 text-sm">
          User authentication and cloud session sync are actively in development (WIP).
          All core features (RAG chat, doc indexing, quiz generator) are accessible without login during the alpha preview.
        </p>
        <Link
          to="/"
          className="inline-block bg-accent hover:bg-opacity-90 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          Explore Dashboard
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
