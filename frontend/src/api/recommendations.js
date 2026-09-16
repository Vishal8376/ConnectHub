import client from './client';
import { getConnections, getReceivedRequests, getSentRequests } from './connections';

export const getRecommendations = async () => {
  const response = await client.get('/recommendations');
  return response.data;
};

export const getFilteredRecommendations = async (currentUserId) => {
  const [recsData, connData, receivedData, sentData] = await Promise.all([
    client.get('/recommendations').then((res) => res.data).catch(() => []),
    getConnections().catch(() => []),
    getReceivedRequests().catch(() => []),
    getSentRequests().catch(() => []),
  ]);

  const excludeUserIds = new Set();
  if (currentUserId) {
    excludeUserIds.add(Number(currentUserId));
  }

  (connData || []).forEach((item) => {
    const uid = item.userId || item.id;
    if (uid) excludeUserIds.add(Number(uid));
  });

  (receivedData || []).forEach((item) => {
    const uid = item.userId || item.id;
    if (uid) excludeUserIds.add(Number(uid));
  });

  (sentData || []).forEach((item) => {
    const uid = item.userId || item.id;
    if (uid) excludeUserIds.add(Number(uid));
  });

  const filtered = (recsData || []).filter((item) => {
    const recUser = item.userResponse || item;
    const uid = recUser.userId || recUser.id;
    return uid && !excludeUserIds.has(Number(uid));
  });

  return filtered;
};
