import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import LoadingSpinner from '../common/LoadingSpinner';
import { getCommunityMessages } from '../../api/communityMessages';
import { Client } from '@stomp/stompjs';

export default function CommunityChatTab({ community }) {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [connected, setConnected] = useState(false);

  const stompClientRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load history & setup STOMP subscription to community topic
  useEffect(() => {
    let isMounted = true;

    async function initCommunityChat() {
      setLoading(true);
      setError('');

      try {
        const history = await getCommunityMessages(community.id);
        if (!isMounted) return;
        setMessages(history || []);
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load community chat history');
        }
      } finally {
        if (isMounted) setLoading(false);
      }

      // Initialize STOMP Client
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
        if (!isMounted) return;
        setConnected(true);
        client.subscribe(`/topic/community/${community.id}`, (messageFrame) => {
          try {
            const incomingMsg = JSON.parse(messageFrame.body);
            if (isMounted) {
              setMessages((prev) => {
                if (prev.some((m) => m.id === incomingMsg.id)) return prev;
                return [...prev, incomingMsg];
              });
              scrollToBottom();
            }
          } catch (e) {
            console.error('Failed to parse community chat message:', e);
          }
        });
      };

      client.onStompError = (frame) => {
        if (isMounted) {
          setConnected(false);
          console.error('STOMP error in community chat:', frame);
        }
      };

      client.activate();
      stompClientRef.current = client;
    }

    initCommunityChat();

    return () => {
      isMounted = false;
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }
      setConnected(false);
    };
  }, [community.id, token]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    if (!stompClientRef.current || !stompClientRef.current.active) {
      alert('WebSocket is connecting... Please wait a moment.');
      return;
    }

    try {
      stompClientRef.current.publish({
        destination: '/app/community-chat',
        body: JSON.stringify({
          communityId: Number(community.id),
          content: inputMessage.trim(),
        }),
      });
      setInputMessage('');
    } catch (err) {
      alert(err.message || 'Failed to send message to community chat');
    }
  };

  return (
    <div className="bg-surface border border-outline-variant/30 rounded-3xl shadow-xs flex flex-col h-[600px] max-h-[75vh] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-low/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-secondary-container text-secondary flex items-center justify-center font-bold text-base flex-shrink-0">
            {community.name ? community.name[0].toUpperCase() : 'C'}
          </div>
          <div className="flex flex-col">
            <h3 className="font-headline-sm text-sm font-bold text-on-surface flex items-center gap-1.5">
              <span>{community.name} Chat</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Live Group Chat" />
            </h3>
            <span className="text-[11px] text-on-surface-variant font-medium">
              Shared Real-Time Community Room
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-semibold">
          <span className="material-symbols-outlined text-[16px] text-secondary">forum</span>
          <span>{messages.length} messages</span>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 bg-background/40">
        {loading ? (
          <LoadingSpinner label="Loading community chat messages..." />
        ) : error ? (
          <div className="p-4 bg-error-container/40 text-on-error-container rounded-2xl text-center text-xs font-medium">
            {error}
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-16 text-xs text-on-surface-variant font-medium">
            No messages in this community chat yet. Be the first member to say hello!
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === user?.id;
            return (
              <div
                key={msg.id || msg.sentAt}
                className={`flex gap-3 max-w-[80%] ${isMe ? 'self-end flex-row-reverse' : 'self-start'}`}
              >
                {!isMe && (
                  <Avatar src={msg.senderProfilePicture} name={msg.senderName} size="sm" className="mt-1 flex-shrink-0" />
                )}
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  {!isMe && (
                    <span className="text-[11px] font-bold text-on-surface-variant mb-0.5 px-1">
                      {msg.senderName}
                    </span>
                  )}
                  <div
                    className={`p-3 text-xs text-on-surface leading-relaxed shadow-xs ${
                      isMe
                        ? 'bg-primary text-on-primary rounded-2xl rounded-tr-xs'
                        : 'bg-surface-container-low border border-outline-variant/30 rounded-2xl rounded-tl-xs'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-on-surface-variant mt-1 px-1 font-medium">
                    {msg.sentAt ? new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 border-t border-outline-variant/20 bg-surface flex items-center gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={`Message ${community.name}...`}
          disabled={loading || !!error}
          className="flex-1 bg-surface-container-low focus:bg-surface-container-lowest border border-transparent focus:border-primary rounded-full px-4 py-2.5 text-xs text-on-surface outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={loading || !inputMessage.trim()}
          className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-xs active:scale-95 flex-shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">send</span>
        </button>
      </form>
    </div>
  );
}
