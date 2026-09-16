import { Client } from '@stomp/stompjs';

class StompService {
  constructor() {
    this.client = null;
    this.subscription = null;
    this.onMessageCallback = null;
    this.isConnected = false;
  }

  connect(token, onMessageReceived, onError) {
    if (this.client && this.client.active) {
      return;
    }

    const apiUrl = import.meta.env.VITE_API_URL || 'https://connecthub-0h9a.onrender.com/api';
    let wsUrl;
    if (apiUrl.startsWith('http://') || apiUrl.startsWith('https://')) {
      const parsedUrl = new URL(apiUrl);
      const wsProtocol = parsedUrl.protocol === 'https:' ? 'wss:' : 'ws:';
      wsUrl = `${wsProtocol}//${parsedUrl.host}/ws`;
    } else {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      wsUrl = `${protocol}//${window.location.host}/ws`;
    }

    this.client = new Client({
      brokerURL: wsUrl,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = () => {
      this.isConnected = true;
      this.subscription = this.client.subscribe(
        '/user/queue/messages',
        (message) => {
          try {
            const body = JSON.parse(message.body);
            if (this.onMessageCallback) {
              this.onMessageCallback(body);
            }
          } catch (e) {
            console.error('Failed to parse STOMP message:', e);
          }
        }
      );
    };

    this.client.onStompError = (frame) => {
      this.isConnected = false;
      if (onError) {
        onError(frame.headers['message'] || 'WebSocket connection error');
      }
    };

    this.client.onWebSocketClose = () => {
      this.isConnected = false;
    };

    this.onMessageCallback = onMessageReceived;
    this.client.activate();
  }

  sendMessage(receiverId, content) {
    if (!this.client || !this.client.active) {
      throw new Error('WebSocket is not connected');
    }

    this.client.publish({
      destination: '/app/chat',
      body: JSON.stringify({
        receiverId: Number(receiverId),
        content,
      }),
    });
  }

  disconnect() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
    this.isConnected = false;
  }
}

export const stompService = new StompService();
