import client from './client';

export const sendConnectionRequest = async (userId) => {
  const response = await client.post(`/connections/${userId}`);
  return response.data;
};

export const getReceivedRequests = async () => {
  const response = await client.get('/connections/received');
  return response.data;
};

export const getSentRequests = async () => {
  const response = await client.get('/connections/sent');
  return response.data;
};

export const getConnections = async () => {
  const response = await client.get('/connections');
  return response.data;
};

export const acceptConnection = async (connectionId) => {
  const response = await client.put(`/connections/${connectionId}/accept`);
  return response.data;
};

export const rejectConnection = async (connectionId) => {
  const response = await client.put(`/connections/${connectionId}/reject`);
  return response.data;
};

export const removeConnection = async (connectionId) => {
  const response = await client.delete(`/connections/${connectionId}`);
  return response.data;
};
