import axios from 'axios';

export const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
export const UNAUTHORIZED_EVENT = 'lb:unauthorized';

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Expired/invalid token anywhere -> tell AuthContext to log out.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isLogin = err.config?.url?.startsWith('/auth/login');
    if (err.response?.status === 401 && !isLogin) {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }
    return Promise.reject(err);
  }
);

/** Turn an axios error into a human-readable message. */
export const errorMessage = (err, fallback = 'Something went wrong') => {
  if (!err?.response) return 'Cannot reach the server. Is the backend running on port 8000?';
  const detail = err.response.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail[0]?.msg) {
    const field = detail[0].loc?.slice(-1)[0];
    return field ? `${field}: ${detail[0].msg}` : detail[0].msg;
  }
  return fallback;
};

// Auth
export const loginUser = (username, password) =>
  api.post('/auth/login', new URLSearchParams({ username, password }), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
export const registerUser = (username, email, password) =>
  api.post('/auth/register', { username, email, password });
export const getCurrentUser = () => api.get('/auth/me');
export const updateCurrentUser = (patch) => api.patch('/auth/me', patch);
export const changePassword = (current_password, new_password) =>
  api.post('/auth/me/password', { current_password, new_password });
export const deleteAccount = () => api.delete('/auth/me');

// Chat
export const sendChat = (message, history = [], documentIds = null) =>
  api.post('/chat', { message, history, document_ids: documentIds });

// Documents
export const listDocuments = () => api.get('/files');
export const uploadDocument = (file, onProgress) => {
  const form = new FormData();
  form.append('file', file);
  return api.post('/files/upload', form, {
    onUploadProgress: (e) => e.total && onProgress?.(Math.round((e.loaded * 100) / e.total)),
  });
};
export const deleteDocument = (id) => api.delete(`/files/${id}`);

// Quiz
export const generateQuiz = ({ topic, numQuestions = 5, difficulty = 'medium', useDocuments = true }) =>
  api.post('/quiz', { topic, num_questions: numQuestions, difficulty, use_documents: useDocuments });
export const submitQuizScore = (topic, score, correct, total) =>
  api.post('/progress/quiz-result', { topic, score, correct, total });

// Progress
export const getProgress = () => api.get('/progress');
export const getHealth = () => api.get('/health');

export default api;
