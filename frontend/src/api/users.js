import client from './client';

export const registerUser = async (data) => {
  const response = await client.post('/users/register', data);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await client.get('/users/me');
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await client.put('/users/me', data);
  return response.data;
};

export const searchUsers = async (params) => {
  const response = await client.get('/users/search', { params });
  return response.data;
};
