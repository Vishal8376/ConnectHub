import { useState, useEffect, useCallback } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

export const useConnections = () => {
  const { isAuthenticated } = useAuth();
  const [connections, setConnections] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchConnectionData = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const [connRes, recRes, sentRes] = await Promise.all([
        client.get('/connections'),
        client.get('/connections/received'),
        client.get('/connections/sent'),
      ]);
      setConnections(connRes.data || []);
      setReceivedRequests(recRes.data || []);
      setSentRequests(sentRes.data || []);
    } catch (err) {
      console.error('Failed to load connections:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchConnectionData();
  }, [fetchConnectionData]);

  // Derive relationship for a given userId
  const getRelationshipStatus = useCallback((targetUserId) => {
    if (!targetUserId) return { status: 'NONE', connectionId: null };

    // Check if accepted
    const acceptedMatch = connections.find(c => c.userId === targetUserId);
    if (acceptedMatch) {
      return { status: 'CONNECTED', connectionId: acceptedMatch.connectionId };
    }

    // Check if received pending request
    const receivedMatch = receivedRequests.find(c => c.userId === targetUserId);
    if (receivedMatch) {
      return { status: 'PENDING_RECEIVED', connectionId: receivedMatch.connectionId };
    }

    // Check if sent pending request
    const sentMatch = sentRequests.find(c => c.userId === targetUserId);
    if (sentMatch) {
      return { status: 'PENDING_SENT', connectionId: sentMatch.connectionId };
    }

    return { status: 'NONE', connectionId: null };
  }, [connections, receivedRequests, sentRequests]);

  // Actions
  const sendRequest = async (targetUserId) => {
    await client.post(`/connections/${targetUserId}`);
    await fetchConnectionData();
  };

  const acceptRequest = async (connectionId) => {
    await client.put(`/connections/${connectionId}/accept`);
    await fetchConnectionData();
  };

  const rejectRequest = async (connectionId) => {
    await client.put(`/connections/${connectionId}/reject`);
    await fetchConnectionData();
  };

  const removeConnection = async (connectionId) => {
    await client.delete(`/connections/${connectionId}`);
    await fetchConnectionData();
  };

  return {
    connections,
    receivedRequests,
    sentRequests,
    loading,
    error,
    refreshConnections: fetchConnectionData,
    getRelationshipStatus,
    sendRequest,
    acceptRequest,
    rejectRequest,
    removeConnection,
  };
};
