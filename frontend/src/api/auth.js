import client from './client';

export const loginUser = async (credentials) => {
  const response = await client.post('/users/login', credentials);
  return response.data;
};
