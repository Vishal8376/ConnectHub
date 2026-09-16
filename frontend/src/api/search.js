import client from './client';

export const getAutocompleteSuggestions = async (query, options = {}) => {
  const response = await client.get('/search/autocomplete', {
    params: { q: query },
    signal: options.signal,
  });
  return response.data;
};
