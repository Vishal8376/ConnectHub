import client from './client';

export const getConversationId = async (userId) => {
  const response = await client.get(`/messages/conversation/user/${userId}`);
  return response.data; // returns conversation ID number
};

export const getMessagesByConversation = async (conversationId) => {
  const response = await client.get(`/messages/conversation/${conversationId}`);
  return response.data;
};

export const getUnreadSummary = async () => {
  const response = await client.get('/messages/unread-summary');
  return response.data;
};

export const markConversationAsRead = async (conversationId) => {
  const response = await client.put(`/messages/conversation/${conversationId}/read`);
  return response.data;
};

export const getUnreadCountForConversation = async (conversationId) => {
  const response = await client.get(`/messages/conversation/${conversationId}/unread-count`);
  return response.data;
};
