import client from './client'

export function login(payload) {
  return client.post('/users/login', payload).then((res) => res.data)
}

export function register(payload) {
  return client.post('/users/register', payload).then((res) => res.data)
}
