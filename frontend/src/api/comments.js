import client from './client';

export const getCommentsByPost = async (postId) => {
  const response = await client.get(`/posts/${postId}/comments`);
  return response.data;
};

export const createComment = async (postId, data) => {
  const response = await client.post(`/posts/${postId}/comments`, data);
  return response.data;
};

export const updateComment = async (commentId, data) => {
  const response = await client.put(`/comments/${commentId}`, data);
  return response.data;
};

export const deleteComment = async (commentId) => {
  const response = await client.delete(`/comments/${commentId}`);
  return response.data;
};
