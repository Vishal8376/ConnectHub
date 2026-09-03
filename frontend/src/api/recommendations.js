import client from './client'

export function getRecommendations() {
  return client.get('/recommendations').then((res) => res.data)
}
