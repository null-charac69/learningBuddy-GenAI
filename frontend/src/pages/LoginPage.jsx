import React, { useState } from 'react';
import { FiBookOpen, FiCheckSquare, FiMessageSquare } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { Alert } from '../components/common/ui';

const FEATURES = [
  { icon: FiBookOpen, text: 'Upload your notes, slides and textbooks' },
  { icon: FiMessageSquare, text: 'Ask questions and get answers cited from your material' },
  { icon: FiCheckSquare, text: 'Quiz yourself and see which topics need work' },
];

const LoginPage = () => {
  const { login, register, loading, error, setError } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const switchMode = (register) => {
    setIsRegister(register);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isRegister) await register(form.username.trim(), form.email.trim(), form.password);
    else await login(form.username.trim(), form.password);
  };

  return (
    <div className="min-h-screen bg-primary grid md:grid-cols-2">
      <section className="hidden md:flex flex-col justify-center px-12 lg:px-20 bg-secondary/40">
        <h1 className="text-4xl font-bold text-highlight mb-3">LearningBuddy</h1>
        <p className="text-lg text-text-secondary mb-10 max-w-md">
          Turn your own study material into a tutor that answers questions and quizzes you on it.
        </p>
        <ul className="space-y-5">
          {FEATURES.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-4">
              <span className="h-10 w-10 rounded-lg bg-highlight/20 text-highlight flex items-center justify-center">
                <Icon />
              </span>
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex items-center justify-center p-6">
        <div className="card p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-1">{isRegister ? 'Create your account' : 'Welcome back'}</h2>
          <p className="text-text-secondary text-sm mb-6">
            {isRegister ? 'It takes ten seconds.' : 'Sign in to continue studying.'}
          </p>

          <div className="flex mb-6 bg-accent rounded-lg p-1" role="tablist">
            {['Sign in', 'Register'].map((label, idx) => {
              const active = isRegister === (idx === 1);
              return (
                <button
                  key={label}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => switchMode(idx === 1)}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                    active ? 'bg-highlight text-white' : 'text-text-secondary hover:text-text'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {error && <div className="mb-4"><Alert>{error}</Alert></div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="label">Username</label>
              <input id="username" name="username" value={form.username} onChange={handleChange} required
                minLength={isRegister ? 3 : undefined} autoComplete="username" className="input" />
            </div>
            {isRegister && (
              <div>
                <label htmlFor="email" className="label">Email</label>
                <input id="email" type="email" name="email" value={form.email} onChange={handleChange} required
                  autoComplete="email" className="input" />
              </div>
            )}
            <div>
              <label htmlFor="password" className="label">Password</label>
              <input id="password" type="password" name="password" value={form.password} onChange={handleChange} required
                minLength={isRegister ? 6 : undefined} autoComplete={isRegister ? 'new-password' : 'current-password'}
                className="input" />
              {isRegister && <p className="text-xs text-text-secondary mt-1">At least 6 characters.</p>}
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default LoginPage;
