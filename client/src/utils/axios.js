import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true, // Ensures cookies are sent with requests
});

// Add a response interceptor
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default instance;
