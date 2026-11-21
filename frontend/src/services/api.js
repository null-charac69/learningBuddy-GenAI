import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:8000/api/v1" });

export const sendMessage = (message) => API.post("/chat/chat", message);
export const uploadFile = (file) => API.post("/files/upload", file, { headers: { "Content-Type": "multipart/form-data" } });
export const getQuiz = (topic) => API.get(`/quiz/quiz?topic=${topic}`);
export const getProgress = () => API.get("/progress/progress");