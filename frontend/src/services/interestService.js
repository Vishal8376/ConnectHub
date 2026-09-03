import client from '../api/client';

export const interestService = {
  getAllInterests: async () => {
    const response = await client.get('/interests');
    return response.data; // List<InterestResponse>
  },
};
