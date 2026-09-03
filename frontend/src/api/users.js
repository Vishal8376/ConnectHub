import client from './client'

export function getMe() {
  return client.get('/users/me').then((res) => res.data)
}

export function updateMe(payload) {
  return client.put('/users/me', payload).then((res) => res.data)
}

export function searchUsers(params = {}) {
  const clean = {}
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      clean[key] = value
    }
  })
  return client.get('/users/search', { params: clean }).then((res) => res.data)
}
