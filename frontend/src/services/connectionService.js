import client from '../api/client';

export const connectionService = {
  getConnections: async () => {
    const response = await client.get('/connections');
    return response.data; // List<ConnectionUserResponse>
  },

  getReceivedRequests: async () => {
    const response = await client.get('/connections/received');
    return response.data; // List<ConnectionUserResponse>
  },

  getSentRequests: async () => {
    const response = await client.get('/connections/sent');
    return response.data; // List<ConnectionUserResponse>
  },

  sendConnectionRequest: async (userId) => {
    const response = await client.post(`/connections/${userId}`);
    return response.data; // ConnectionResponse
  },

  acceptConnection: async (connectionId) => {
    const response = await client.put(`/connections/${connectionId}/accept`);
    return response.data; // ConnectionResponse
  },

  rejectConnection: async (connectionId) => {
    const response = await client.put(`/connections/${connectionId}/reject`);
    return response.data; // ConnectionResponse
  },

  removeConnection: async (connectionId) => {
    await client.delete(`/connections/${connectionId}`);
  },
};
