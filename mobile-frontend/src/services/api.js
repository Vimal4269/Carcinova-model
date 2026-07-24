import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000, // 5 seconds timeout to fail quickly instead of loading infinitely
});

export const getCasesList = async () => {
  try {
    const response = await api.get('/history/cases');
    return response.data;
  } catch (error) {
    console.error("Error fetching cases list:", error);
    throw error;
  }
};

export const getCaseDetails = async (caseId) => {
  try {
    const response = await api.get(`/cases/${caseId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching case details:", error);
    throw error;
  }
};

export const classifyCase = async (formData) => {
  try {
    const response = await api.post('/cases/classify', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    console.error("Error classifying case:", error);
    throw error;
  }
};
