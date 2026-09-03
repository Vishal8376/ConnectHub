import client from './client'

export function getInterests() {
  return client.get('/interests').then((res) => res.data)
}
