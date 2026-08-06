import axios from 'axios';

const CANDIDATES = [
  'http://localhost:5000/api',
  'http://10.0.2.2:5000/api',
  'http://192.168.137.215:5000/api',
  'https://carcinova-model.onrender.com/api'
];

let activeBaseURL = CANDIDATES[0];
let isDiscovered = false;

export const discoverWorkingAPI = async () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    activeBaseURL = import.meta.env.VITE_API_BASE_URL;
    return activeBaseURL;
  }

  for (const candidateUrl of CANDIDATES) {
    try {
      const testAxios = axios.create({ baseURL: candidateUrl, timeout: 2500 });
      const res = await testAxios.get('/history/cases');
      if (res.data && res.data.success !== undefined) {
        console.log(`[API Auto-Discovery] Connected to: ${candidateUrl}`);
        activeBaseURL = candidateUrl;
        isDiscovered = true;
        return candidateUrl;
      }
    } catch (e) {
      // Try next candidate
    }
  }

  isDiscovered = true;
  return activeBaseURL;
};

// Trigger immediate discovery in background
discoverWorkingAPI();

const api = axios.create({
  timeout: 20000,
});

api.interceptors.request.use(async (config) => {
  if (!isDiscovered) {
    await discoverWorkingAPI();
  }
  config.baseURL = activeBaseURL;
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
