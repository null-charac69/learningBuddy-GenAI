import axios from 'axios';

const API_BASE = 'http://localhost:8000/api/v1';

const api = axios.create({ baseURL: API_BASE });

// Attach token from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const loginUser = (username, password) => {
  const form = new URLSearchParams();
  form.append('username', username);
  form.append('password', password);
  return api.post('/auth/login', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
};
export const registerUser = (username, email, password) =>
  api.post('/auth/register', { username, email, password });
export const getCurrentUser = () => api.get('/auth/me');

// Chat
export const sendMessage = (message) => api.post('/chat', message);

// Files
export const uploadFile = (formData) =>
  api.post('/files/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

// Quiz
export const getQuiz = (topic) => api.get(`/quiz?topic=${encodeURIComponent(topic)}`);
export const submitQuizScore = (topic, score) =>
  api.post('/progress/quiz-result', { topic, score });

// Progress
export const getProgress = () => api.get('/progress');
