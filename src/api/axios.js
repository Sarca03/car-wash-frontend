import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.DEV 
    ? '/api' 
    : 'https://car-wash-api-bh2k.onrender.com/api',
  headers: { 'Content-Type': 'application/json' },
});

// REQUEST — dodaj token ako postoji
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// RESPONSE — ako je 401, izloguj korisnika
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    const message =
      error.response?.data?.error || error.message || 'Došlo je do greške';
    console.error('API greška:', message);
    return Promise.reject(error);
  }
);

export default api;