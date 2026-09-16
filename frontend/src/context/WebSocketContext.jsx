import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import { useAuth } from './AuthContext';
import { getUnreadSummary, markConversationAsRead } from '../api/messages';

const WebSocketContext = createContext();

export function WebSocketProvider({ children }) {
  const { user, token } = useAuth();
  const [unreadConversationCount, setUnreadConversationCount] = useState(0);
  const [unreadSummary, setUnreadSummary] = useState({
    totalUnreadMessages: 0,
    unreadConversationCount: 0,
    conversations: [],
  });
  const [isConnected, setIsConnected] = useState(false);

  const stompClientRef = useRef(null);
  const activeConversationIdRef = useRef(null);
  const messageListenersRef = useRef(new Set());

  // Fetch unread summary from API
  const refreshUnreadSummary = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getUnreadSummary();
      if (data) {
        setUnreadSummary(data);
        setUnreadConversationCount(data.unreadConversationCount || 0);
      }
    } catch (err) {
      console.error('Failed to fetch unread summary:', err);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshUnreadSummary();
    } else {
      setUnreadSummary({ totalUnreadMessages: 0, unreadConversationCount: 0, conversations: [] });
      setUnreadConversationCount(0);
    }
  }, [user, refreshUnreadSummary]);

  // STOMP connection lifecycle (single persistent connection)
  useEffect(() => {
    if (!user || !token) {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }
      setIsConnected(false);
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws`;

    const client = new Client({
      brokerURL: wsUrl,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      setIsConnected(true);
      client.subscribe('/user/queue/messages', (messageFrame) => {
        try {
          const msg = JSON.parse(messageFrame.body);
          handleIncomingOneToOneMessage(msg);
        } catch (e) {
          console.error('Failed to parse STOMP 1-to-1 message:', e);
        }
      });
    };

    client.onStompError = (frame) => {
      setIsConnected(false);
      console.error('STOMP error:', frame);
    };

    client.onWebSocketClose = () => {
      setIsConnected(false);
    };

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }
      setIsConnected(false);
    };
  }, [user, token]);

  const handleIncomingOneToOneMessage = useCallback(
    (msg) => {
      // Notify active message listeners if matching
      messageListenersRef.current.forEach((listener) => {
        try {
          listener(msg);
        } catch (e) {
          console.error('Error in message listener:', e);
        }
      });

      const activeConvId = activeConversationIdRef.current;
      const isForActiveConv = activeConvId && Number(activeConvId) === Number(msg.conversationId);

      if (isForActiveConv) {
        // Automatically mark as read if conversation is active
        markConversationAsRead(msg.conversationId).catch(() => {});
      } else {
        // Update unread state for inactive conversation
        setUnreadSummary((prev) => {
          const conversations = [...(prev.conversations || [])];
          const existingIndex = conversations.findIndex((c) => Number(c.conversationId) === Number(msg.conversationId));

          let newUnreadConversationCount = prev.unreadConversationCount || 0;

          if (existingIndex >= 0) {
            conversations[existingIndex] = {
              ...conversations[existingIndex],
              unreadCount: (conversations[existingIndex].unreadCount || 0) + 1,
            };
          } else {
            conversations.push({
              conversationId: msg.conversationId,
              userId: msg.senderId,
              unreadCount: 1,
            });
            newUnreadConversationCount += 1;
          }

          setUnreadConversationCount(newUnreadConversationCount);

          return {
            totalUnreadMessages: (prev.totalUnreadMessages || 0) + 1,
            unreadConversationCount: newUnreadConversationCount,
            conversations,
          };
        });
      }
    },
    []
  );

  const subscribeToMessages = useCallback((listener) => {
    messageListenersRef.current.add(listener);
    return () => {
      messageListenersRef.current.delete(listener);
    };
  }, []);

  const setActiveConversation = useCallback((convId) => {
    activeConversationIdRef.current = convId;
  }, []);

  const markRead = useCallback(async (conversationId) => {
    if (!conversationId) return;
    try {
      await markConversationAsRead(conversationId);
      setUnreadSummary((prev) => {
        const conversations = (prev.conversations || []).filter(
          (c) => Number(c.conversationId) !== Number(conversationId)
        );
        const newUnreadConversationCount = conversations.length;
        setUnreadConversationCount(newUnreadConversationCount);
        return {
          ...prev,
          unreadConversationCount: newUnreadConversationCount,
          conversations,
        };
      });
    } catch (err) {
      console.error('Failed to mark conversation as read:', err);
    }
  }, []);

  const sendMessage = useCallback((receiverId, content) => {
    if (!stompClientRef.current || !stompClientRef.current.active) {
      throw new Error('WebSocket connection is not active.');
    }
    stompClientRef.current.publish({
      destination: '/app/chat',
      body: JSON.stringify({
        receiverId: Number(receiverId),
        content,
      }),
    });
  }, []);

  return (
    <WebSocketContext.Provider
      value={{
        unreadConversationCount,
        unreadSummary,
        refreshUnreadSummary,
        subscribeToMessages,
        setActiveConversation,
        markRead,
        sendMessage,
        isConnected,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}
