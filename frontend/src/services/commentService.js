import client from '../api/client';

export const commentService = {
  getCommentsByPost: async (postId) => {
    const response = await client.get(`/posts/${postId}/comments`);
    return response.data; // List<CommentResponse>
  },

  createComment: async (postId, content) => {
    const response = await client.post(`/posts/${postId}/comments`, { content });
    return response.data; // CommentResponse
  },

  updateComment: async (commentId, content) => {
    const response = await client.put(`/comments/${commentId}`, { content });
    return response.data; // CommentResponse
  },

  deleteComment: async (commentId) => {
    await client.delete(`/comments/${commentId}`);
  },
};
