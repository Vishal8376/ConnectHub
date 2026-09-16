import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWebSocket } from '../../context/WebSocketContext';
import Avatar from '../common/Avatar';
import LoadingSpinner from '../common/LoadingSpinner';
import { getConversationId, getMessagesByConversation } from '../../api/messages';

export default function ChatWindow({ otherUser, onBack }) {
  const { user } = useAuth();
  const {
    sendMessage,
    subscribeToMessages,
    setActiveConversation,
    markRead,
    isConnected,
  } = useWebSocket();

  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleIncomingMessage = useCallback(
    (msg) => {
      if (
        (conversationId && Number(msg.conversationId) === Number(conversationId)) ||
        Number(msg.senderId) === Number(otherUser.id) ||
        Number(msg.receiverId) === Number(otherUser.id)
      ) {
        setMessages((prev) => {
          // Deduplicate by message ID or temp id matching content and sender
          if (prev.some((m) => m.id === msg.id)) return prev;
          const filtered = prev.filter(
            (m) => !(typeof m.id === 'string' && m.id.startsWith('temp-') && m.content === msg.content && m.senderId === msg.senderId)
          );
          return [...filtered, msg];
        });
        scrollToBottom();
        if (conversationId) {
          markRead(conversationId);
        }
      }
    },
    [conversationId, otherUser.id, markRead, scrollToBottom]
  );

  useEffect(() => {
    let isMounted = true;

    async function initChat() {
      setLoading(true);
      setError('');

      try {
        const convId = await getConversationId(otherUser.id);
        if (!isMounted) return;
        setConversationId(convId);
        setActiveConversation(convId);

        const history = await getMessagesByConversation(convId);
        if (!isMounted) return;
        setMessages(history || []);

        // Mark current conversation as read
        await markRead(convId);
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Must be connected to exchange direct messages.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initChat();

    return () => {
      isMounted = false;
      setActiveConversation(null);
    };
  }, [otherUser.id, setActiveConversation, markRead]);

  // Subscribe to global STOMP messages
  useEffect(() => {
    const unsubscribe = subscribeToMessages(handleIncomingMessage);
    return () => {
      unsubscribe();
    };
  }, [subscribeToMessages, handleIncomingMessage]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    try {
      const text = inputMessage.trim();
      const tempId = `temp-${Date.now()}`;

      sendMessage(otherUser.id, text);

      const tempMsg = {
        id: tempId,
        senderId: user.id,
        receiverId: otherUser.id,
        content: text,
        sentAt: new Date().toISOString(),
        conversationId,
        isRead: false,
      };

      setMessages((prev) => [...prev, tempMsg]);
      setInputMessage('');
      scrollToBottom();
    } catch (err) {
      alert(err.message || 'Failed to send message over WebSocket');
    }
  };

  return (
    <div className="bg-surface border border-outline-variant/30 rounded-3xl shadow-xs flex flex-col h-[650px] max-h-[80vh] overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-low/50">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
          )}
          <Avatar src={otherUser.profilePicture} name={otherUser.fullName} size="md" showPresence isPresent />
          <div className="flex flex-col">
            <h3 className="font-headline-sm text-sm font-bold text-on-surface">{otherUser.fullName}</h3>
            <span className="text-[11px] text-secondary font-semibold flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span>{isConnected ? 'Direct Conversation (Connected)' : 'Connecting...'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 bg-background/40">
        {loading ? (
          <LoadingSpinner label="Loading conversation history..." />
        ) : error ? (
          <div className="p-4 bg-error-container/40 text-on-error-container rounded-2xl text-center text-xs font-medium">
            {error}
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-16 text-xs text-on-surface-variant font-medium">
            No messages yet. Send a greeting to start chatting with {otherUser.fullName}!
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === user.id;
            return (
              <div
                key={msg.id || msg.sentAt}
                className={`flex flex-col max-w-[75%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}
              >
                <div
                  className={`p-3.5 text-xs text-on-surface leading-relaxed shadow-xs ${
                    isMe
                      ? 'bg-primary text-on-primary rounded-2xl rounded-tr-xs'
                      : 'bg-surface-container-low border border-outline-variant/30 rounded-2xl rounded-tl-xs'
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-[10px] text-on-surface-variant mt-1 px-1 font-medium flex items-center gap-1">
                  <span>
                    {msg.sentAt ? new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                  {isMe && (
                    <span className="material-symbols-outlined text-[12px] text-primary">
                      {msg.isRead ? 'done_all' : 'done'}
                    </span>
                  )}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Form */}
      <form onSubmit={handleSend} className="p-3 border-t border-outline-variant/20 bg-surface flex items-center gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={`Message ${otherUser.fullName}...`}
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
