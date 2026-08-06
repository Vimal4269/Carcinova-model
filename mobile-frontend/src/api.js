import axios from 'axios';

const getBaseURL = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // On Android device / emulator, 10.0.2.2 connects to host PC localhost:5000
  if (typeof window !== 'undefined') {
    const isAndroid = window.Capacitor?.getPlatform() === 'android' ||
                      navigator.userAgent.includes('Android') ||
                      window.location.protocol === 'file:';

    if (isAndroid) {
      return 'http://10.0.2.2:5000/api';
    }
  }

  return 'http://localhost:5000/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
});

export default api;
