import client from '../api/client';

export const communityService = {
  getAllCommunities: async () => {
    const response = await client.get('/communities');
    return response.data; // List<CommunityResponse>
  },

  getCommunityById: async (id) => {
    const response = await client.get(`/communities/${id}`);
    return response.data; // CommunityResponse
  },

  createCommunity: async (communityData) => {
    // { name, description, visibility, communityImage }
    const response = await client.post('/communities', communityData);
    return response.data; // CommunityResponse
  },

  updateCommunity: async (id, updateData) => {
    const response = await client.put(`/communities/${id}`, updateData);
    return response.data; // CommunityResponse
  },

  deleteCommunity: async (id) => {
    await client.delete(`/communities/${id}`);
  },

  joinCommunity: async (id) => {
    const response = await client.post(`/communities/${id}/join`);
    return response.data; // String message
  },

  leaveCommunity: async (id) => {
    const response = await client.delete(`/communities/${id}/leave`);
    return response.data; // String message
  },
};
