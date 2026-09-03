import client from '../api/client';

export const authService = {
  login: async (email, password) => {
    const response = await client.post('/users/login', { email, password });
    return response.data; // { token }
  },

  register: async (userData) => {
    const response = await client.post('/users/register', userData);
    return response.data; // UserResponse
  },

  getCurrentUser: async () => {
    const response = await client.get('/users/me');
    return response.data; // UserProfileResponse
  },

  updateProfile: async (updateData) => {
    const response = await client.put('/users/me', updateData);
    return response.data; // UserProfileResponse
  },
};
