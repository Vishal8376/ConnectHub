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

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws`;

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
