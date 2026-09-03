import client from './client'

export function getPosts() {
  return client.get('/posts').then((res) => res.data)
}

export function getPost(id) {
  return client.get(`/posts/${id}`).then((res) => res.data)
}

export function getPostsByCommunity(communityId) {
  return client.get(`/posts/community/${communityId}`).then((res) => res.data)
}

export function createPost(payload) {
  return client.post('/posts', payload).then((res) => res.data)
}

export function updatePost(id, payload) {
  return client.put(`/posts/${id}`, payload).then((res) => res.data)
}

export function deletePost(id) {
  return client.delete(`/posts/${id}`)
}
