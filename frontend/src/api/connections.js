import client from './client'

export function sendConnectionRequest(userId) {
  return client.post(`/connections/${userId}`).then((res) => res.data)
}

export function getReceivedRequests() {
  return client.get('/connections/received').then((res) => res.data)
}

export function getSentRequests() {
  return client.get('/connections/sent').then((res) => res.data)
}

export function getAcceptedConnections() {
  return client.get('/connections').then((res) => res.data)
}

export function acceptConnection(connectionId) {
  return client.put(`/connections/${connectionId}/accept`).then((res) => res.data)
}

export function rejectConnection(connectionId) {
  return client.put(`/connections/${connectionId}/reject`).then((res) => res.data)
}

export function removeConnection(connectionId) {
  return client.delete(`/connections/${connectionId}`)
}
