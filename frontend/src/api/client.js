import axios from 'axios';

const client = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

client.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'An unexpected error occurred. Please try again.';

    if (error.response) {
      const data = error.response.data;
      if (typeof data === 'string') {
        message = data;
      } else if (data && typeof data === 'object') {
        if (data.message) {
          message = data.message;
        } else if (data.error) {
          message = data.error;
        } else {
          const fieldErrors = Object.entries(data)
            .map(([field, err]) => `${field}: ${err}`)
            .join(', ');
          if (fieldErrors) {
            message = fieldErrors;
          }
        }
      }
    } else if (error.message) {
      message = error.message;
    }

    return Promise.reject(new Error(message));
  }
);

export default client;
