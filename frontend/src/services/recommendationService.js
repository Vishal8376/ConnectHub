import client from '../api/client';

export const recommendationService = {
  getRecommendations: async () => {
    const response = await client.get('/recommendations');
    // Returns List<RecommendationResponse> already sorted descending by matchScore in backend
    return response.data;
  },
};
