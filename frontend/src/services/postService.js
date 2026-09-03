import client from '../api/client';

export const postService = {
  getAllPosts: async () => {
    const response = await client.get('/posts');
    return response.data; // List<PostResponse>
  },

  getPostById: async (id) => {
    const response = await client.get(`/posts/${id}`);
    return response.data; // PostResponse
  },

  getPostsByCommunity: async (communityId) => {
    const response = await client.get(`/posts/community/${communityId}`);
    return response.data; // List<PostResponse>
  },

  createPost: async (postData) => {
    // { title, content, imageUrl, communityId }
    const response = await client.post('/posts', postData);
    return response.data; // PostResponse
  },

  updatePost: async (id, updateData) => {
    // { title, content, imageUrl }
    const response = await client.put(`/posts/${id}`, updateData);
    return response.data; // PostResponse
  },

  deletePost: async (id) => {
    await client.delete(`/posts/${id}`);
  },
};
