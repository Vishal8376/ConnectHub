import client from './client';

export const getAllInterests = async () => {
  const response = await client.get('/interests');
  return response.data;
};

// Admin endpoints
export const createAdminInterest = async (data) => {
  const response = await client.post('/admin/interests', data);
  return response.data;
};

export const updateAdminInterest = async (id, data) => {
  const response = await client.put(`/admin/interests/${id}`, data);
  return response.data;
};

export const deleteAdminInterest = async (id) => {
  const response = await client.delete(`/admin/interests/${id}`);
  return response.data;
};
