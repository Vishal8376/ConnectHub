import client from '../api/client';

export const userService = {
  searchUsers: async (filters = {}) => {
    const params = {};
    if (filters.name?.trim()) params.name = filters.name.trim();
    if (filters.college?.trim()) params.college = filters.college.trim();
    if (filters.profession?.trim()) params.profession = filters.profession.trim();
    if (filters.location?.trim()) params.location = filters.location.trim();
    if (filters.interestId) params.interestId = filters.interestId;

    const response = await client.get('/users/search', { params });
    return response.data; // List<UserSearchResponse>
  },
};
