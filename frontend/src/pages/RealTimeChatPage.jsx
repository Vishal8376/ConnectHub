import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Send, MessageSquare, ShieldCheck, User } from 'lucide-react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useConnections } from '../hooks/useConnections';
import { stompService } from '../services/stompService';
import AppLayout from '../components/layout/AppLayout';
import Avatar from '../components/common/Avatar';
import EmptyState from '../components/common/EmptyState';

const RealTimeChatPage = () => {
  const { currentUser, token } = useAuth();
  const { connections, loading: loadingConnections } = useConnections();
  const location = useLocation();

  const [selectedUser, setSelectedUser] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of conversation
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle incoming STOMP messages
  const handleIncomingMessage = (msg) => {
    // msg: { id, conversationId, senderId, receiverId, content, sentAt }
    if (
      selectedUser &&
      (msg.senderId === selectedUser.userId || msg.receiverId === selectedUser.userId)
    ) {
      setMessages((prev) => {
        // Prevent duplicate appending
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      if (msg.conversationId && !conversationId) {
        setConversationId(msg.conversationId);
      }
    }
  };

  // Connect STOMP WebSocket client
  useEffect(() => {
    if (token) {
      stompService.connect(
        token,
        (msg) => {
          setWsConnected(true);
          handleIncomingMessage(msg);
        },
        (err) => {
          console.error('STOMP Error:', err);
          setWsConnected(false);
        }
      );
      setWsConnected(true);
    }

    return () => {
      // Keep connection active or clean up if leaving chat screen
      // stompService.disconnect();
    };
  }, [token, selectedUser, conversationId]);

  // Select user from navigation state if available
  useEffect(() => {
    if (location.state?.selectedUserId && connections.length > 0) {
      const match = connections.find((c) => c.userId === location.state.selectedUserId);
      if (match) {
        setSelectedUser(match);
      }
    } else if (!selectedUser && connections.length > 0) {
      setSelectedUser(connections[0]);
    }
  }, [location.state, connections]);

  // Fetch REST message history when active user changes
  useEffect(() => {
    if (!selectedUser) return;

    const loadHistory = async () => {
      setLoadingHistory(true);
      setMessages([]);
      setConversationId(null);

      try {
        // GET /api/messages/conversation/user/{userId} returns conversationId
        const convRes = await client.get(`/messages/conversation/user/${selectedUser.userId}`);
        const cId = convRes.data;
        setConversationId(cId);

        // Fetch messages for conversationId
        const msgRes = await client.get(`/messages/conversation/${cId}`);
        setMessages(msgRes.data || []);
      } catch (err) {
        // If 404, conversation doesn't exist yet (first message will create it)
        setConversationId(null);
        setMessages([]);
      } finally {
        setLoadingHistory(false);
      }
    };

    loadHistory();
  }, [selectedUser]);

  // Send message via STOMP
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedUser) return;

    const content = messageInput.trim();
    setMessageInput('');

    try {
      stompService.sendMessage(selectedUser.userId, content);

      // Optimistic local preview
      const optimisticMsg = {
        id: Date.now(),
        conversationId: conversationId || null,
        senderId: currentUser.id,
        receiverId: selectedUser.userId,
        content,
        sentAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimisticMsg]);
    } catch (err) {
      alert('Failed to send message over WebSocket. Please verify connection.');
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    try {
      return new Date(isoString).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return '';
    }
  };

  return (
    <AppLayout>
      <div className="bg-surface-elevated border border-hairline rounded-card overflow-hidden shadow-xs h-[750px] flex flex-col md:flex-row">
        {/* Left Pane: Connections List */}
        <div className="w-full md:w-80 shrink-0 border-r border-hairline flex flex-col bg-surface-elevated">
          <div className="p-4 border-b border-hairline space-y-1">
            <h2 className="font-headline-sm text-ink-primary font-bold text-base flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-clay" />
              1:1 Direct Messages
            </h2>
            <p className="text-xs text-ink-muted">Accepted connections only</p>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-hairline">
            {loadingConnections ? (
              <div className="p-4 text-xs text-ink-subtle animate-pulse">Loading contacts...</div>
            ) : connections.length === 0 ? (
              <div className="p-6 text-center text-xs text-ink-muted space-y-2">
                <p>No active connections to message.</p>
                <p className="text-ink-subtle">Connect with people first in Discover.</p>
              </div>
            ) : (
              connections.map((conn) => {
                const isSelected = selectedUser?.userId === conn.userId;
                return (
                  <div
                    key={conn.userId}
                    onClick={() => setSelectedUser(conn)}
                    className={`p-3.5 flex items-center gap-3 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-clay/10 border-l-4 border-clay'
                        : 'hover:bg-surface-recessed'
                    }`}
                  >
                    <Avatar src={conn.profilePicture} name={conn.fullName} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm text-ink-primary truncate">
                        {conn.fullName}
                      </p>
                      <p className="text-xs text-ink-muted truncate">Connected Contact</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Active Thread */}
        <div className="flex-1 flex flex-col min-w-0 bg-canvas">
          {selectedUser ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-hairline bg-surface-elevated flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar src={selectedUser.profilePicture} name={selectedUser.fullName} size="md" />
                  <div className="min-w-0">
                    <h3 className="font-headline-sm text-ink-primary font-bold text-base truncate">
                      {selectedUser.fullName}
                    </h3>
                    <div className="flex items-center gap-1 text-[11px] text-sage font-medium">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Connected Contact</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message Stream */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-canvas">
                {loadingHistory ? (
                  <div className="text-center py-8 text-xs text-ink-subtle animate-pulse">
                    Loading conversation history...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center py-12">
                    <EmptyState
                      icon={MessageSquare}
                      title={`Say hello to ${selectedUser.fullName}`}
                      description="Start a direct conversation with your connection."
                    />
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isSelf = msg.senderId === currentUser?.id;
                    return (
                      <div
                        key={msg.id || `${msg.sentAt}-${Math.random()}`}
                        className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                            isSelf
                              ? 'bg-clay-wash text-clay font-medium rounded-br-xs border border-clay/10'
                              : 'bg-surface-recessed text-ink-primary rounded-bl-xs border border-hairline'
                          }`}
                        >
                          {msg.content}
                        </div>
                        <span className="text-[10px] text-ink-subtle px-1 mt-0.5">
                          {formatTime(msg.sentAt)}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Composer Bar */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 border-t border-hairline bg-surface-elevated flex items-center gap-2"
              >
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={`Message ${selectedUser.fullName}...`}
                  className="flex-1 px-4 py-3 rounded-control bg-surface-recessed text-ink-primary text-sm placeholder-ink-subtle border border-hairline focus:outline-none focus:bg-canvas focus:border-clay"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="p-3 rounded-control bg-clay text-white hover:bg-clay-hover disabled:opacity-40 transition-colors shadow-sm"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex items-center justify-center p-8">
              <EmptyState
                icon={MessageSquare}
                title="Select a contact"
                description="Choose an accepted connection from the left panel to start messaging."
              />
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default RealTimeChatPage;
