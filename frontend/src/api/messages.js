import client from './client'

export function getConversationIdWithUser(userId) {
  return client.get(`/messages/conversation/user/${userId}`).then((res) => res.data)
}

export function getMessagesByConversation(conversationId) {
  return client
    .get(`/messages/conversation/${conversationId}`)
    .then((res) => res.data)
}
