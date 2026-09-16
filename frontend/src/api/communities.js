import client from './client';

export const getAllCommunities = async () => {
  const response = await client.get('/communities');
  return response.data;
};

export const getCommunityById = async (id) => {
  const response = await client.get(`/communities/${id}`);
  return response.data;
};

export const createCommunity = async (data) => {
  const response = await client.post('/communities', data);
  return response.data;
};

export const updateCommunity = async (id, data) => {
  const response = await client.put(`/communities/${id}`, data);
  return response.data;
};

export const deleteCommunity = async (id) => {
  const response = await client.delete(`/communities/${id}`);
  return response.data;
};

export const joinCommunity = async (id) => {
  const response = await client.post(`/communities/${id}/join`);
  return response.data;
};

export const leaveCommunity = async (id) => {
  const response = await client.delete(`/communities/${id}/leave`);
  return response.data;
};

export const createJoinRequest = async (communityId) => {
  const response = await client.post(`/communities/${communityId}/join-request`);
  return response.data;
};

export const getJoinRequests = async (communityId) => {
  const response = await client.get(`/communities/${communityId}/join-requests`);
  return response.data;
};

export const acceptJoinRequest = async (requestId) => {
  const response = await client.put(`/communities/join-requests/${requestId}/accept`);
  return response.data;
};

export const rejectJoinRequest = async (requestId) => {
  const response = await client.put(`/communities/join-requests/${requestId}/reject`);
  return response.data;
};

export const cancelJoinRequest = async (communityId) => {
  const response = await client.delete(`/communities/${communityId}/join-request`);
  return response.data;
};
