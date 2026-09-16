import client from './client';

export const getAllPosts = async () => {
  const response = await client.get('/posts');
  return response.data;
};

export const getPostById = async (id) => {
  const response = await client.get(`/posts/${id}`);
  return response.data;
};

export const getPostsByCommunity = async (communityId) => {
  const response = await client.get(`/posts/community/${communityId}`);
  return response.data;
};

export const createPost = async (data) => {
  const response = await client.post('/posts', data);
  return response.data;
};

export const updatePost = async (id, data) => {
  const response = await client.put(`/posts/${id}`, data);
  return response.data;
};

export const deletePost = async (id) => {
  const response = await client.delete(`/posts/${id}`);
  return response.data;
};

export const likePost = async (postId) => {
  const response = await client.post(`/posts/${postId}/like`);
  return response.data;
};

export const unlikePost = async (postId) => {
  const response = await client.delete(`/posts/${postId}/like`);
  return response.data;
};
