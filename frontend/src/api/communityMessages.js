import client from './client';

export const getCommunityMessages = async (communityId) => {
  const response = await client.get(`/communities/${communityId}/messages`);
  return response.data;
};
