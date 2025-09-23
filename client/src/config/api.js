// API Configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://equipment-photo-pro.onrender.com'  // Your deployed Render backend
  : 'http://localhost:5001';

export const API_ENDPOINTS = {
  upload: `${API_BASE_URL}/api/upload`,
  download: `${API_BASE_URL}/api/download`,
  health: `${API_BASE_URL}/api/health`,
  aiStatus: `${API_BASE_URL}/api/ai-status`,
  prompt: `${API_BASE_URL}/api/prompt`,
  testProcess: `${API_BASE_URL}/api/test-process`,
  aiSuggestions: `${API_BASE_URL}/api/ai-suggestions`
};

export default API_BASE_URL;
