import client from './client'

export function getCommunities() {
  return client.get('/communities').then((res) => res.data)
}

export function getCommunity(id) {
  return client.get(`/communities/${id}`).then((res) => res.data)
}

export function createCommunity(payload) {
  return client.post('/communities', payload).then((res) => res.data)
}

export function updateCommunity(id, payload) {
  return client.put(`/communities/${id}`, payload).then((res) => res.data)
}

export function deleteCommunity(id) {
  return client.delete(`/communities/${id}`)
}

export function joinCommunity(id) {
  return client.post(`/communities/${id}/join`).then((res) => res.data)
}

export function leaveCommunity(id) {
  return client.delete(`/communities/${id}/leave`).then((res) => res.data)
}
