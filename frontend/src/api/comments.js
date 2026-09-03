import client from './client'

export function getComments(postId) {
  return client.get(`/posts/${postId}/comments`).then((res) => res.data)
}

export function createComment(postId, content) {
  return client.post(`/posts/${postId}/comments`, { content }).then((res) => res.data)
}

export function updateComment(id, content) {
  return client.put(`/comments/${id}`, { content }).then((res) => res.data)
}

export function deleteComment(id) {
  return client.delete(`/comments/${id}`)
}
