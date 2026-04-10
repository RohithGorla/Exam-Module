import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

// Exams
export const getExams = () => API.get('/exams');
export const getExam = (id) => API.get(`/exams/${id}`);
export const createExam = (data) => API.post('/exams', data);
export const updateExam = (id, data) => API.put(`/exams/${id}`, data);
export const deleteExam = (id) => API.delete(`/exams/${id}`);

// Questions
export const getQuestions = (examId) => API.get(`/exams/${examId}/questions`);
export const addQuestion = (examId, data) => API.post(`/exams/${examId}/questions`, data);
export const updateQuestion = (id, data) => API.put(`/questions/${id}`, data);
export const deleteQuestion = (id) => API.delete(`/questions/${id}`);

// Submit & Results
export const submitExam = (examId, answers) => API.post(`/exams/${examId}/submit`, { answers });
export const getMyResults = () => API.get('/results/my');
export const getAllResults = () => API.get('/results');
export const getAnalytics = () => API.get('/results/analytics');

export default API;
