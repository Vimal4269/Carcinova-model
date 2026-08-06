import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api'
});

// Optionally add interceptors here to append tokens if needed in the future

export default api;
