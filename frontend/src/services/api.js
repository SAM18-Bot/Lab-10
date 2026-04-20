import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000',
  timeout: 10000
});

export const uploadCsv = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await apiClient.post('/api/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
};

export const filterDataset = async (payload) => {
  const { data } = await apiClient.post('/api/filter', payload);
  return data;
};
